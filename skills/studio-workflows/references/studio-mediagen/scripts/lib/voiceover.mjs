#!/usr/bin/env node
// Speak every scene's voiceover to its own mp3, routed through the scene's voice.
//
//   voiceover.mjs --scenes <scenes.json> [--out <dir>] [--only <sceneId>]
//                 [--voice <id>] [--dry-run]
//
// Mirrors the app's audio stage: scenes with an empty/absent voiceover are
// skipped, everything else gets one file named <sceneId>.mp3.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { setting } from './resolve.mjs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { apiKey, load, readScenes, voiceIdForScene } from './resolve.mjs';

const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    scenes: { type: 'string' },
    out: { type: 'string' },
    only: { type: 'string' },
    voice: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
  },
});

if (!values.scenes) {
  console.error('usage: voiceover.mjs --scenes <scenes.json> [--out <dir>] [--only <sceneId>] [--dry-run]');
  process.exit(2);
}

const config = await load('config');
const env = config.loadEnv();
const { OpenRouterSpeechModel, OpenRouterSpeechError } = await load('providers');

const scenes = await readScenes(values.scenes);
const selected = values.only ? scenes.filter((s) => s.id === values.only) : scenes;
if (values.only && selected.length === 0) {
  console.error(`error: no scene with id '${values.only}' (have: ${scenes.map((s) => s.id).join(', ')})`);
  process.exit(2);
}

const outDir = values.out ?? join(homedir(), 'Documents', 'studio-media', 'voiceover');
const speechModel = env.OPENROUTER_SPEECH_MODEL;
const work = selected.filter((s) => s.voiceover?.trim());

if (work.length === 0) {
  console.log('nothing to speak: no selected scene has a voiceover (the video stage still runs — clips are silent).');
  process.exit(0);
}

console.log(`model:  ${speechModel}`);
console.log(`out:    ${outDir}`);
console.log(`scenes: ${work.length} of ${selected.length} selected have a voiceover\n`);

let spoken = 0;
let bytes = 0;
const failures = [];
const calls = [];
let charactersBilled = 0;

for (const scene of work) {
  const voice = values.voice ? { id: values.voice, why: '--voice override' } : voiceIdForScene(scene, env);
  const chars = scene.voiceover.length;
  if (values['dry-run']) {
    console.log(`  ${scene.id.padEnd(12)} ${String(chars).padStart(5)} chars  voice ${voice.id}`);
    continue;
  }
  try {
    const speech = new OpenRouterSpeechModel(apiKey());
    const res = await speech.synthesize({ model: speechModel, voice: voice.id, text: scene.voiceover });
    mkdirSync(outDir, { recursive: true });
    const path = join(outDir, `${scene.id}.mp3`);
    writeFileSync(path, res.audio);
    bytes += res.byteLength;
    spoken += 1;
    charactersBilled += res.characters;
    calls.push({
      id: scene.id,
      characters: res.characters,
      provider_request_id: res.providerRequestId ?? null,
    });
    console.log(`  ${scene.id.padEnd(12)} ${String(chars).padStart(5)} chars  voice ${voice.id}  -> ${path}`);
  } catch (err) {
    const kind = err instanceof OpenRouterSpeechError ? err.code : 'error';
    failures.push(`${scene.id} (${kind}): ${err.message}`);
    console.error(`  ${scene.id.padEnd(12)} FAILED ${kind}: ${err.message}`);
  }
}

if (values['dry-run']) {
  console.log('\nDry run — nothing was synthesized or written.');
  process.exit(0);
}

// assemble.sh takes ONE narration file; this stage writes one per scene so a single
// line can be re-recorded. Join them in scene order here, so the handoff is complete.
const ordered = work.map((s) => join(outDir, `${s.id}.mp3`)).filter((f) => existsSync(f));
let joined;
if (ordered.length > 0) {
  const listPath = join(outDir, 'concat.txt');
  writeFileSync(listPath, ordered.map((f) => `file '${f}'`).join('\n') + '\n');
  const joinedPath = join(outDir, 'vo.mp3');
  const res = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', joinedPath], {
    encoding: 'utf8',
  });
  if (res.status === 0) joined = joinedPath;
  else console.error(`warn: could not join narration: ${(res.stderr ?? '').trim().split('\n').slice(-1)[0]}`);
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = join(USAGE_DIR, `${stamp}-mediagen-voiceover.json`);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: 'mediagen-voiceover',
      model: speechModel,
      scenes: work.map((s) => ({ id: s.id, chars: s.voiceover.length, voice: voiceIdForScene(s, env).id })),
      spoken,
      failed: failures,
      bytes_written: bytes,
      // Measured from the request text, not guessed: speech is billed per character.
      characters_billed: charactersBilled,
      calls,
    },
    null,
    2,
  ),
);

console.log(`\nspoken:  ${spoken}/${work.length} mp3 (${(bytes / 1024).toFixed(0)} KiB)`);
console.log(`chars:   ${charactersBilled} billed (provider id on ${calls.filter((c) => c.provider_request_id).length}/${calls.length} calls)`);
if (joined) console.log(`narration: ${joined}`);
console.log(`log:     ${logPath}`);
if (failures.length) console.log(`failed:  ${failures.length}\n  ${failures.join('\n  ')}`);
process.exit(failures.length === 0 ? 0 : 1);
