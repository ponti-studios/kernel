// Deterministic prompt compiler — ported from
// `packages/universe/src/compile.ts` (registry + frame spec -> prompt).
//
// PORT CONTRACT: this file must first reproduce the TypeScript compiler's output
// BYTE-FOR-BYTE for every fixture. That fidelity is the only thing that makes the
// later rewrite trustworthy: with a byte-exact port, any subsequent difference in
// output is a deliberate change rather than an accident of translation.
//
// Same inputs always yield byte-identical output. Refuses with a named
// CompileError code when the spec violates the contract.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export class CompileError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = 'CompileError';
    this.code = code;
  }
}

export function loadRegistry(rootDir) {
  return JSON.parse(readFileSync(join(rootDir, 'registry', 'registry.json'), 'utf8'));
}

export function loadSpec(specPath) {
  return JSON.parse(readFileSync(specPath, 'utf8'));
}

export function extract(rootDir, bibleRelpath, rule) {
  const text = readFileSync(join(rootDir, bibleRelpath), 'utf8');
  if (!text.includes(rule.start_marker)) {
    throw new CompileError('MARKER_NOT_FOUND', `${bibleRelpath}: ${rule.start_marker}`);
  }
  if (!text.includes(rule.end_marker)) {
    throw new CompileError('MARKER_NOT_FOUND', `${bibleRelpath}: ${rule.end_marker}`);
  }
  const s = text.indexOf(rule.start_marker) + rule.start_marker.length;
  const e = text.indexOf(rule.end_marker);
  if (e <= s) {
    throw new CompileError('MARKER_ORDER', `${bibleRelpath}: end marker before start`);
  }
  let block = text.slice(s, e).trim();
  if (rule.strip_blockquote_prefix) {
    block = block
      .split('\n')
      .map((line) => line.replace(/^>\s?/, ''))
      .join('\n');
  }
  if (rule.strip_outer_quotes && block.length >= 2) {
    if (block.startsWith('"') && block.endsWith('"')) {
      block = block.slice(1, -1);
    }
  }
  return block;
}

function displayName(chars, cid) {
  return chars[cid]?.display_name ?? cid;
}

function propAnchorToken(anchor) {
  return (anchor.split(':')[0] ?? anchor).trim();
}

export function propClauses(spec, chars) {
  const lines = [];
  for (const p of spec.props ?? []) {
    const label = p.item.split('_').join(' ');
    const anchor = p.anchor ?? '';
    const token = propAnchorToken(anchor);
    const desc =
      (p.description ?? '').trim() ||
      (anchor.includes(':') ? anchor.split(':').slice(1).join(':').trim() : anchor);
    const owner = displayName(chars, p.owner);
    lines.push(`PROP — ${label}: ${desc} [owner: ${owner}; anchor: ${token}]`);
    if (p.state) {
      lines.push(`STATE — ${label}: ${p.state}`);
    }
    if (p.contains) {
      lines.push(`CONTAINS — ${label}: ${displayName(chars, p.contains)} is inside it.`);
    }
  }
  return lines;
}

function checkBlockEdits(spec) {
  for (const [cname, edits] of Object.entries(spec.block_edits ?? {})) {
    if (typeof edits !== 'object' || edits === null || Array.isArray(edits)) {
      throw new CompileError('INVALID_SPEC', `spec.block_edits[${cname}] must be an object`);
    }
    const omits = edits.omit_sentences ?? [];
    if (!Array.isArray(omits) || !omits.every((x) => typeof x === 'string')) {
      throw new CompileError(
        'INVALID_SPEC',
        `spec.block_edits[${cname}].omit_sentences must be a list of strings`,
      );
    }
  }
}

export function validate(spec, reg) {
  const chars = reg.characters;
  const required = [
    'frame',
    'title',
    'set',
    'register',
    'master',
    'floorplan',
    'cast',
    'moment',
    'environment',
    'lighting',
    'colour',
    'negatives',
  ];
  const record = spec;
  for (const f of required) {
    if (!(f in record)) {
      throw new CompileError('MISSING_FIELD', `spec lacks ${f}`);
    }
  }
  const master = spec.master ?? {};
  for (const f of ['width', 'height', 'aspect_ratio']) {
    if (!(f in master)) {
      throw new CompileError('MISSING_FIELD', `spec.master lacks ${f}`);
    }
  }
  const fp = spec.floorplan;
  if (
    !fp ||
    typeof fp.camera !== 'string' ||
    typeof fp.anchors !== 'object' ||
    fp.anchors === null ||
    Object.keys(fp.anchors).length === 0
  ) {
    throw new CompileError('INVALID_SPEC', 'spec.floorplan needs camera + anchors');
  }
  if (!Array.isArray(spec.cast) || spec.cast.length === 0) {
    throw new CompileError('INVALID_SPEC', 'spec.cast must be a non-empty list');
  }
  if ('props' in record && spec.props !== undefined && !Array.isArray(spec.props)) {
    throw new CompileError('INVALID_SPEC', 'spec.props must be a list');
  }
  for (const f of ['denylist', 'shared_outfits']) {
    const v = spec[f];
    if (v !== undefined && (!Array.isArray(v) || !v.every((x) => typeof x === 'string'))) {
      throw new CompileError('INVALID_SPEC', `spec.${f} must be a list of strings`);
    }
  }
  if (
    'block_overrides' in record &&
    (typeof spec.block_overrides !== 'object' ||
      spec.block_overrides === null ||
      Array.isArray(spec.block_overrides))
  ) {
    throw new CompileError('INVALID_SPEC', 'spec.block_overrides must be an object');
  }
  checkBlockEdits(spec);
  const anchors = new Set(Object.keys(fp.anchors));
  const counts = new Map();
  for (const e of spec.cast) {
    if (typeof e !== 'object' || e === null || Array.isArray(e)) {
      throw new CompileError('INVALID_SPEC', `cast entry is not an object: ${JSON.stringify(e)}`);
    }
    const oid = e.outfit_id;
    if (oid !== undefined && oid !== null) {
      const list = counts.get(oid) ?? [];
      list.push(e.character);
      counts.set(oid, list);
    }
  }
  for (const [oid, names] of counts) {
    if (names.length > 1 && !(spec.shared_outfits ?? []).includes(oid)) {
      throw new CompileError('SHARED_OUTFIT', `${oid} assigned to ${names.join(',')}`);
    }
  }
  spec.cast.forEach((e, i) => {
    const tag = `cast[${i}]`;
    const name = e.character;
    if (!(name in chars)) {
      throw new CompileError('UNKNOWN_CHARACTER', `${tag}: ${JSON.stringify(name)}`);
    }
    const c = chars[name];
    const hasOutfits = c.outfits !== undefined && Object.keys(c.outfits).length > 0;
    const oid = e.outfit_id;
    if (oid === undefined || (oid === null && hasOutfits)) {
      throw new CompileError('MISSING_FIELD', `${tag} (${name}) lacks outfit_id`);
    }
    if (oid !== undefined && oid !== null && !(oid in (c.outfits ?? {}))) {
      throw new CompileError('UNKNOWN_OUTFIT', `${tag} (${name}): ${JSON.stringify(oid)}`);
    }
    for (const f of ['anchor', 'depth', 'action', 'gaze_target']) {
      if (!e[f] || !String(e[f]).trim()) {
        throw new CompileError('MISSING_FIELD', `${tag} (${name}) lacks ${f}`);
      }
    }
    if (![...anchors].some((a) => e.anchor.includes(a))) {
      throw new CompileError('UNDEFINED_ANCHOR', `${tag} (${name}): ${JSON.stringify(e.anchor)}`);
    }
  });
  const castNames = new Set(spec.cast.map((e) => e.character));
  for (const key of Object.keys(spec.block_overrides ?? {})) {
    if (!castNames.has(key)) {
      throw new CompileError('INVALID_SPEC', `spec.block_overrides[${key}] matches no cast member`);
    }
  }
  for (const cname of Object.keys(spec.block_edits ?? {})) {
    if (!castNames.has(cname)) {
      throw new CompileError('INVALID_SPEC', `spec.block_edits[${cname}] matches no cast member`);
    }
  }
  const seenItems = new Map();
  (spec.props ?? []).forEach((p, j) => {
    if (typeof p !== 'object' || p === null || Array.isArray(p)) {
      throw new CompileError('INVALID_SPEC', `props[${j}] is not an object: ${JSON.stringify(p)}`);
    }
    if (!p.item) {
      throw new CompileError('MISSING_FIELD', `props[${j}] lacks item`);
    }
    if (!p.owner) {
      throw new CompileError('OWNERLESS_PROP', `props[${j}]: ${JSON.stringify(p.item)}`);
    }
    if (![...anchors].some((a) => (p.anchor ?? '').includes(a))) {
      throw new CompileError('UNDEFINED_ANCHOR', `props[${j}]: ${JSON.stringify(p.anchor)}`);
    }
    for (const field of ['description', 'state', 'contains']) {
      if (p[field] !== undefined && typeof p[field] !== 'string') {
        throw new CompileError('INVALID_SPEC', `props[${j}].${field} must be a string`);
      }
    }
    if (!castNames.has(p.owner)) {
      throw new CompileError(
        'UNKNOWN_PROP_OWNER',
        `props[${j}] (${p.item}): ${JSON.stringify(p.owner)} is not in cast`,
      );
    }
    if (p.contains && !castNames.has(p.contains)) {
      throw new CompileError(
        'UNKNOWN_PROP_CAPTIVE',
        `props[${j}] (${p.item}): ${JSON.stringify(p.contains)} is not in cast`,
      );
    }
    const prev = seenItems.get(p.item);
    if (prev !== undefined && prev !== p.owner) {
      throw new CompileError('DOUBLE_OWNER', `${JSON.stringify(p.item)} owned by ${prev} and ${p.owner}`);
    }
    seenItems.set(p.item, p.owner);
    if (p.item.toLowerCase().includes('net')) {
      const state = (p.state ?? '').trim();
      if (!state) {
        throw new CompileError('TRAP_STATE_MISSING', `props[${j}] (${p.item}): net needs a state clause`);
      }
      if (!p.contains) {
        throw new CompileError('TRAP_CAPTIVE_MISSING', `props[${j}] (${p.item}): net needs a captive (contains)`);
      }
      const text = [p.anchor ?? '', state, p.description ?? ''].join(' ').toLowerCase();
      if (!text.includes('four') || !text.includes('corner')) {
        throw new CompileError('TRAP_ANCHORS_MISSING', `props[${j}] (${p.item}): net needs four anchored corners`);
      }
      if (!['inside', 'over', 'around', 'encloses', 'covers', 'holds'].some((w) => state.toLowerCase().includes(w))) {
        throw new CompileError(
          'TRAP_CAPTIVE_NOT_ENCLOSED',
          `props[${j}] (${p.item}): state must place the captive inside the net`,
        );
      }
    }
  });
  const prose = [['moment', spec.moment ?? '']];
  spec.cast.forEach((e, i) => {
    prose.push([`cast[${i}].action`, e.action]);
  });
  for (const phrase of spec.denylist ?? []) {
    for (const [label, t] of prose) {
      if (t.toLowerCase().includes(phrase.toLowerCase())) {
        throw new CompileError('DENYLISTED_PHRASE', `${JSON.stringify(phrase)} in ${label}`);
      }
    }
  }
}

export function scaleClause(cast, chars) {
  const hs = [];
  for (const e of cast) {
    const h = chars[e.character]?.height_cm;
    if (h && e.in_scale !== false) {
      hs.push([chars[e.character]?.display_name ?? e.character, h]);
    }
  }
  if (hs.length === 0) {
    throw new CompileError('INVALID_SPEC', 'no scalable figure in cast');
  }
  hs.sort((a, b) => b[1] - a[1]);
  const top = hs[0];
  const rest = hs
    .slice(1)
    .map(([n, h]) => `${n} (${h}cm)`)
    .join(', ');
  const lines = [`SCALE: ${top[0]} is ${top[1]}cm — the tallest in this frame; ${rest}.`];
  const byH = new Map();
  for (const [n, h] of hs) {
    const list = byH.get(h) ?? [];
    list.push(n);
    byH.set(h, list);
  }
  for (const h of [...byH.keys()].sort((a, b) => a - b)) {
    const names = byH.get(h);
    if (names.length > 1) {
      lines.push(`${names.join(' and ')} stand at exactly the same height (${h}cm).`);
    }
  }
  return lines.join('\n');
}

export function ownershipClauses(spec, chars) {
  const out = [];
  for (const e of spec.cast) {
    const oid = e.outfit_id;
    if (oid) {
      const short = chars[e.character]?.outfits?.[oid]?.short;
      const name = chars[e.character]?.display_name ?? e.character;
      out.push(`The ${short} appears exactly once in this frame, on ${name}.`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// POSITIVE VOICE
//
// Image models do not reliably represent negation: naming a thing raises the
// odds of it appearing, whether or not the sentence says "no". The legacy
// compiler shipped 51 negation words per frame, including handing every
// character the OTHER characters' garments as prohibitions ("never the deep-red
// wrap dress" appears in Lucy's and Wyatt's lines) — an invitation, not a
// prohibition. Positive voice states what IS, attributes garments only to their
// owner, and expresses absence by omission.
//
// Verbatim bible blocks are canon text this compiler does not own, so their
// negations are MEASURED and REPORTED rather than silently shipped. With
// { strictPositives: true } an unrewritten block becomes a compile refusal.
// ---------------------------------------------------------------------------

const NEGATIVE_WORDS = /\b(no|never|not|none|without|nothing|nobody|nowhere|cannot|don't|doesn't|isn't)\b/gi;

// Exact-ish conversions for the negative idioms that appear in frame specs.
// Anything unmatched is reported, never silently dropped: dropping a constraint
// without a positive replacement would lose information.
const CONTENT_CONVERSIONS = [
  // Counts must read as directives. "exactly one X" inside descriptive prose is
  // weak — plural nouns in description invite plural rendering.
  [/^exactly one ([a-z ]+) appears in the frame$/i,
   (m) => `exactly one ${m[1]} in the whole frame — one, and none besides`],
  [/^no ([a-z ]+) appears in the frame$/i, (m) => `one ${m[1].trim()} only, in the frame`],
  [/no readable text|no text|no lettering|no words|no caption|no logo|no watermark/i,
   'every surface is plain and unlettered — the screen shows soft abstract light, signs and cups are plain coloured shapes'],
  [/no blood|no gore|no wounds?|no weapons?/i,
   'clean costumes and harmless theatrical props; nobody is hurt'],
  [/nobody looks at the camera|no one looks at the camera|does not look at the camera/i,
   null], // absence is stated positively per character via gaze_target
  [/^no ([A-Z][a-z]+) in this frame/i, null], // absence by omission: never name them
  [/never looks frightened/i, 'composed and unbothered'],
  [/no tattoos/i, 'his hands are clean bare skin'],
];

function convertNegatives(negatives) {
  const kept = [];
  const converted = [];
  const dropped = [];
  for (const raw of negatives) {
    // A negative item often carries a positive assertion with a prohibitory
    // tail: "Wyatt wears only his cardigan — never the Passenger's greatcoat".
    // Keep the positive half, drop the tail — the tail is the part that names
    // another character's garment and invites the swap.
    const phrase = raw.replace(/\s*(?:—|-|;)\s*never the [^;]*/gi, '').trim();
    if (phrase !== raw.trim()) {
      converted.push(phrase || 'the stated outfits are the only garments present');
      continue;
    }
    let matched = false;
    for (const [re, replacement] of CONTENT_CONVERSIONS) {
      const m = phrase.match(re);
      if (m) {
        matched = true;
        if (typeof replacement === 'function') converted.push(replacement(m));
        else if (replacement) converted.push(replacement);
        else dropped.push(phrase);
        break;
      }
    }
    if (!matched) kept.push(phrase);
  }
  return { kept, converted, dropped };
}

// Count negation in canon text so the bible rewrite is measurable rather than
// a matter of opinion.
export function scanNegatives(text) {
  const hits = text.match(NEGATIVE_WORDS);
  return hits ? hits.length : 0;
}

function negativeReport(parts) {
  const findings = [];
  for (const part of parts) {
    const label = part.split(' — ')[0].split(':')[0];
    if (!/\(verbatim block\)|MASK \(verbatim/.test(label)) continue;
    const hits = scanNegatives(part);
    if (hits > 0) findings.push({ block: label, negations: hits });
  }
  return findings;
}

export function compileSpec(spec, reg, rootDir, options = {}) {
  const voice = options.voice ?? 'legacy';
  const positive = voice === 'positive';
  validate(spec, reg);
  const chars = reg.characters;
  const parts = [];
  const m = spec.master;
  parts.push(
    `FRAME ${spec.frame} — ${spec.title}. ${spec.set} set, ${spec.register} register. Master ${m.width}x${m.height}, ${m.aspect_ratio} portrait.`,
  );
  const fp = spec.floorplan;
  const geo = Object.entries(fp.anchors)
    .map(([k, v]) => `${k}: ${v}.`)
    .join(' ');
  parts.push(`SCENE — ${fp.camera}. ${geo}`);
  const outfitsInFrame = [
    ...new Set(
      spec.cast.flatMap((e) => {
        const short = e.outfit_id ? chars[e.character]?.outfits?.[e.outfit_id]?.short : undefined;
        return short ? [short] : [];
      }),
    ),
  ].sort();
  for (const e of spec.cast) {
    const name = chars[e.character]?.display_name ?? e.character;
    let clause = '';
    const oid = e.outfit_id;
    if (oid) {
      const short = chars[e.character]?.outfits?.[oid]?.short;
      // Legacy: name every other outfit in frame as a prohibition, which
      // mentions the wrong garments in the wrong character's line.
      const nevers = positive
        ? ''
        : outfitsInFrame
            .filter((o) => o !== short)
            .map((o) => `; never the ${o}`)
            .join('');
      clause = positive ? `, wearing the ${short}` : `, in the ${short}${nevers}`;
    }
    parts.push(`STAGING — ${name}${clause}: ${e.action} [${e.anchor} — ${e.depth}; gaze on ${e.gaze_target}]`);
  }
  parts.push(...propClauses(spec, chars));
  parts.push(`MOMENT — ${spec.moment}`);
  parts.push(`ENVIRONMENT INVENTORY: ${spec.environment}`);
  parts.push(`LIGHTING: ${spec.lighting}`);
  parts.push(`COLOUR: ${spec.colour}`);
  if (positive) {
    const { kept, converted } = convertNegatives(spec.positives ?? spec.negatives ?? []);
    const lines = [...converted, ...kept];
    if (lines.length > 0) {
      parts.push(
        'CONSTRAINTS — hold every one of these exactly as written: ' + lines.join('; ') + '.',
      );
    }
    parts.push(
      'WARDROBE — each named character wears exactly the outfit stated for them; the outfits in this frame are distinct in colour and silhouette.',
    );
  } else {
    parts.push('NEGATIVES: ' + spec.negatives.join('; ') + '.');
  }
  for (const e of spec.cast) {
    const c = chars[e.character];
    const name = c.display_name;
    if ('in_scale' in e && typeof e.in_scale !== 'boolean' && e.in_scale !== undefined) {
      throw new CompileError('INVALID_SPEC', `${name}: in_scale must be a boolean`);
    }
    let block = extract(rootDir, c.bible, c.identity_block);
    for (const sent of spec.block_edits?.[e.character]?.omit_sentences ?? []) {
      // Match tolerantly on whitespace: bibles are hand-wrapped prose, so a
      // reflowed paragraph must not silently break a spec that only meant to
      // drop a sentence. With an exact match this behaves identically, which is
      // why legacy parity against the reference compiler is preserved.
      const loose = new RegExp(sent.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'));
      const match = block.match(loose);
      const n = match ? (block.split(match[0]).length - 1) : 0;
      if (n === 0) {
        throw new CompileError('OMIT_NOT_FOUND', `${name}: sentence not in block`);
      }
      if (n > 1) {
        throw new CompileError('OMIT_AMBIGUOUS', `${name}: sentence occurs ${n}x`);
      }
      block = block.replace(match[0], '');
      while (block.includes('  ')) {
        block = block.split('  ').join(' ');
      }
    }
    const overrides = spec.block_overrides ?? {};
    const tailId = overrides[e.character];
    if (tailId) {
      const tail = c.tails?.[tailId];
      if (!tail) {
        throw new CompileError('UNKNOWN_TAIL', `${name} tail: ${JSON.stringify(tailId)}`);
      }
      block += ' ' + extract(rootDir, c.bible, tail);
    }
    parts.push(`${name.toUpperCase()} (verbatim block): ${block}`);
    if (c.mask_negative_block) {
      parts.push(
        `${name.toUpperCase()}'S MASK (verbatim, mandatory): ` + extract(rootDir, c.bible, c.mask_negative_block),
      );
    }
    const outfitId = e.outfit_id;
    if (outfitId) {
      parts.push(`${name.toUpperCase()}'S OUTFIT — ${outfitId}: ` + (c.outfits?.[outfitId]?.description ?? ''));
    }
  }
  parts.push(scaleClause(spec.cast, chars));
  parts.push(...ownershipClauses(spec, chars));
  parts.push(
    'RENDER GRADE — ANIMATED (verbatim in every frame): ' + (reg.shared_blocks['render_grade_animated'] ?? ''),
  );
  if (positive && options.strictPositives) {
    const findings = negativeReport(parts);
    if (findings.length > 0) {
      throw new CompileError(
        'NEGATIVE_PHRASE',
        'verbatim blocks still ship negation: ' +
          findings.map((f) => `${f.block} (${f.negations})`).join(', '),
      );
    }
  }
  if (typeof options.onReport === 'function') {
    options.onReport({ voice, negationInVerbatimBlocks: negativeReport(parts) });
  }
  return parts.join('\n\n') + '\n';
}
