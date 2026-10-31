#!/usr/bin/env node
// Assemble the final video: concat the clips, lay the voiceover over them.
//
//   assemble.mjs --clips <dir> --voiceover <file.mp3> --out <file.mp4>
//                [--scenes <scenes.json>] [--delay-ms 800] [--contact-sheet <out.png>]
//
// Clip order is the concat order. With --scenes, clips are ordered by scene
// order; otherwise files are sorted by name.
//
// WARNING the app also relies on: assembly is -shortest, so if the narration
// runs longer than the footage the END OF THE NARRATION IS CUT. The result
// reports `truncated` when that happens.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { setting } from './resolve.mjs';
import { dirname, extname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { load, readScenes } from './resolve.mjs';

const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    clips: { type: 'string' },
    voiceover: { type: 'string' },
    out: { type: 'string' },
    scenes: { type: 'string' },
    'delay-ms': { type: 'string' },
    'contact-sheet': { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
});

if (!values.clips || !values.voiceover || !values.out) {
  console.error('usage: assemble.mjs --clips <dir> --voiceover <file.mp3> --out <file.mp4>');
  process.exit(2);
}
if (!existsSync(values.clips)) {
  console.error(`error: clips directory not found: ${values.clips}`);
  process.exit(2);
}
if (!existsSync(values.voiceover)) {
  console.error(`error: voiceover not found: ${values.voiceover}`);
  process.exit(2);
}

// A directory is the natural output of voiceover.sh (one mp3 per scene). Join it in
// scene order — or alphabetically when no --scenes was given — into one narration file.
let voiceoverPath = values.voiceover;
if (readdirSync(values.voiceover, { withFileTypes: true }).some((e) => e.isFile() === false) || extname(values.voiceover) === '') {
  const dir = values.voiceover;
  const files = readdirSync(dir).filter((f) => ['.mp3', '.wav', '.m4a'].includes(extname(f).toLowerCase()));
  if (files.length === 0) {
    console.error(`error: no audio files in ${dir}`);
    process.exit(2);
  }
  let ordered = files;
  if (values.scenes) {
    const scenes = await readScenes(values.scenes);
    const byId = new Map(files.map((f) => [f.replace(/\.[^.]+$/, ''), f]));
    ordered = scenes.map((s) => byId.get(s.id)).filter(Boolean);
  }
  const listPath = join(dir, 'concat.txt');
  writeFileSync(listPath, ordered.map((f) => `file '${join(dir, f)}'`).join('\n') + '\n');
  voiceoverPath = join(dir, 'joined.mp3');
  const res = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', voiceoverPath], { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(`error: could not join narration: ${(res.stderr ?? '').trim().split('\n').slice(-1)[0]}`);
    process.exit(1);
  }
  console.log(`voiceover: joined ${ordered.length} track(s) -> ${voiceoverPath}`);
}

const { assembleVideo, contactSheet, probeDuration } = await load('providers');

const inDir = values.clips;
let clips = readdirSync(inDir)
  .filter((f) => ['.mp4', '.mov', '.mkv', '.webm'].includes(extname(f).toLowerCase()))
  .map((f) => join(inDir, f));

if (clips.length === 0) {
  console.error(`error: no video files in ${inDir}`);
  process.exit(2);
}

if (values.scenes) {
  // Order by the scenes draft so clip order matches the story, not the alphabet.
  const scenes = await readScenes(values.scenes);
  const byId = new Map(clips.map((p) => [p.replace(/^.*\//, '').replace(/\.[^.]+$/, ''), p]));
  const ordered = [];
  for (const scene of scenes) {
    const hit = byId.get(scene.id);
    if (hit) {
      ordered.push(hit);
      byId.delete(scene.id);
    }
  }
  for (const leftover of byId.values()) ordered.push(leftover);
  const matchedClips = clips.length - byId.size;
  const missing = scenes.filter((s) => !clips.some((c) => c.endsWith(`/${s.id}.mp4`))).map((s) => s.id);
  console.log(
    `ordering by scenes: ${matchedClips} of ${clips.length} clip(s) matched a scene` +
      (missing.length ? `; no clip for ${missing.join(', ')}` : '') +
      (byId.size ? `; ${byId.size} clip(s) not named after a scene, appended last` : ''),
  );
  clips = ordered;
}

// Per-scene alignment. One continuous track starting 800ms in makes the narration
// drift away from the shots it describes. When the scenes file is known, pad or trim
// each line to its scene's duration and lay a silent segment where a shot has none,
// so every line lands on its own picture and the track ends exactly with the footage.
let aligned = false;
if (values.scenes && readdirSync(values.voiceover, { withFileTypes: true }).some((e) => e.isDirectory() === false)) {
  const dir = values.voiceover;
  const scenes = await readScenes(values.scenes);
  const files = readdirSync(dir).filter((f) => ['.mp3', '.wav', '.m4a'].includes(extname(f).toLowerCase()));
  const byId = new Map(files.map((f) => [f.replace(/\.[^.]+$/, ''), join(dir, f)]));
  const segments = [];
  for (const scene of scenes) {
    const seconds = Number(scene.duration_seconds) || 8;
    const source = byId.get(scene.id);
    const segment = join(dir, `.seg-${scene.id}.mp3`);
    const args = source
      ? ['-y', '-loglevel', 'error', '-i', source, '-af', `apad=whole_dur=${seconds}`, '-t', String(seconds), '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '4', segment]
      : ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(seconds), '-c:a', 'libmp3lame', '-q:a', '4', segment];
    const res = spawnSync('ffmpeg', args, { encoding: 'utf8' });
    if (res.status !== 0) {
      console.error(`error: could not build narration for ${scene.id}: ${(res.stderr ?? '').trim().split('\n').slice(-1)[0]}`);
      process.exit(1);
    }
    segments.push(segment);
  }
  const list = join(dir, 'aligned.txt');
  writeFileSync(list, segments.map((f) => `file '${f}'`).join('\n') + '\n');
  const track = join(dir, 'aligned.mp3');
  const res = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', track], { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(`error: could not join aligned narration: ${(res.stderr ?? '').trim().split('\n').slice(-1)[0]}`);
    process.exit(1);
  }
  voiceoverPath = track;
  aligned = true;
  console.log(`narration: aligned to ${segments.length} scene(s) -> ${track}`);
}

const delayMs = aligned ? 0 : values['delay-ms'] ? Number(values['delay-ms']) : 800;

console.log(`clips:     ${clips.length}`);
for (const c of clips) {
  const d = await probeDuration(c);
  console.log(`  ${d.toFixed(2).padStart(6)}s  ${c}`);
}
const voSeconds = await probeDuration(voiceoverPath);
const totalClipSeconds = (
  await Promise.all(clips.map((c) => probeDuration(c)))
).reduce((a, b) => a + b, 0);
console.log(`voiceover: ${voSeconds.toFixed(2)}s`);
console.log(`footage:   ${totalClipSeconds.toFixed(2)}s`);
console.log(`delay:     ${delayMs}ms before narration starts`);
if (voSeconds > totalClipSeconds) {
  console.log(
    `WARNING: narration runs ${(voSeconds - totalClipSeconds).toFixed(2)}s longer than the footage — ` +
      `the ending will be CUT. Trim the voiceover or add clips.`,
  );
}

if (values['dry-run']) {
  console.log('\nDry run — nothing encoded.');
  process.exit(0);
}

mkdirSync(dirname(values.out), { recursive: true });
const result = await assembleVideo({
  clips,
  voiceover: voiceoverPath,
  out: values.out,
  voDelayMs: delayMs,
});

if (values['contact-sheet']) {
  const sheet = values.out.replace(/\.[^.]+$/, '-contact-sheet.png');
  await contactSheet(clips[0], sheet);
  console.log(`contact sheet: ${sheet}`);
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = join(USAGE_DIR, `${stamp}-mediagen-assemble.json`);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: 'mediagen-assemble',
      clips,
      voiceover: voiceoverPath,
      out: values.out,
      vo_delay_ms: delayMs,
      video_seconds: result.videoSeconds,
      voiceover_seconds: result.voiceoverSeconds,
      truncated: result.truncated,
    },
    null,
    2,
  ),
);

console.log(`\nout:        ${values.out}`);
console.log(`video:      ${result.videoSeconds.toFixed(2)}s / narration ${result.voiceoverSeconds.toFixed(2)}s`);
console.log(`truncated:  ${result.truncated ? 'YES — narration was cut' : 'no'}`);
console.log(`log:        ${logPath}`);
process.exit(result.truncated ? 1 : 0);
