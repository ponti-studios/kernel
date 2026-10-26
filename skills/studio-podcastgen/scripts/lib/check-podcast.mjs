#!/usr/bin/env node
// Preflight the podcast side: packages, speech model, price, voices, source
// segments. Spends nothing.
//
//   check-podcast.mjs [--source <script.json|notes.md>]
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { load, readPodcastSource, speechPricePerToken, studioRoot } from './resolve.mjs';

const { values } = parseArgs({ options: { source: { type: 'string' } } });

const rows = [];
const check = (label, ok, detail) => rows.push([ok, label, detail]);
const warn = (label, detail) => rows.push(['warn', label, detail]);

for (const bin of ['ffmpeg', 'ffprobe']) {
  const paths = (process.env.PATH ?? '').split(':');
  const found = paths.map((d) => `${d}/${bin}`).find((p) => existsSync(p));
  check(`${bin} on PATH`, Boolean(found), found ?? 'needed for episode assembly');
}

let env;
try {
  env = (await load('config')).loadEnv();
  check('packages built and importable', true, studioRoot());
} catch (err) {
  check('packages built and importable', false, err.message);
}

if (env) {
  check('OPENROUTER_SPEECH_MODEL', Boolean(env.OPENROUTER_SPEECH_MODEL), env.OPENROUTER_SPEECH_MODEL);
  if (env.DEFAULT_VOICE_ID) {
    check('DEFAULT_VOICE_ID', true, env.DEFAULT_VOICE_ID);
  } else {
    check('DEFAULT_VOICE_ID', false, 'no narrator voice available without --voice');
  }
  if (!env.PETER_VOICE_ID || !env.STEWIE_VOICE_ID) {
    warn('two-host voices configured', 'PETER_VOICE_ID / STEWIE_VOICE_ID empty — pass --voices or --voice explicitly');
  }
  const rate = await speechPricePerToken(env.OPENROUTER_SPEECH_MODEL);
  if (rate) {
    check('price per token', true, `$${rate} — 1,000 characters ≈ $${(1000 * rate).toFixed(4)}`);
  } else {
    warn('price per token', 'not published for this model — measure via the key totals');
  }
}

if (values.source) {
  if (!existsSync(values.source)) {
    check('source readable', false, values.source);
  } else {
    try {
      const segments = readPodcastSource(values.source);
      const chars = segments.reduce((n, s) => n + s.text.length, 0);
      check('source parsed', segments.length > 0, `${segments.length} segment(s), ${chars} characters`);
      if (segments.some((s) => s.text.length < 40)) {
        warn('short segments', 'a segment under 40 characters is likely a stray heading rather than narration');
      }
      if (segments.length === 0) check('source has speakable text', false, 'no segments produced');
    } catch (err) {
      check('source parsed', false, err.message);
    }
  }
} else {
  warn('source', 'not checked (pass --source)');
}

let failed = 0;
let warned = 0;
for (const [state, label, detail] of rows) {
  if (state === false) failed += 1;
  if (state === 'warn') warned += 1;
  const tag = state === false ? 'FAIL' : state === 'warn' ? 'warn' : 'ok  ';
  console.log(`  ${tag} ${label.padEnd(30)} ${detail}`);
}
console.log(
  failed === 0
    ? `\npodcast side ready${warned ? ` (${warned} warning(s))` : ''}.`
    : `\n${failed} check(s) failed.`,
);
process.exit(failed === 0 ? 0 : 1);
