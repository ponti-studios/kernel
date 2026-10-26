import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Every studio skill sits beside the others; there is no repo checkout and no build
// step. Config parsing, providers and usage handling all come from studio-core.
import { apiKey, setting } from '../../../studio-core/scripts/lib/config.mjs';

export { setting };
export { apiKey };

const SKILLS = join(import.meta.dirname, '..', '..', '..');
const CORE = join(SKILLS, 'studio-core', 'scripts/lib');
// Locates the studio speech toolchain and reads podcast sources.
//
// The ONLY place that knows where the implementation lives.

const STUDIO = setting('STUDIO_ROOT', 'studio_root', () => join(homedir(), 'Developer', 'studio'));

export function studioRoot() {
  return setting('STUDIO_ROOT', 'studio_root', () => SKILLS);
}

const MODULES = {
  config: () => import(join(CORE, 'config.mjs')),
  providers: async () => ({
    ...(await import(join(CORE, 'images.mjs'))),
    ...(await import(join(CORE, 'video.mjs'))),
    ...(await import(join(CORE, 'speech.mjs'))),
    ...(await import(join(CORE, 'text.mjs'))),
    ...(await import(join(CORE, 'media.mjs'))),
    ...(await import(join(CORE, 'usage.mjs'))),
  }),
  editorial: () => import(join(SKILLS, 'studio-scenes', 'scripts/lib/schema.mjs')),
  universe: () => import(join(SKILLS, 'studio-universe', 'scripts/lib/compile.mjs')),
};

export async function load(which) {
  const mod = MODULES[which];
  if (!mod) throw new Error(`unknown module '${which}' (have: ${Object.keys(MODULES).join(', ')})`);
  return mod();
}



// Speech is priced per prompt token; for narration the token count tracks the
// text length closely, so a character count is a defensible order-of-magnitude
// estimate. It is labelled as an estimate wherever it is printed.
export async function speechPricePerToken(model) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models?output_modalities=speech', {
      headers: { Authorization: `Bearer ${apiKey()}` },
    });
    if (!res.ok) return undefined;
    const record = ((await res.json()).data ?? []).find((m) => m.id === model);
    const value = Number(record?.pricing?.prompt);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

const clean = (s) => s.replace(/\s+/g, ' ').trim();

// A podcast source becomes an ordered list of speakable segments. Supported:
//  - a studio-video YouTube script: {title, hook, segments:[{heading, script}], callToAction}
//  - a studio-essay / studio-script draft:  {title, content} or {title, sections:[{title, body}]}
//  - markdown text: split on #/## headings, else paragraphs
//  - an explicit array: [{id?, text, voice?}]
export function readPodcastSource(path) {
  const raw = readFileSync(path, 'utf8');
  const trimmed = raw.trim();

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    return parsed.map((s, i) => ({
      id: s.id ?? `part-${i + 1}`,
      label: s.label ?? s.id ?? `Part ${i + 1}`,
      text: clean(s.text ?? s.script ?? ''),
      voice: s.voice,
    })).filter((s) => s.text);
  }

  if (trimmed.startsWith('{')) {
    const doc = JSON.parse(trimmed);
    const d = doc.draft ?? doc;
    const out = [];
    if (d.hook) out.push({ id: 'hook', label: 'Hook', text: clean(d.hook) });
    if (Array.isArray(d.segments)) {
      d.segments.forEach((seg, i) =>
        out.push({
          id: `segment-${i + 1}`,
          label: seg.heading ?? `Segment ${i + 1}`,
          text: clean(seg.script ?? seg.body ?? ''),
          voice: seg.voice,
        }),
      );
    } else if (Array.isArray(d.sections)) {
      d.sections.forEach((sec, i) =>
        out.push({ id: `section-${i + 1}`, label: sec.title ?? `Section ${i + 1}`, text: clean(sec.body ?? '') }),
      );
    } else if (d.content) {
      return splitMarkdown(d.content);
    }
    if (d.callToAction) out.push({ id: 'cta', label: 'Call to action', text: clean(d.callToAction) });
    return out.filter((s) => s.text);
  }

  return splitMarkdown(raw);
}

function splitMarkdown(text) {
  const byHeading = text.split(/\n(?=#{1,3} )/).map((chunk) => {
    const lines = chunk.split('\n');
    const first = lines[0] ?? '';
    const isHeading = /^#{1,3} /.test(first);
    const body = isHeading ? lines.slice(1).join('\n') : chunk;
    return { label: isHeading ? first.replace(/^#{1,3} /, '').trim() : undefined, text: clean(body) };
  });
  const usable = byHeading.filter((s) => s.text.length > 0);
  if (usable.length > 1) {
    return usable.map((s, i) => ({ id: `part-${i + 1}`, label: s.label ?? `Part ${i + 1}`, text: s.text }));
  }
  // No headings: paragraphs, grouped so a segment is never one short line.
  const paras = text.split(/\n\s*\n/).map(clean).filter(Boolean);
  const groups = [];
  let buffer = '';
  for (const p of paras) {
    buffer = buffer ? `${buffer} ${p}` : p;
    if (buffer.length >= 400) {
      groups.push(buffer);
      buffer = '';
    }
  }
  if (buffer) groups.push(buffer);
  return groups.map((g, i) => ({ id: `part-${i + 1}`, label: `Part ${i + 1}`, text: g }));
}
