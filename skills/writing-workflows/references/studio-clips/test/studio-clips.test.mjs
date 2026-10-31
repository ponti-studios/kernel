import { test } from 'node:test';
import assert from 'node:assert/strict';

import { STAGES, generators } from '../scripts/lib/generate.mjs';

const SCRIPT = { title: 'T', sections: [{ title: 'S', body: 'B' }] };
const fake = (content) => ({
  async generate() {
    return { content, providerRequestId: 'req_1', usage: { promptTokens: 1, completionTokens: 2 } };
  },
});
const run = generators['social-clips'];

test('declares its stage', () => {
  assert.ok(STAGES.includes('social-clips'));
});

test('social-clips returns its draft shape', async () => {
  const { draft } = await run(fake(JSON.stringify({ tiktok_clips: [{ hook: 'H', timestamp: '0:12', visual: 'V', caption: 'C' }] })), SCRIPT);
  assert.deepEqual(draft, { tiktok_clips: [{ hook: 'H', timestamp: '0:12', visual: 'V', caption: 'C' }] });
});

test('rejects non-JSON model output', async () => {
  await assert.rejects(() => run(fake('not json at all'), SCRIPT));
});
