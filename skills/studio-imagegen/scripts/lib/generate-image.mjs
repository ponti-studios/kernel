#!/usr/bin/env node
// Generate a frame image from a compiled frame spec — the studio image stage.
//
//   generate-image.mjs --spec <frame-spec.json> [--out <file>] [options]
//   generate-image.mjs --prompt <text|@file>    [--out <file>] [options]
//
// From a spec the prompt is COMPILED (studio-universe), never hand-written, and
// the spec's reference images are attached automatically resolved against the
// universe root.
//
// Options: --model <id>  --aspect <r>  --resolution 1K|2K  --format webp|png
//          --ref <path> (repeatable, --prompt only: attach reference images)
//          --dry-run  (compile and report, spend nothing)   --meta (write a .json sidecar)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { setting } from './resolve.mjs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { recordRender } from './ledger-bridge.mjs';
import { IMAGE_MIME, apiKey, load, readSpec, universeRoot } from './resolve.mjs';

const INBOX = setting('STUDIO_INBOX', 'inbox', () => join(homedir(), 'Pictures', 'imagegen', '_inbox'));
const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    spec: { type: 'string' },
    prompt: { type: 'string' },
    ref: { type: 'string', multiple: true },
    out: { type: 'string' },
    model: { type: 'string' },
    aspect: { type: 'string' },
    resolution: { type: 'string', default: '2K' },
    format: { type: 'string', default: 'webp' },
    'dry-run': { type: 'boolean', default: false },
    meta: { type: 'boolean', default: false },
    // Which compiler voice to use for --spec. Positive is the default; legacy
    // reproduces the app's output for A/B comparison.
    voice: { type: 'string', default: 'positive' },
  },
});

if (!values.spec && !values.prompt) {
  console.error('usage: generate-image.mjs --spec <frame-spec.json> | --prompt <text|@file> [--out <file>]');
  process.exit(2);
}
if (values.spec && values.prompt) {
  console.error('error: pass either --spec or --prompt, not both (a spec is compiled; a prompt is used verbatim)');
  process.exit(2);
}

const config = await load('config');
const env = config.loadEnv();
const { OpenRouterImageModel, OpenRouterImageError } = await load('providers');

const root = universeRoot();
let prompt;
let aspect = values.aspect ?? '4:5';
let references = [];
// --prompt carries no spec, so references are named explicitly. Bible art (a new
// turnaround sheet, say) needs the character's own canon attached or the design drifts.
const refPaths = values.ref ?? [];
let provenance;

if (values.spec) {
  const { compileSpec, loadRegistry } = await load('universe');
  let spec;
  try {
    spec = await readSpec(values.spec);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(2);
  }
  let registry;
  try {
    registry = loadRegistry(root);
  } catch (err) {
    console.error(`error: cannot load registry from ${root}: ${err.message}`);
    process.exit(2);
  }
  try {
    if (!['positive', 'legacy'].includes(values.voice)) {
      console.error(`error: --voice must be 'positive' or 'legacy' (got ${values.voice})`);
      process.exit(2);
    }
    prompt = compileSpec(spec, registry, root, { voice: values.voice });
  } catch (err) {
    console.error(`COMPILE REFUSED — ${err.code ?? 'error'}`);
    console.error(err.message);
    process.exit(1);
  }
  aspect = values.aspect ?? spec.master.aspect_ratio;
  // Reference images travel with the spec, resolved against the universe root —
  // a character with references must be generated with them attached.
  const missing = [];
  references = (spec.references ?? []).map((relPath) => {
    const abs = resolve(root, relPath);
    if (!existsSync(abs)) {
      missing.push(relPath);
      return null;
    }
    const mime = IMAGE_MIME[extname(abs).toLowerCase()] ?? 'image/png';
    return { path: abs, dataUrl: `data:${mime};base64,${readFileSync(abs).toString('base64')}` };
  }).filter(Boolean);
  if (missing.length) {
    console.error(`error: ${missing.length} reference image(s) missing under ${root}:`);
    for (const m of missing) console.error(`  ${m}`);
    process.exit(2);
  }
  provenance = {
    voice: values.voice,
    spec: resolve(values.spec),
    frame: spec.frame,
    title: spec.title,
    registry_version: registry.version,
    prompt_sha256: createHash('sha256').update(prompt).digest('hex'),
    references: references.map((r) => r.path),
  };
} else {
  prompt = values.prompt.startsWith('@') ? readFileSync(values.prompt.slice(1), 'utf8') : values.prompt;
  provenance = { prompt_sha256: createHash('sha256').update(prompt).digest('hex') };
}

const modelName = values.model ?? env.OPENROUTER_IMAGE_MODEL;
// HARD RULE: every generated image lands in one inbox, named
// <YYYYMMDD-HHMMSS>_<model>_<what>.<ext> (timestamp first, so the folder sorts),
// so a human can review everything in one
// place. Never a scratch dir, never a per-experiment folder. A model never judges
// Reference files named with --ref, resolved against the universe root.
const resolveRefs = (paths) => {
  const missing = [];
  const resolved = [];
  for (const relPath of paths) {
    const abs = relPath.startsWith('/') ? relPath : join(root, relPath);
    if (!existsSync(abs)) {
      missing.push(relPath);
      continue;
    }
    const ext = extname(abs).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
    resolved.push({ path: abs, dataUrl: `data:${mime};base64,${readFileSync(abs).toString('base64')}` });
  }
  if (missing.length) {
    console.error(`error: ${missing.length} --ref image(s) missing under ${root}:`);
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
  }
  return resolved;
};
if (refPaths.length) references = resolveRefs(refPaths);

// these images -- only the user does.
const outStamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/T/, '-')
  .slice(0, 15);
const modelSlug = modelName.replace(/^[^/]+\//, '').replace(/[^a-z0-9.]+/gi, '-');
// name the scene, not just the frame number: "scooby-the-trap-f3" reads better in a
// folder of 100 images than "frame-f3"
const titleSlug = String(provenance.title ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .split('-')
  .slice(0, 3)
  .join('-');
const whatSlug = values.spec
  ? [titleSlug || 'frame', `f${provenance.frame}`].join('-')
  : 'prompt';
const outPath =
  values.out ??
  join(INBOX, `${outStamp}_${modelSlug}_${whatSlug}.${values.format}`);

console.log(`model:       ${modelName}`);
console.log(`source:      ${values.spec ? `spec ${provenance.frame} — ${provenance.title}` : 'verbatim prompt'}`);
console.log(`voice:       ${values.spec ? values.voice : '(verbatim prompt)'}`);
console.log(`prompt:      ${prompt.length} chars, sha256 ${provenance.prompt_sha256.slice(0, 16)}…`);
console.log(`aspect:      ${aspect}`);
console.log(`resolution:  ${values.resolution}`);
console.log(`format:      ${values.format} (the endpoint may return png regardless)`);
console.log(`references:  ${references.length}${references.length ? ` — ${references.map((r) => { const parts = r.path.split('/'); return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`; }).join(', ')}` : ' (none attached)'}`);
console.log(`out:         ${outPath}`);

if (values['dry-run']) {
  console.log('\nDry run — compiled and resolved, nothing generated.');
  console.log('\n--- compiled prompt ---');
  console.log(prompt);
  process.exit(0);
}

const model = new OpenRouterImageModel(apiKey(), modelName);
let res;
try {
  res = await model.generate({
    model: modelName,
    prompt,
    references: references.map((r) => ({ dataUrl: r.dataUrl })),
    aspectRatio: aspect,
    resolution: values.resolution,
    outputFormat: values.format === 'png' ? 'png' : 'webp',
  });
} catch (err) {
  const kind = err instanceof OpenRouterImageError ? err.code : 'error';
  console.error(`\nimage failed (${kind}): ${err.message}`);
  process.exit(1);
}

// Actual cost, not an estimate. OpenRouter returns a usage block on the image
// response itself (cost + image tokens); /generation does not serve image
// generations, which is why every render used to log cost_usd: null.
const cost = res.usage
  ? {
      totalCost: res.usage.costUsd,
      promptTokens: res.usage.promptTokens,
      completionTokens: res.usage.completionTokens,
      totalTokens: res.usage.totalTokens,
    }
  : res.generationId
    ? await model.generationCost(res.generationId).catch(() => ({}))
    : {};

// Trust the returned bytes over the requested format.
const actualMime = res.mediaType ?? res.mimeType;
const actualFormat = actualMime === 'image/png' ? 'png' : extname(outPath).slice(1) || 'webp';
const finalPath = actualFormat !== extname(outPath).slice(1) ? outPath.replace(/\.[^.]+$/, `.${actualFormat}`) : outPath;

mkdirSync(dirname(finalPath), { recursive: true });
writeFileSync(finalPath, res.bytes);

const record = {
  ...provenance,
  model: modelName,
  aspect_ratio: aspect,
  resolution_requested: values.resolution,
  format_returned: actualFormat,
  mime: actualMime,
  generation_id: res.generationId ?? null,
  bytes: res.bytes.length,
  cost_usd: cost.totalCost ?? null,
  cost_source: res.usage?.costUsd !== undefined ? 'reported' : null,
  image_tokens: res.usage?.imageTokens ?? null,
  tokens: {
    prompt: cost.promptTokens ?? null,
    completion: cost.completionTokens ?? null,
    total: cost.totalTokens ?? null,
  },
  output: finalPath,
};

if (values.meta) {
  const metaPath = finalPath.replace(/\.[^.]+$/, '.json');
  writeFileSync(metaPath, JSON.stringify(record, null, 2));
  console.log(`meta:        ${metaPath}`);
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
writeFileSync(join(USAGE_DIR, `${stamp}-imagegen.json`), JSON.stringify({ kind: 'imagegen', ...record }, null, 2));

const recorded = await recordRender({
  model: modelName,
  resolution: values.resolution,
  promptSha256: record.prompt_sha256 ?? null,
  params: {
    aspect: record.aspect_ratio ?? null,
    resolution: record.resolution_requested ?? null,
    spec: record.spec ?? null,
    frame: record.frame ?? null,
    references: Array.isArray(record.references) ? record.references.length : 0,
  },
  generationId: res.generationId ?? null,
  costUsd: cost.totalCost ?? null,
  outputPath: finalPath,
  idempotencyKey: record.prompt_sha256 ? `${record.prompt_sha256}:${modelName}:${values.resolution}:${record.aspect_ratio}` : null,
});

console.log(`\nwrote:       ${finalPath} (${(res.bytes.length / 1024).toFixed(0)} KiB, ${actualFormat})`);
if (recorded) console.log(`ledger:      ${recorded.eventId} · ${recorded.cost.source} ${recorded.cost.usd === null ? 'unpriced' : '$' + recorded.cost.usd.toFixed(4)}`);
console.log(`cost:        ${cost.totalCost === undefined ? 'not reported by the provider' : `$${cost.totalCost.toFixed(4)}`}`);
console.log(`generation:  ${res.generationId ?? '(no id)'}`);
