#!/usr/bin/env node
// One stage, one model call, one validated draft on disk.
//
// Runs on plain Node (24+) with no build step and no npm install: the prompts and
// schema are local, and the text model and config come from the sibling studio-core
// skill, resolved lazily so --dry-run needs neither a key nor the module.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { apiKey, setting } from '../../../studio-core/scripts/lib/config.mjs';
import { DEFAULT_TEXT_MODEL, createLazyTextModel } from '../../../studio-core/scripts/lib/drafts.mjs';
import { STAGES, generators } from './generate.mjs';

const USAGE_DIR = setting('STUDIO_USAGE_DIR', 'usage_dir', () => join(homedir(), '.hominem', 'ai_usage'));

const { values } = parseArgs({
  options: {
    stage: { type: 'string' },
    brief: { type: 'string' },
    script: { type: 'string' },
    out: {
      type: 'string',
      default: setting('STUDIO_DRAFTS_DIR', 'drafts_dir', () => join(homedir(), 'Documents', 'studio-drafts')),
    },
    model: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

const stage = values.stage ?? (STAGES.length === 1 ? STAGES[0] : undefined);
if (!stage) {
  console.error(`usage: run.mjs --stage <${STAGES.join('|')}> (--brief <text|@file> | --script <json>)`);
  process.exit(2);
}
if (!STAGES.includes(stage)) {
  console.error(`error: unknown stage '${stage}' (have: ${STAGES.join(', ')})`);
  process.exit(2);
}

const readArg = (raw) => (raw.startsWith('@') ? readFileSync(raw.slice(1), 'utf8') : raw);

// A script artifact may be the bare draft or an artifact wrapper; take either.
function asScriptInput(raw, sourceLabel) {
  const parsed = JSON.parse(raw);
  const candidate = parsed?.draft && parsed.draft.sections ? parsed.draft : parsed;
  if (!candidate?.title || !Array.isArray(candidate.sections) || candidate.sections.length === 0) {
    console.error(`error: ${sourceLabel} is not a master script (need {title, sections:[…]})`);
    process.exit(2);
  }
  return { title: candidate.title, sections: candidate.sections };
}

const model = values.model ?? setting('OPENROUTER_TEXT_MODEL', 'model_text', DEFAULT_TEXT_MODEL);
// The key resolves on first use: --dry-run must not require one.
let lazyModel;
const text = {
  async generate(input) {
    lazyModel ??= createLazyTextModel({ model, apiKey: process.env.OPENROUTER_API_KEY ?? apiKey() });
    return lazyModel.generate(input);
  },
};
const options = values.model ? { model: values.model } : {};

const generator = generators[stage];
let input;
let inputLabel;

if (stage === 'script') {
  if (!values.brief) {
    console.error('error: stage `script` needs --brief (the idea or rough draft)');
    process.exit(2);
  }
  input = readArg(values.brief);
  inputLabel = `brief:${input.length}chars`;
} else {
  if (!values.script) {
    console.error(`error: stage \`${stage}\` needs --script <approved master script json>`);
    process.exit(2);
  }
  input = asScriptInput(readFileSync(values.script, 'utf8'), values.script);
  inputLabel = `script:${input.title}`;
}

if (values['dry-run']) {
  console.log(JSON.stringify({ stage, model, inputLabel }, null, 2));
  process.exit(0);
}

const result = await generator(text, input, options);

mkdirSync(values.out, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outPath = join(values.out, `${stage}-${stamp}.json`);
writeFileSync(outPath, JSON.stringify(result.draft, null, 2));

// One log per call, in the same directory every studio skill writes to, so one
// place answers "what did this cost?".
mkdirSync(USAGE_DIR, { recursive: true });
const logPath = join(USAGE_DIR, `${stamp}-studio-clips-${stage}.json`);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: 'editorial-text',
      tool: 'studio-clips',
      stage,
      model,
      input: inputLabel,
      provider_request_id: result.providerRequestId ?? null,
      usage: result.usage ?? null,
      output: outPath,
    },
    null,
    2,
  ),
);

console.log(`stage:    ${stage}`);
console.log(`model:    ${model}`);
console.log(`draft:    ${outPath}`);
console.log(`log:      ${logPath}`);
if (result.usage) {
  const { promptTokens, completionTokens, costUsd } = result.usage;
  console.log(
    `usage:    ${promptTokens ?? '?'} in / ${completionTokens ?? '?'} out` +
      (costUsd === undefined ? '' : ` — $${costUsd.toFixed(4)}`),
  );
}
console.log('--- draft ---');
console.log(JSON.stringify(result.draft, null, 2));
