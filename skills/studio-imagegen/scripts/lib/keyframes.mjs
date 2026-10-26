#!/usr/bin/env node
// One keyframe per shot, from the shot list.
//
//   keyframes.mjs --scenes <scenes.json> [--out <dir>] [--only <id>]
//                 [--model <id>] [--resolution 720p|1080p|2K] [--yes] [--dry-run]
//
// This is the cheap stage of the video pipeline: a still costs a fraction of a clip,
// so the look is settled here before any motion is bought. Named <scene-id>.png so
// studio-mediagen can pair stills with shots without a manifest.
//
// Dry run until --yes, same contract as the clip stage.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { apiKey, setting } from '../../../studio-core/scripts/lib/config.mjs';
import { OpenRouterImageError, OpenRouterImageModel } from '../../../studio-core/scripts/lib/images.mjs';

const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    scenes: { type: 'string' },
    out: { type: 'string' },
    only: { type: 'string' },
    model: { type: 'string' },
    resolution: { type: 'string', default: '2K' },
    aspect: { type: 'string', default: '16:9' },
    yes: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
});

if (!values.scenes) {
  console.error('usage: keyframes.mjs --scenes <scenes.json> --out <dir> [--only <id>] [--yes]');
  process.exit(2);
}

const scenes = JSON.parse(readFileSync(values.scenes, 'utf8'));
if (!Array.isArray(scenes) || scenes.length === 0) {
  console.error(`error: ${values.scenes} is not a shot list (expected an array of scenes)`);
  process.exit(2);
}

const model = values.model ?? setting('OPENROUTER_IMAGE_MODEL', 'model_image', 'qwen/qwen-image-2.1-turbo');
const outDir = values.out ?? join(homedir(), 'Pictures', 'imagegen', 'keyframes');
const selected = values.only ? scenes.filter((s) => s.id === values.only) : scenes;
if (values.only && selected.length === 0) {
  console.error(`error: no scene with id '${values.only}' (have: ${scenes.map((s) => s.id).join(', ')})`);
  process.exit(2);
}

console.log(`scenes:  ${selected.length} of ${scenes.length}`);
console.log(`model:   ${model}`);
console.log(`out:     ${outDir}`);
console.log(`shape:   ${values.aspect} at ${values.resolution}`);
console.log('');

for (const scene of selected) {
  const file = join(outDir, `${scene.id}.png`);
  const length = String(scene.prompt ?? '').length;
  console.log(`  ${String(scene.id).padEnd(18)} ${String(scene.duration_seconds ?? '?').padStart(4)}s  ${length} char prompt  -> ${file}`);
}

if (values['dry-run'] || !values.yes) {
  console.log('\nDry run — no stills generated. A keyframe is the cheap place to iterate; pass --yes to render.');
  console.log('While iterating on a look: --only <sceneId>.');
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const image = new OpenRouterImageModel(apiKey(), model);
const started = Date.now();
const calls = [];
const failures = [];

for (const scene of selected) {
  const file = join(outDir, `${scene.id}.png`);
  process.stdout.write(`  ${String(scene.id).padEnd(18)} rendering… `);
  try {
    const res = await image.generate({
      model,
      prompt: scene.prompt,
      references: [],
      aspectRatio: values.aspect,
      resolution: values.resolution,
      outputFormat: 'png',
    });
    writeFileSync(file, res.bytes);
    const costUsd = res.usage?.costUsd;
    calls.push({ id: scene.id, output: file, bytes: res.bytes.length, costUsd, requestId: res.generationId });
    console.log(`${(res.bytes.length / 1024).toFixed(0)} KB${costUsd === undefined ? ' (unpriced)' : ` — $${costUsd.toFixed(4)}`}`);
  } catch (err) {
    const kind = err instanceof OpenRouterImageError ? err.code : 'error';
    failures.push(`${scene.id} (${kind}): ${err.message}`);
    console.log(`FAILED ${kind}: ${err.message}`);
  }
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = join(USAGE_DIR, `${stamp}-imagegen-keyframes.json`);
const reported = calls.filter((c) => c.costUsd !== undefined);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: 'imagegen-keyframes',
      model,
      shape: { aspect: values.aspect, resolution: values.resolution },
      scenes: calls,
      failed: failures,
      // Absent cost is unpriced, never zero.
      cost_usd_reported: reported.length ? reported.reduce((a, c) => a + c.costUsd, 0) : null,
      unpriced: calls.length - reported.length,
      scene_file: values.scenes,
      seconds: (Date.now() - started) / 1000,
    },
    null,
    2,
  ),
);

console.log(`\nrendered: ${calls.length}/${selected.length}`);
if (reported.length) console.log(`cost:     $${reported.reduce((a, c) => a + c.costUsd, 0).toFixed(4)} reported by the provider`);
console.log(`log:      ${logPath}`);
if (failures.length) console.log(`failed:   ${failures.length}\n  ${failures.join('\n  ')}`);
process.exit(failures.length === 0 ? 0 : 1);
