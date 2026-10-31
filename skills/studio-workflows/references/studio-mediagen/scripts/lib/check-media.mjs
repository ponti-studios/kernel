#!/usr/bin/env node
// Preflight the media pipeline: binaries, key, models, voices, and optionally
// a scenes file. Spends nothing.
//
//   check-media.mjs [--scenes <scenes.json>]
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { load, readScenes, studioRoot, voiceIdForScene } from './resolve.mjs';

const { values } = parseArgs({ options: { scenes: { type: 'string' } } });

const rows = [];
// warn = real gap, but the pipeline still runs (the app applies the same
// fallback), so warnings must not fail the preflight.
const check = (label, ok, detail) => rows.push([ok === 'warn' ? 'warn' : ok, label, detail]);
const warn = (label, detail) => rows.push(['warn', label, detail]);

const which = (bin) => {
  const paths = (process.env.PATH ?? '').split(':');
  for (const dir of paths) {
    const p = `${dir}/${bin}`;
    if (existsSync(p)) return p;
  }
  return undefined;
};

for (const bin of ['ffmpeg', 'ffprobe', 'filekit']) {
  const p = which(bin);
  check(`${bin} on PATH`, Boolean(p), p ?? 'required for assembly');
}

let env;
try {
  const config = await load('config');
  env = config.loadEnv();
  check('packages built and importable', true, studioRoot());
} catch (err) {
  check('packages built and importable', false, err.message);
}

if (env) {
  check('OPENROUTER_SPEECH_MODEL', Boolean(env.OPENROUTER_SPEECH_MODEL), env.OPENROUTER_SPEECH_MODEL);
  check('OPENROUTER_VIDEO_MODEL', Boolean(env.OPENROUTER_VIDEO_MODEL), env.OPENROUTER_VIDEO_MODEL);
  check('DEFAULT_VOICE_ID', Boolean(env.DEFAULT_VOICE_ID), env.DEFAULT_VOICE_ID || 'unset');
  if (!env.PETER_VOICE_ID) {
    warn('PETER_VOICE_ID set', "empty — scenes asking for 'peter' silently get the default voice");
  } else {
    check('PETER_VOICE_ID set', true, 'set');
  }
  if (!env.STEWIE_VOICE_ID) {
    warn('STEWIE_VOICE_ID set', "empty — scenes asking for 'stewie' silently get the default voice");
  } else {
    check('STEWIE_VOICE_ID set', true, 'set');
  }
}

if (values.scenes) {
  try {
    const scenes = await readScenes(values.scenes);
    const withVo = scenes.filter((s) => s.voiceover?.trim());
    check('scenes file valid', true, `${scenes.length} scene(s), ${withVo.length} with a voiceover`);
    for (const scene of scenes) {
      if (!scene.duration_seconds) {
        check(`scene ${scene.id} duration`, false, 'missing — clip stage defaults to 8s');
      }
    }
    const voices = new Set(scenes.map((s) => voiceIdForScene(s, env ?? {}).id));
    check('voices resolved', true, [...voices].join(', '));
  } catch (err) {
    check('scenes file valid', false, err.message);
  }
}

let failed = 0;
let warned = 0;
for (const [state, label, detail] of rows) {
  if (state === false) failed += 1;
  if (state === 'warn') warned += 1;
  const tag = state === false ? 'FAIL' : state === 'warn' ? 'warn' : 'ok  ';
  console.log(`  ${tag} ${label.padEnd(30)} ${detail}`);
}
const tail = [warned ? `${warned} warning(s)` : null, failed ? `${failed} failure(s)` : null]
  .filter(Boolean)
  .join(', ');
console.log(failed === 0 ? `\nmedia side ready${tail ? ` (${tail})` : ''}.` : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
