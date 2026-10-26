import { test } from 'node:test';
import assert from 'node:assert/strict';

import { STAGES, generators } from '../scripts/lib/generate.mjs';

const SCRIPT = { title: 'T', sections: [{ title: 'S', body: 'B' }] };
const fake = (content) => ({
  async generate() {
    return { content, providerRequestId: 'req_1', usage: { promptTokens: 1, completionTokens: 2 } };
  },
});
const run = generators['tweet'];

test('declares its stage', () => {
  assert.ok(STAGES.includes('tweet'));
});

test('tweet returns its draft shape', async () => {
  const { draft } = await run(fake(JSON.stringify({ tweets: ['one', 'two'] })), SCRIPT);
  assert.deepEqual(draft, { tweets: ['one', 'two'] });
});

test('x-posts accepts exactly five', async () => {
  const run = generators['x-posts'];
  const posts = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, type: 'insight', text: `p${i}` }));
  const { draft } = await run(fake(JSON.stringify({ posts })), SCRIPT);
  assert.equal(draft.posts.length, 5);
});

test('x-posts rejects a sixth post', async () => {
  const run = generators['x-posts'];
  const posts = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, type: 'insight', text: `p${i}` }));
  await assert.rejects(() => run(fake(JSON.stringify({ posts })), SCRIPT));
});

test('linkedin returns content', async () => {
  const { draft } = await generators.linkedin(fake(JSON.stringify({ content: 'hello' })), SCRIPT);
  assert.equal(draft.content, 'hello');
});

test('rejects non-JSON model output', async () => {
  await assert.rejects(() => run(fake('not json at all'), SCRIPT));
});
