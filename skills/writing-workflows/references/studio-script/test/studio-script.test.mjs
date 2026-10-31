import { test } from 'node:test';
import assert from 'node:assert/strict';

import { STAGES, generators } from '../scripts/lib/generate.mjs';

const SCRIPT = { title: 'T', sections: [{ title: 'S', body: 'B' }] };
const fake = (content) => ({
  async generate() {
    return { content, providerRequestId: 'req_1', usage: { promptTokens: 1, completionTokens: 2 } };
  },
});
const run = generators['script'];

test('declares its stage', () => {
  assert.ok(STAGES.includes('script'));
});

test('script returns its draft shape', async () => {
  const { draft } = await run(fake(JSON.stringify({ title: 'T', sections: [{ title: 'S', body: 'B' }] })), 'brief text');
  assert.deepEqual(draft, { title: 'T', sections: [{ title: 'S', body: 'B' }] });
});

test('rejects non-JSON model output', async () => {
  await assert.rejects(() => run(fake('not json at all'), 'brief text'));
});
