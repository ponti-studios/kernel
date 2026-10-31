import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { OpenRouterImageError, OpenRouterImageModel } from '../scripts/lib/images.mjs';

function bytesResponse(body, status = 200, generationId) {
  const headers = { 'Content-Type': 'application/json' };
  if (generationId) headers['X-Generation-Id'] = generationId;
  if (body instanceof Uint8Array) return new Response(body, { status, headers });
  return new Response(JSON.stringify(body), { status, headers });
}

const INPUT = {
  model: 'qwen/qwen-image-2.1-turbo',
  prompt: 'A picture palace.',
  references: [{ dataUrl: 'data:image/png;base64,AAA' }],
  aspectRatio: '4:5',
  resolution: '2K',
  outputFormat: 'webp',
};

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('OpenRouterImageModel', () => {
  it('decodes b64 output and keeps the generation id', async () => {
    const b64 = Buffer.from([1, 2, 3]).toString('base64');
    globalThis.fetch = async () => bytesResponse({ data: [{ b64_json: b64, media_type: 'image/webp' }] }, 200, 'gen-1');
    const model = new OpenRouterImageModel('key', 'm');
    const result = await model.generate(INPUT);
    assert.equal(result.bytes.length, 3);
    assert.deepEqual([...result.bytes], [1, 2, 3]);
    assert.equal(result.mimeType, 'image/webp');
    assert.equal(result.mediaType, 'image/webp');
    assert.equal(result.generationId, 'gen-1');
  });

  it('falls back to the response body id when the header is absent', async () => {
    const b64 = Buffer.from([4]).toString('base64');
    globalThis.fetch = async () => bytesResponse({ id: 'gen-body', data: [{ b64_json: b64 }] });
    const result = await new OpenRouterImageModel('key', 'm').generate(INPUT);
    assert.equal(result.generationId, 'gen-body');
  });

  it('sends the documented image body with references as image_url objects', async () => {
    let sent;
    globalThis.fetch = async (url, init) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/images');
      assert.equal(init.method, 'POST');
      assert.equal(init.headers.Authorization, 'Bearer key');
      sent = JSON.parse(String(init.body));
      return bytesResponse({ data: [{ b64_json: Buffer.from([9]).toString('base64') }] });
    };
    await new OpenRouterImageModel('key', 'm').generate(INPUT);
    assert.deepEqual(sent, {
      model: 'qwen/qwen-image-2.1-turbo',
      prompt: 'A picture palace.',
      input_references: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,AAA' } }],
      aspect_ratio: '4:5',
      resolution: '2K',
      output_format: 'webp',
    });
  });

  it('uses the default model when the input model is empty', async () => {
    let sent;
    globalThis.fetch = async (_url, init) => {
      sent = JSON.parse(String(init.body));
      return bytesResponse({ data: [{ b64_json: Buffer.from([1]).toString('base64') }] });
    };
    await new OpenRouterImageModel('key', 'fallback-model').generate({ ...INPUT, model: '' });
    assert.equal(sent.model, 'fallback-model');
  });

  it('reads the reported usage block, including cost', async () => {
    const b64 = Buffer.from([1]).toString('base64');
    globalThis.fetch = async () =>
      bytesResponse({
        data: [{ b64_json: b64 }],
        usage: {
          cost: 0.018,
          prompt_tokens: 16,
          completion_tokens: 1088,
          total_tokens: 1104,
          completion_tokens_details: { image_tokens: 1024 },
        },
      });
    const result = await new OpenRouterImageModel('key', 'm').generate(INPUT);
    assert.deepEqual(result.usage, {
      costUsd: 0.018,
      promptTokens: 16,
      completionTokens: 1088,
      totalTokens: 1104,
      imageTokens: 1024,
    });
  });

  // The bug that made every image render unpriced for weeks: the response DID
  // carry the cost, but nothing read it, and the caller fell back to an endpoint
  // that 404s for images. A response without usage must say so, not say zero.
  it('leaves usage undefined when the response carries none', async () => {
    const b64 = Buffer.from([1]).toString('base64');
    globalThis.fetch = async () => bytesResponse({ data: [{ b64_json: b64 }] }, 200, 'gen-2');
    const result = await new OpenRouterImageModel('key', 'm').generate(INPUT);
    assert.equal(result.usage, undefined);
    assert.equal(result.generationId, 'gen-2');
  });

  it('maps 402 to credits', async () => {
    globalThis.fetch = async () => bytesResponse({}, 402);
    await assert.rejects(new OpenRouterImageModel('key', 'm').generate(INPUT), (error) => {
      assert.ok(error instanceof OpenRouterImageError);
      assert.equal(error.code, 'credits');
      return true;
    });
  });

  it('maps other non-2xx to http', async () => {
    globalThis.fetch = async () => bytesResponse({}, 500);
    await assert.rejects(new OpenRouterImageModel('key', 'm').generate(INPUT), { code: 'http' });
  });

  it('maps a transport failure to network', async () => {
    globalThis.fetch = async () => {
      throw new Error('dns');
    };
    await assert.rejects(new OpenRouterImageModel('key', 'm').generate(INPUT), { code: 'network' });
  });

  it('rejects responses without image data', async () => {
    globalThis.fetch = async () => bytesResponse({ data: [] });
    await assert.rejects(new OpenRouterImageModel('key', 'm').generate(INPUT), { code: 'shape' });
  });

  it('recovers cost per generation id, tolerating lookup failure', async () => {
    globalThis.fetch = async () => bytesResponse({ data: { total_cost: 0.05, total_tokens: 1200 } });
    const model = new OpenRouterImageModel('key', 'm');
    assert.deepEqual(await model.generationCost('gen-1'), { totalCost: 0.05, totalTokens: 1200 });

    globalThis.fetch = async () => {
      throw new Error('down');
    };
    assert.deepEqual(await new OpenRouterImageModel('key', 'm').generationCost('gen-1'), {});
  });

  it('returns an empty cost object when the lookup is not ok', async () => {
    globalThis.fetch = async () => bytesResponse({}, 404);
    assert.deepEqual(await new OpenRouterImageModel('key', 'm').generationCost('gen-1'), {});
  });
});
