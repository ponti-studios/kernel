#!/usr/bin/env node
// The animatic: keyframes cut to the real narration, before any motion is bought.
//
//   animatic.mjs --scenes <scenes.timed.json> --keyframes <dir> --voiceover <dir> --out <file.mp4>
//
// This is the gate the pipeline hangs on. Everything here is free — the stills are
// already paid for, the audio is already paid for, and ffmpeg costs nothing. Watch it
// end to end; fix framing and pacing here rather than in generated footage.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    scenes: { type: 'string' },
    keyframes: { type: 'string' },
    voiceover: { type: 'string' },
    out: { type: 'string' },
    fps: { type: 'string', default: '24' },
  },
});

if (!values.scenes || !values.keyframes || !values.out) {
  console.error('usage: animatic.mjs --scenes <scenes.timed.json> --keyframes <dir> [--voiceover <dir>] --out <file.mp4>');
  process.exit(2);
}


// A still held for six seconds reads as frozen, which hides whether a shot carries.
// Apply the intended camera move as real motion over the still, so the animatic tests
// timing and movement together. Expressions are normalised over the shot's frame count
// (`on` = output frame), so the same move works at any duration.
const MOVE_ALIASES = [
  [/push|in\b/i, 'push in'],
  [/pull|out\b/i, 'pull out'],
  [/orbit|pan|track|follow/i, 'orbit'],
  [/tilt up|rise/i, 'tilt up'],
  [/tilt down|descend/i, 'tilt down'],
  [/static|locked|still/i, 'static'],
];

export function motionFor(camera) {
  if (!camera) return 'static';
  for (const [pattern, move] of MOVE_ALIASES) if (pattern.test(camera)) return move;
  return 'static';
}

export function motionFilter(camera, seconds, fps = 30) {
  const frames = Math.max(2, Math.round(seconds * fps));
  // 1080p working frame: enough headroom to move inside, a third of the pixels to
  // push around. The animatic is a timing gate, not a delivery master.
  const base = 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080';
  const zoompan = (z, x, y) =>
    `${base},zoompan=z='${z}':x='${x}':y='${y}':d=${frames}:s=1280x720:fps=${fps},setsar=1`;
  const centreX = 'iw/2-(iw/zoom/2)';
  const centreY = 'ih/2-(ih/zoom/2)';
  const move = motionFor(camera);
  switch (move) {
    case 'push in':
      return zoompan(`1+0.09*on/${frames}`, centreX, centreY);
    case 'pull out':
      return zoompan(`1.09-0.09*on/${frames}`, centreX, centreY);
    case 'orbit':
      return zoompan('1.07', `(iw-iw/zoom)*on/${frames}`, centreY);
    case 'tilt up':
      return zoompan('1.07', centreX, `(ih-ih/zoom)*(1-on/${frames})`);
    case 'tilt down':
      return zoompan('1.07', centreX, `(ih-ih/zoom)*on/${frames}`);
    case 'static':
      return `${base},zoompan=z='1.02':x='${centreX}':y='${centreY}':d=${frames}:s=1280x720:fps=${fps},setsar=1`;
    default:
      return zoompan(`1.04+0.01*sin(on/9)`, `${centreX}+10*sin(on/11)`, `${centreY}+6*cos(on/13)`);
  }
}

const scenes = JSON.parse(readFileSync(values.scenes, 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'animatic-'));
const ff = (args) => {
  const res = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(`ffmpeg failed: ${(res.stderr ?? '').trim().split('\n').slice(-1)[0]}`);
    process.exit(1);
  }
};

// One still, held for its scene's duration. Pan/zoom would be a motion decision, so
// the animatic deliberately holds a locked frame: this is a timing check, not a cut.
const segments = [];
scenes.forEach((scene, index) => {
  const still = ['.png', '.jpg', '.jpeg', '.webp']
    .map((ext) => join(values.keyframes, `${scene.id}${ext}`))
    .find((p) => existsSync(p));
  if (!still) {
    console.error(`error: no keyframe for scene '${scene.id}' in ${values.keyframes}`);
    process.exit(1);
  }
  const seconds = Number(scene.duration_seconds) || 3;
  const segment = join(work, `${String(index).padStart(3, '0')}.mp4`);
  // A single input frame, not a looped one: zoompan's `d` GENERATES that many output
  // frames per input frame, so looping the still multiplied the render by its own
  // length (a 6s shot became ~160 input frames x 156 output frames each).
  const fps = Number(values.fps);
  ff([
    '-i', still,
    '-vf', `${motionFilter(scene.camera, seconds, fps)}`,
    '-frames:v', String(Math.round(seconds * fps)),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps), segment,
  ]);
  segments.push(segment);
});

const list = join(work, 'segments.txt');
writeFileSync(list, segments.map((s) => `file '${s}'`).join('\n') + '\n');
const silent = join(work, 'silent.mp4');
ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);

let narration = null;
if (values.voiceover) {
  // Reuse the same alignment rule as the final cut: each line padded to its own shot.
  const args = ['node', join(import.meta.dirname, '..', '..', 'lib', 'assemble.mjs'),
    '--clips', values.keyframes, '--voiceover', values.voiceover, '--scenes', values.scenes,
    '--out', values.out, '--dry-run'];
  void args;
  const stems = scenes.map((scene) => {
    const audio = join(values.voiceover, `${scene.id}.mp3`);
    return existsSync(audio) ? audio : null;
  });
  const padded = join(work, 'narration');
  spawnSync('mkdir', ['-p', padded]);
  const parts = [];
  stems.forEach((audio, index) => {
    const seconds = Number(scenes[index].duration_seconds) || 3;
    const part = join(padded, `${String(index).padStart(3, '0')}.mp3`);
    if (audio) {
      ff(['-i', audio, '-af', `apad=whole_dur=${seconds}`, '-t', String(seconds), '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '4', part]);
    } else {
      ff(['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(seconds), '-c:a', 'libmp3lame', '-q:a', '4', part]);
    }
    parts.push(part);
  });
  const alist = join(work, 'audio.txt');
  writeFileSync(alist, parts.map((p) => `file '${p}'`).join('\n') + '\n');
  narration = join(work, 'narration.mp3');
  ff(['-f', 'concat', '-safe', '0', '-i', alist, '-c', 'copy', narration]);
}

if (narration) {
  ff(['-i', silent, '-i', narration, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', values.out]);
} else {
  ff(['-i', silent, '-c', 'copy', values.out]);
}

console.log(`animatic: ${values.out}`);
console.log(`scenes:   ${scenes.length} stills, ${scenes.reduce((a, s) => a + (Number(s.duration_seconds) || 0), 0)}s`);
console.log(`narration: ${narration ? 'aligned per shot' : 'silent'}`);
console.log(`motion:    ${scenes.map((s) => `${s.id}=${motionFor(s.camera)}`).join(', ')}`);
console.log('Watch it end to end. Nothing below this line is free.');
