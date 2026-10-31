#!/usr/bin/env node
// Turn a script into one continuous audio file — a podcast episode.
//
//   podcast.mjs --source <script.json|notes.md> --out <episode.mp3> [options]
//
// Options:
//   --title <t>            episode title (ID3 + manifest)
//   --author <a>           ID3 artist
//   --album <a>            ID3 album
//   --voice <id>           single narrator voice
//   --voices <a,b>         alternate voices across segments (two-host)
//   --gap-ms <n>           silence between segments (default 700)
//   --no-meta              skip ID3 tags
//   --work-dir <dir>       keep the per-segment mp3s here (default: tmp, removed)
//   --dry-run              plan, cost estimate and voice assignment; spends nothing
//
// Sources: a draft from studio-video / studio-essay / studio-script,
// a markdown file (split on headings or paragraphs), or an explicit segment
// array.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';

import { apiKey, load, readPodcastSource, speechPricePerToken, setting } from './resolve.mjs';

const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    source: { type: 'string' },
    out: { type: 'string' },
    title: { type: 'string' },
    author: { type: 'string' },
    album: { type: 'string' },
    voice: { type: 'string' },
    voices: { type: 'string' },
    'gap-ms': { type: 'string', default: '700' },
    'no-meta': { type: 'boolean', default: false },
    'work-dir': { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

if (!values.source || !values.out) {
  console.error('usage: podcast.mjs --source <script.json|notes.md> --out <episode.mp3> [--voice <id> | --voices <a,b>]');
  process.exit(2);
}
if (!existsSync(values.source)) {
  console.error(`error: source not found: ${values.source}`);
  process.exit(2);
}
if (values.voice && values.voices) {
  console.error('error: pass either --voice (one narrator) or --voices (alternating), not both');
  process.exit(2);
}

const config = await load('config');
const env = config.loadEnv();
const { OpenRouterSpeechModel, OpenRouterSpeechError } = await load('providers');

const speechModel = env.OPENROUTER_SPEECH_MODEL;
const segments = readPodcastSource(values.source);
if (segments.length === 0) {
  console.error('error: the source produced no speakable segments');
  process.exit(2);
}

// Voice plan: explicit segment voice > --voice > alternating --voices > default.
const alternating = values.voices ? values.voices.split(',').map((v) => v.trim()).filter(Boolean) : [];
if (values.voices && alternating.length < 2) {
  console.error('error: --voices needs two voice ids, e.g. --voices pNInz...,abc123');
  process.exit(2);
}
if (alternating.length >= 2 && new Set(alternating).size === 1) {
  console.error(
    `error: --voices got the same id twice (${alternating[0]}); alternating one voice is just one narrator — use --voice`,
  );
  process.exit(2);
}
const planned = segments.map((seg, i) => {
  if (seg.voice) return { ...seg, resolvedVoice: seg.voice, why: 'segment voice' };
  if (values.voice) return { ...seg, resolvedVoice: values.voice, why: '--voice' };
  if (alternating.length >= 2) {
    const pick = alternating[i % alternating.length];
    return { ...seg, resolvedVoice: pick, why: `--voices[${i % alternating.length}]` };
  }
  return { ...seg, resolvedVoice: env.DEFAULT_VOICE_ID, why: 'DEFAULT_VOICE_ID' };
});

const gapMs = Number(values['gap-ms']);
const totalChars = planned.reduce((n, s) => n + s.text.length, 0);
const spokenChars = totalChars;
const minutes = spokenChars / 14 / 60; // ~14 characters per second of speech is a rough read rate
const rate = await speechPricePerToken(speechModel);
const estimate = rate ? spokenChars * rate : undefined;

console.log(`source:    ${resolve(values.source)}`);
console.log(`model:     ${speechModel}`);
console.log(`episode:   ${planned.length} segment(s), ${spokenChars} characters (~${minutes.toFixed(1)} min spoken)`);
console.log(`gap:       ${gapMs}ms between segments`);
console.log(`voice(s):  ${[...new Set(planned.map((s) => s.resolvedVoice))].join(', ')}`);
if (alternating.length >= 2) console.log(`           alternating across ${alternating.length} voices`);
console.log('');
for (const s of planned) {
  console.log(`  ${s.id.padEnd(12)} ${String(s.text.length).padStart(5)} chars  ${s.resolvedVoice.slice(0, 12)}…  ${s.label.slice(0, 40)}`);
}
console.log(
  estimate === undefined
    ? '\ncost:      rate not published for this model — check the key totals after the run.'
    : `\ncost:      ≈ $${estimate.toFixed(4)} ESTIMATE (${spokenChars} chars × $${rate}/token; speech pricing is per token and the read rate is approximate)`,
);

if (values['dry-run']) {
  console.log('\nDry run — nothing synthesized.');
  process.exit(0);
}

const workDir = values['work-dir'] ? resolve(values['work-dir']) : mkdtempSync(join(tmpdir(), 'podcast-'));
const keepWork = Boolean(values['work-dir']);
mkdirSync(workDir, { recursive: true });

const speech = new OpenRouterSpeechModel(apiKey());
const made = [];
const failures = [];
let charactersBilled = 0;
for (const seg of planned) {
  const file = join(workDir, `${seg.id}.mp3`);
  try {
    const res = await speech.synthesize({ model: speechModel, voice: seg.resolvedVoice, text: seg.text });
    writeFileSync(file, res.audio);
    charactersBilled += res.characters;
    made.push({
      ...seg,
      file,
      bytes: res.byteLength,
      characters: res.characters,
      providerRequestId: res.providerRequestId,
    });
    console.log(`  ${seg.id.padEnd(12)} ${(res.byteLength / 1024).toFixed(0).padStart(5)} KiB  ok`);
  } catch (err) {
    const kind = err instanceof OpenRouterSpeechError ? err.code : 'error';
    failures.push(`${seg.id} (${kind}): ${err.message}`);
    console.log(`  ${seg.id.padEnd(12)} FAILED ${kind}: ${err.message}`);
  }
}

if (made.length === 0) {
  console.error('\nevery segment failed; no episode written');
  process.exit(1);
}

// One ffmpeg pass: normalize every input, splice with generated silence between
// segments, and write the episode. Re-encoding avoids the codec-mismatch
// failures that a stream-copy concat hits when segment mp3s differ.
const gap = join(workDir, 'gap.mp3');
const gapRun = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=mono`, '-t', String(gapMs / 1000), '-c:a', 'libmp3lame', gap], { encoding: 'utf8' });
if (gapRun.status !== 0) {
  console.error(`error: could not build the gap audio: ${gapRun.stderr}`);
  process.exit(1);
}

const inputs = [];
for (let i = 0; i < made.length; i += 1) {
  if (i > 0) inputs.push(gap);
  inputs.push(made[i].file);
}
const args = ['-y', '-loglevel', 'error'];
for (const input of inputs) args.push('-i', input);
const chain = inputs
  .map((_, i) => `[${i}:a]aresample=44100,pan=mono|c0=c0[a${i}]`)
  .join(';');
const concatIn = inputs.map((_, i) => `[a${i}]`).join('');
args.push('-filter_complex', `${chain};${concatIn}concat=n=${inputs.length}:v=0:a=1[out]`);
args.push('-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '128k');
if (!values['no-meta']) {
  const title = values.title ?? `Episode ${new Date().toISOString().slice(0, 10)}`;
  args.push('-metadata', `title=${title}`, '-metadata', `artist=${values.author ?? 'Ponti Studios'}`);
  if (values.album) args.push('-metadata', `album=${values.album}`);
  args.push('-metadata', 'genre=Podcast');
}
mkdirSync(dirname(values.out), { recursive: true });
args.push(values.out);

const encode = spawnSync('ffmpeg', args, { encoding: 'utf8' });
if (encode.status !== 0) {
  console.error(`error: ffmpeg assembly failed:\n${encode.stderr}`);
  process.exit(1);
}

const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size', '-of', 'default=nw=1:nk=1', values.out], { encoding: 'utf8' });
const [duration, size] = probe.stdout.trim().split('\n').map(Number);

const manifest = {
  kind: 'podcastgen',
  episode: {
    title: values.title ?? null,
    author: values.author ?? 'Ponti Studios',
    album: values.album ?? null,
    source: resolve(values.source),
    out: resolve(values.out),
    duration_seconds: Number.isFinite(duration) ? Number(duration.toFixed(2)) : null,
    bytes: Number.isFinite(size) ? size : null,
    gap_ms: gapMs,
    model: speechModel,
  },
  segments: made.map(({ id, label, text, resolvedVoice, why, bytes, characters, providerRequestId }) => ({
    id,
    label,
    voice: resolvedVoice,
    voice_source: why,
    // characters as billed by the provider; text length is the request side
    chars: characters ?? text.length,
    bytes,
    provider_request_id: providerRequestId ?? null,
  })),
  failed: failures,
  // Speech is billed per character and the provider does not return a price, so
  // this stays an estimate with its basis written down — never a fake "reported".
  characters_billed: charactersBilled,
  estimated_cost_usd: estimate ?? null,
  work_dir: keepWork ? workDir : null,
};

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = join(USAGE_DIR, `${stamp}-podcastgen.json`);
writeFileSync(logPath, JSON.stringify(manifest, null, 2));
const manifestPath = values.out.replace(/\.[^.]+$/, '.manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

if (!keepWork) {
  try {
    rmSync(workDir, { recursive: true, force: true });
  } catch {
    // best effort
  }
}

console.log(`\nepisode:   ${values.out}`);
console.log(`duration:  ${Number.isFinite(duration) ? `${(duration / 60).toFixed(2)} min (${duration.toFixed(1)}s)` : 'unknown'}`);
console.log(`size:      ${Number.isFinite(size) ? `${(size / 1024 / 1024).toFixed(2)} MiB` : 'unknown'}`);
console.log(`manifest:  ${manifestPath}`);
console.log(`log:       ${logPath}`);
if (failures.length) console.log(`failed:    ${failures.length} — ${failures.join('; ')}`);
process.exit(failures.length ? 1 : 0);
