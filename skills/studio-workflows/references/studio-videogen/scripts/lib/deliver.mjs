#!/usr/bin/env node
// Package an approved picture and final mix as exactly audio.mp3 and video.mp4.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { probeDuration } from '../../../studio-core/scripts/lib/media.mjs';

const { values } = parseArgs({ options: {
  video: { type: 'string' }, audio: { type: 'string' }, out: { type: 'string' },
} });
if (!values.video || !values.audio || !values.out) {
  console.error('usage: deliver.mjs --video <picture.mp4> --audio <approved-mix> --out <delivery-dir>');
  process.exit(2);
}
const out = resolve(values.out);
if (existsSync(out) && readdirSync(out).length) {
  console.error(`error: delivery directory is not empty: ${out}`);
  process.exit(2);
}
const videoSeconds = await probeDuration(values.video);
const audioSeconds = await probeDuration(values.audio);
if (audioSeconds > videoSeconds + 0.03) {
  console.error(`error: audio (${audioSeconds.toFixed(2)}s) exceeds picture (${videoSeconds.toFixed(2)}s)`);
  process.exit(2);
}
mkdirSync(dirname(out), { recursive: true });
const work = mkdtempSync(join(dirname(out), '.videogen-delivery-'));
function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr || result.error?.message}`);
}
try {
  const audio = join(work, 'audio.mp3');
  const video = join(work, 'video.mp4');
  ffmpeg(['-i', values.audio, '-vn', '-af', `apad=whole_dur=${videoSeconds}`, '-t', String(videoSeconds), '-c:a', 'libmp3lame', '-q:a', '2', audio]);
  ffmpeg(['-i', values.video, '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-t', String(videoSeconds), '-movflags', '+faststart', video]);
  if (existsSync(out)) rmSync(out, { recursive: true });
  renameSync(work, out);
  console.log(`delivery: ${out}\n  audio.mp3\n  video.mp4`);
} finally {
  if (existsSync(work)) rmSync(work, { recursive: true, force: true });
}
