#!/usr/bin/env node
// Set every scene's duration from the narration it actually carries.
//
//   timings.mjs --scenes <scenes.json> --voiceover <dir> [--out <file>]
//
// The shot list guesses; the recorded line knows. Measuring the mp3 removes the
// estimate entirely — no characters-per-second constant, no rounding guess. A scene
// with no narration keeps the duration it asked for, because a silent beat is a
// deliberate choice rather than a miscalculation.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { probeDuration } from '../../../studio-core/scripts/lib/media.mjs';

const { values } = parseArgs({
  options: {
    scenes: { type: 'string' },
    voiceover: { type: 'string' },
    out: { type: 'string' },
    tail: { type: 'string', default: '0.5' },
  },
});

if (!values.scenes || !values.voiceover) {
  console.error('usage: timings.mjs --scenes <scenes.json> --voiceover <dir> [--out <file>] [--tail 0.5]');
  process.exit(2);
}

const scenes = JSON.parse(readFileSync(values.scenes, 'utf8'));
const tail = Number(values.tail);
const out = values.out ?? resolve(values.scenes).replace(/\.json$/, '.timed.json');

const report = [];
const timed = [];
for (const scene of scenes) {
  const audio = join(values.voiceover, `${scene.id}.mp3`);
  const asked = Number(scene.duration_seconds) || undefined;
  if (!existsSync(audio)) {
    timed.push({ ...scene });
    report.push({ id: scene.id, spoken: null, duration: asked, note: 'silent' });
    continue;
  }
  const measured = await probeDuration(audio);
  // Round up to the next half second and add the air after the line.
  const duration = Math.ceil((measured + tail) * 2) / 2;
  timed.push({ ...scene, duration_seconds: duration, measured_speech_seconds: Number(measured.toFixed(2)) });
  report.push({
    id: scene.id,
    spoken: measured,
    duration,
    note: asked === undefined ? 'set' : duration === asked ? 'unchanged' : `was ${asked}s`,
  });
}

writeFileSync(out, JSON.stringify(timed, null, 2));

const total = timed.reduce((a, s) => a + (Number(s.duration_seconds) || 0), 0);
console.log(`scenes:   ${timed.length}`);
for (const r of report) {
  const spoken = r.spoken === null ? '      —' : `${r.spoken.toFixed(2).padStart(7)}`;
  console.log(`  ${r.id.padEnd(18)} speech ${spoken}s  ->  ${String(r.duration ?? '?').padStart(5)}s  ${r.note}`);
}
console.log(`\nfootage:  ${total}s (was ${scenes.reduce((a, s) => a + (Number(s.duration_seconds) || 0), 0)}s)`);
console.log(`out:      ${out}`);
