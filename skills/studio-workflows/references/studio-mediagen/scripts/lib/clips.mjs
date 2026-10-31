#!/usr/bin/env node
// Generate one silent clip per scene.
//
//   clips.mjs --scenes <scenes.json> [--out <dir>] [--only <sceneId>]
//             [--model <id>] [--yes] [--dry-run]
//
// Video clips are the expensive stage of this pipeline, so this script is a
// DRY RUN until --yes is passed. Use --only <sceneId> to spend on a single
// scene while iterating on a prompt.
//
// Mirrors the app's video stage: the clip prompt is the scene prompt with
// CHARACTER_LOCK appended, 16:9, 720p, generateAudio false, duration rounded
// from duration_seconds (default 8s). Per-scene failures are collected; the run
// only fails if every scene fails.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { setting } from './resolve.mjs';
import { extname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { apiKey, load, readScenes } from './resolve.mjs';

// Sibling skills live beside this one.
const SKILLS = join(import.meta.dirname, '..', '..', '..');

const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    scenes: { type: 'string' },
    out: { type: 'string' },
    only: { type: 'string' },
    model: { type: 'string' },
    yes: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    'timeout-ms': { type: 'string' },
    keyframes: { type: 'string' },
  },
});

if (!values.scenes) {
  console.error('usage: clips.mjs --scenes <scenes.json> [--out <dir>] [--only <sceneId>] [--yes]');
  process.exit(2);
}

const config = await load('config');
const env = config.loadEnv();
const { CHARACTER_LOCK, OpenRouterVideoModel, OpenRouterVideoError } = await load('providers');

// Per-second pricing for the chosen model, so the dry run states real money
// instead of "it varies". The videos endpoint exposes pricing_skus; a model
// that doesn't (or a lookup failure) must not block the run.
async function perSecondUsd(model, { withAudio }) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/videos/models', {
      headers: { Authorization: `Bearer ${apiKey()}` },
    });
    if (!res.ok) return undefined;
    const record = ((await res.json()).data ?? []).find((m) => m.id === model);
    const skus = record?.pricing_skus ?? {};
    const raw = withAudio
      ? (skus.duration_seconds_with_audio ?? skus.duration_seconds)
      : (skus.duration_seconds ?? skus.text_to_video_duration_seconds_720p);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

const usd = (n) => `$${n.toFixed(2)}`;
const rateUsd = (n) => `$${n.toFixed(3)}`;

const scenes = await readScenes(values.scenes);
const selected = values.only ? scenes.filter((s) => s.id === values.only) : scenes;
if (values.only && selected.length === 0) {
  console.error(`error: no scene with id '${values.only}' (have: ${scenes.map((s) => s.id).join(', ')})`);
  process.exit(2);
}

const outDir = values.out ?? join(homedir(), 'Documents', 'studio-media', 'clips');
const clipModel = values.model ?? env.OPENROUTER_VIDEO_MODEL;
const timeoutMs = values['timeout-ms'] ? Number(values['timeout-ms']) : 10 * 60 * 1000;

console.log(`model:    ${clipModel}`);
console.log(`out:      ${outDir}`);
console.log(`clips:    ${selected.length}`);
console.log(`shipping: 16:9, 720p, silent (generateAudio false), CHARACTER_LOCK appended\n`);

const rate = await perSecondUsd(clipModel, { withAudio: false });

let estimated = 0;
for (const scene of selected) {
  const duration = Math.round(scene.duration_seconds ?? 8);
  const cost = rate ? duration * rate : undefined;
  if (cost !== undefined) estimated += cost;
  console.log(
    `  ${scene.id.padEnd(12)} ${String(duration).padStart(2)}s  ` +
      `${cost === undefined ? '     ?' : usd(cost).padStart(7)}  ` +
      `${scene.prompt.slice(0, 60)}${scene.prompt.length > 60 ? '…' : ''}`,
  );
}

if (rate) {
  console.log(`\nrate:     ${rateUsd(rate)}/second (silent) — ${selected.length} clip(s) ≈ ${usd(estimated)}`);
} else {
  console.log('\nrate:     not exposed for this model; check the key\'s usage after one clip.');
}

if (!values.yes) {
  console.log('\nDry run — no clips submitted. This stage bills per clip, so pass --yes to generate.');
  console.log('While iterating, spend on one scene at a time: --only <sceneId>.');
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

// Image-to-video: a keyframe per scene, published to R2 so the provider can fetch it.
// Without one the clip falls back to text-to-video, which is the drift we are fixing —
// so say which mode is in force rather than silently degrading.
let keyframeUrls = new Map();
if (values.keyframes) {
  const { publishFile } = await import(join(SKILLS, 'studio-core', 'scripts/lib/r2.mjs'));
  const keyDir = values.keyframes;
  const files = readdirSync(keyDir).filter((f) => ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f).toLowerCase()));
  console.log(`keyframes: ${files.length} in ${keyDir}`);
  for (const scene of selected) {
    const match = files.find((f) => f.replace(/\.[^.]+$/, '') === scene.id);
    if (!match) {
      console.log(`  ${scene.id.padEnd(12)} no keyframe — text-to-video fallback`);
      continue;
    }
    const path = join(keyDir, match);
    const contentType = match.endsWith('.png') ? 'image/png' : match.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    const key = `keyframes/${Date.now()}-${scene.id}${extname(match)}`;
    const url = await publishFile({ path, key, contentType });
    keyframeUrls.set(scene.id, url);
    console.log(`  ${scene.id.padEnd(12)} keyframe -> ${url.slice(0, 70)}…`);
  }
}

const run = async (scene) => {
  const video = new OpenRouterVideoModel(apiKey());
  const duration = Math.round(scene.duration_seconds ?? 8);
  const started = Date.now();
  const result = await video.generateClipWithUsage(
    {
      model: clipModel,
      // With a keyframe the picture carries the character, so the prose lock is
      // dropped: keeping both makes the model fight itself.
      prompt: keyframeUrls.has(scene.id) ? scene.prompt : `${scene.prompt}\n\n${CHARACTER_LOCK}`,
      ...(keyframeUrls.has(scene.id)
        ? { frameImages: [{ type: 'first_frame', url: keyframeUrls.get(scene.id) }] }
        : {}),
      duration,
      aspectRatio: '16:9',
      resolution: '720p',
      generateAudio: false,
      ...(scene.seed !== undefined ? { seed: scene.seed } : {}),
    },
    { timeoutMs },
  );
  const path = join(outDir, `${scene.id}.mp4`);
  writeFileSync(path, result.bytes);
  return {
    path,
    bytes: result.bytes.length,
    seconds: (Date.now() - started) / 1000,
    // What OpenRouter said it cost. Absent means unpriced, never free.
    costUsd: result.usage?.costUsd,
    jobId: result.jobId,
  };
};

const done = [];
const failures = [];
let reportedUsd = 0;
let unpricedClips = 0;
for (const scene of selected) {
  process.stdout.write(`  ${scene.id.padEnd(12)} submitting… `);
  try {
    const result = await run(scene);
    done.push({ id: scene.id, ...result });
    if (result.costUsd === undefined) unpricedClips += 1;
    else reportedUsd += result.costUsd;
    console.log(`${(result.bytes / 1024 / 1024).toFixed(1)} MB in ${result.seconds.toFixed(0)}s -> ${result.path}`);
  } catch (err) {
    const kind = err instanceof OpenRouterVideoError ? err.code : 'error';
    failures.push(`${scene.id} (${kind}): ${err.message}`);
    console.log(`FAILED ${kind}: ${err.message}`);
  }
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = join(USAGE_DIR, `${stamp}-mediagen-clips.json`);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: 'mediagen-clips',
      model: clipModel,
      aspect_ratio: '16:9',
      resolution: '720p',
      generate_audio: false,
      rate_usd_per_second: rate ?? null,
      // reported_usd: summed from each completed job's usage block.
      // estimated_usd: the rate-table fallback, when the provider said nothing.
      reported_usd: unpricedClips === 0 ? Number(reportedUsd.toFixed(4)) : null,
      estimated_usd: rate && unpricedClips > 0 ? Number(estimated.toFixed(2)) : null,
      unpriced_clips: unpricedClips,
      requested: selected.map((s) => ({ id: s.id, duration_seconds: Math.round(s.duration_seconds ?? 8) })),
      generated: done.map(({ id, bytes, seconds, path, costUsd, jobId }) => ({
        id,
        bytes,
        seconds: Math.round(seconds),
        path,
        cost_usd: costUsd ?? null,
        cost_source: costUsd === undefined ? null : 'reported',
        provider_request_id: jobId ?? null,
      })),
      failed: failures,
    },
    null,
    2,
  ),
);

console.log(`\ngenerated: ${done.length}/${selected.length}`);
if (done.length > 0) {
  console.log(
    unpricedClips === 0
      ? `cost:      $${reportedUsd.toFixed(4)} reported by the provider`
      : `cost:      ${done.length - unpricedClips} reported ($${reportedUsd.toFixed(4)}), ${unpricedClips} unpriced`,
  );
}
console.log(`log:       ${logPath}`);
if (failures.length) console.log(`failed:    ${failures.length}\n  ${failures.join('\n  ')}`);
if (done.length === 0) {
  console.error('\nevery scene failed.');
  process.exit(1);
}
