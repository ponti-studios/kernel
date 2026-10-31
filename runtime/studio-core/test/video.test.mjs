import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { CHARACTER_LOCK, OpenRouterVideoError, OpenRouterVideoModel } from '../scripts/lib/video.mjs';

function scripted(responses) {
  let i = 0;
  return async () => {
    const next = responses[Math.min(i, responses.length - 1)];
    i += 1;
    if (next.body instanceof Uint8Array) return new Response(next.body, { status: next.status });
    return new Response(JSON.stringify(next.body), {
      status: next.status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

const CLIP = {
  model: 'kwaivgi/kling-v3.0-std',
  prompt: 'A library.',
  duration: 3,
  aspectRatio: '16:9',
  resolution: '720p',
};

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('OpenRouterVideoModel', () => {
  it('submits and returns the polling url', async () => {
    globalThis.fetch = scripted([{ status: 202, body: { id: 'job-1', polling_url: '/api/v1/videos/job-1' } }]);
    const job = await new OpenRouterVideoModel('key').submit(CLIP);
    assert.deepEqual(job, { id: 'job-1', pollingUrl: '/api/v1/videos/job-1' });
  });

  it('sends the documented submit body', async () => {
    let seen;
    globalThis.fetch = async (url, init) => {
      seen = { url, init };
      return new Response(JSON.stringify({ id: 'job-2', polling_url: '/api/v1/videos/job-2' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    };
    await new OpenRouterVideoModel('key').submit({ ...CLIP, seed: 42 });
    assert.equal(seen.url, 'https://openrouter.ai/api/v1/videos');
    assert.equal(seen.init.method, 'POST');
    assert.equal(seen.init.headers.Authorization, 'Bearer key');
    assert.deepEqual(JSON.parse(seen.init.body), {
      model: 'kwaivgi/kling-v3.0-std',
      prompt: 'A library.',
      duration: 3,
      aspect_ratio: '16:9',
      resolution: '720p',
      generate_audio: false,
      seed: 42,
    });
  });

  it('maps 402 to credits', async () => {
    globalThis.fetch = scripted([{ status: 402, body: {} }]);
    await assert.rejects(new OpenRouterVideoModel('key').submit(CLIP), { code: 'credits' });
  });

  it('maps a non-202 submit to http', async () => {
    globalThis.fetch = scripted([{ status: 200, body: {} }]);
    await assert.rejects(new OpenRouterVideoModel('key').submit(CLIP), { code: 'http' });
  });

  it('rejects a submit without id or polling_url', async () => {
    globalThis.fetch = scripted([{ status: 202, body: { id: 'job-3' } }]);
    await assert.rejects(new OpenRouterVideoModel('key').submit(CLIP), { code: 'shape' });
  });

  it('resolves a relative polling url against the api base', async () => {
    const urls = [];
    let i = 0;
    globalThis.fetch = async (url) => {
      urls.push(url);
      i += 1;
      if (i === 1) {
        return new Response(JSON.stringify({ id: 'job-1', polling_url: '/videos/job-1' }), {
          status: 202,
        });
      }
      return new Response(JSON.stringify({ status: 'completed', unsigned_urls: ['https://cdn/z.mp4'] }), {
        status: 200,
      });
    };
    const job = await new OpenRouterVideoModel('key').submit(CLIP);
    await new OpenRouterVideoModel('key').poll(job.pollingUrl);
    assert.equal(urls[0], 'https://openrouter.ai/api/v1/videos');
    assert.equal(urls[1], 'https://openrouter.ai/api/v1/videos/job-1');
  });

  it('polls to completion and downloads bytes', async () => {
    globalThis.fetch = scripted([
      { status: 202, body: { id: 'job-1', polling_url: '/api/v1/videos/job-1' } },
      { status: 200, body: { status: 'pending', unsigned_urls: [] } },
      { status: 200, body: { status: 'completed', unsigned_urls: ['https://cdn/x.mp4'] } },
      { status: 200, body: new Uint8Array([1, 2, 3, 4]) },
    ]);
    const bytes = await new OpenRouterVideoModel('key').generateClip(CLIP, {
      pollIntervalMs: 1,
      timeoutMs: 5000,
    });
    assert.equal(bytes.length, 4);
  });

  it('throws the job error on failure', async () => {
    globalThis.fetch = scripted([
      { status: 202, body: { id: 'job-1', polling_url: '/api/v1/videos/job-1' } },
      { status: 200, body: { status: 'failed', error: 'boom' } },
    ]);
    await assert.rejects(new OpenRouterVideoModel('key').generateClip(CLIP, { pollIntervalMs: 1 }), (error) => {
      assert.ok(error instanceof OpenRouterVideoError);
      assert.equal(error.code, 'failed');
      assert.equal(error.message, 'boom');
      return true;
    });
  });

  it('times out while a job is still pending', async () => {
    globalThis.fetch = scripted([
      { status: 202, body: { id: 'job-1', polling_url: '/api/v1/videos/job-1' } },
      { status: 200, body: { status: 'in_progress', unsigned_urls: [] } },
    ]);
    await assert.rejects(
      new OpenRouterVideoModel('key').generateClip(CLIP, { pollIntervalMs: 1, timeoutMs: 0 }),
      { code: 'timeout' },
    );
  });

  // The whole point of generateClipWithUsage: the price arrives on the poll.
  it('surfaces the reported cost when it completes', async () => {
    globalThis.fetch = scripted([
      { status: 202, body: { id: 'job-9', polling_url: '/api/v1/videos/job-9' } },
      { status: 200, body: { status: 'in_progress', unsigned_urls: [] } },
      {
        status: 200,
        body: { status: 'completed', unsigned_urls: ['https://cdn/x.mp4'], usage: { cost: 0.084 } },
      },
      { status: 200, body: new Uint8Array([7, 8]) },
    ]);
    const result = await new OpenRouterVideoModel('key').generateClipWithUsage(CLIP, {
      pollIntervalMs: 1,
      timeoutMs: 5000,
    });
    assert.equal(result.bytes.length, 2);
    assert.equal(result.jobId, 'job-9');
    assert.equal(result.usage?.costUsd, 0.084);
  });

  it('keeps the cost the submit reported rather than the poll overwriting it', async () => {
    globalThis.fetch = scripted([
      {
        status: 202,
        body: { id: 'job-11', polling_url: '/api/v1/videos/job-11', usage: { cost: 0.05 } },
      },
      {
        status: 200,
        body: { status: 'completed', unsigned_urls: ['https://cdn/x.mp4'], usage: { cost: 0.084 } },
      },
      { status: 200, body: new Uint8Array([1]) },
    ]);
    const result = await new OpenRouterVideoModel('key').generateClipWithUsage(CLIP, {
      pollIntervalMs: 1,
      timeoutMs: 5000,
    });
    assert.equal(result.usage.costUsd, 0.05);
  });

  it('fills in the poll cost when the submit reported none', async () => {
    globalThis.fetch = scripted([
      { status: 202, body: { id: 'job-12', polling_url: '/api/v1/videos/job-12' } },
      {
        status: 200,
        body: {
          status: 'completed',
          unsigned_urls: ['https://cdn/x.mp4'],
          usage: { cost: 0.084, completion_tokens_details: { image_tokens: 99 } },
        },
      },
      { status: 200, body: new Uint8Array([1]) },
    ]);
    const result = await new OpenRouterVideoModel('key').generateClipWithUsage(CLIP, {
      pollIntervalMs: 1,
      timeoutMs: 5000,
    });
    assert.deepEqual(result.usage, { costUsd: 0.084, imageTokens: 99 });
  });

  it('leaves usage undefined when the provider reports none', async () => {
    globalThis.fetch = scripted([
      { status: 202, body: { id: 'job-10', polling_url: '/api/v1/videos/job-10' } },
      { status: 200, body: { status: 'completed', unsigned_urls: ['https://cdn/y.mp4'] } },
      { status: 200, body: new Uint8Array([1]) },
    ]);
    const result = await new OpenRouterVideoModel('key').generateClipWithUsage(CLIP, {
      pollIntervalMs: 1,
      timeoutMs: 5000,
    });
    assert.equal(result.usage, undefined);
  });

  it('rejects an empty download', async () => {
    globalThis.fetch = scripted([{ status: 200, body: new Uint8Array([]) }]);
    await assert.rejects(new OpenRouterVideoModel('key').download('https://cdn/x.mp4'), {
      code: 'empty',
    });
  });

  it('ships the character lock text', () => {
    assert.match(CHARACTER_LOCK, /Character lock/);
    assert.match(CHARACTER_LOCK, /Never two kings, never two queens/);
  });
});
