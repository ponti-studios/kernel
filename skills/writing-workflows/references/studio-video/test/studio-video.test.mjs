import { test } from 'node:test';
import assert from 'node:assert/strict';

import { STAGES, generators } from '../scripts/lib/generate.mjs';

const SCRIPT = { title: 'T', sections: [{ title: 'S', body: 'B' }] };
const fake = (content) => ({
  async generate() {
    return { content, providerRequestId: 'req_1', usage: { promptTokens: 1, completionTokens: 2 } };
  },
});
const run = generators['youtube'];

test('declares its stage', () => {
  assert.ok(STAGES.includes('youtube'));
});

test('youtube returns its draft shape', async () => {
  const { draft } = await run(fake(JSON.stringify({ title: 'T', hook: 'H', segments: [{ heading: 'A', script: 'B' }], callToAction: 'C' })), SCRIPT);
  assert.deepEqual(draft, { title: 'T', hook: 'H', segments: [{ heading: 'A', script: 'B' }], callToAction: 'C' });
});

test('short-video returns beats', async () => {
  const run = generators['short-video'];
  const { draft } = await run(fake(JSON.stringify({ hook: 'H', beats: ['a', 'b'], callToAction: 'C' })), SCRIPT);
  assert.deepEqual(draft, { hook: 'H', beats: ['a', 'b'], callToAction: 'C' });
});

test('rejects non-JSON model output', async () => {
  await assert.rejects(() => run(fake('not json at all'), SCRIPT));
});
