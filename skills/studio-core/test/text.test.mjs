import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { OpenRouterError, OpenRouterTextModel } from '../scripts/lib/text.mjs';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const CHAT = {
  id: 'req-1',
  created: 1,
  model: 'model',
  object: 'chat.completion',
  system_fingerprint: null,
  choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: 'the episode' } }],
};

// Every test stubs fetch; nothing here touches the network.
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(impl) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return impl(url, init);
  };
  globalThis.fetch = fetchImpl;
  return calls;
}

describe('OpenRouterTextModel', () => {
  it('returns content and provider request id on success', async () => {
    const calls = stubFetch(async () => jsonResponse(CHAT));
    const model = new OpenRouterTextModel('key', 'model');
    const result = await model.generate({ user: 'Brand A: Netflix\nBrand B: Tinder' });
    assert.equal(result.content, 'the episode');
    assert.equal(result.provider, 'openrouter');
    assert.equal(result.providerRequestId, 'req-1');
    assert.equal(result.usage, undefined);
    assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  });

  it('sends bearer auth, the default model and a user message', async () => {
    const calls = stubFetch(async () => jsonResponse(CHAT));
    const model = new OpenRouterTextModel('sk-test', 'default-model');
    await model.generate({ user: 'hello' });
    const { init } = calls[0];
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.Authorization, 'Bearer sk-test');
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.equal('X-Idempotency-Key' in init.headers, false);
    const body = JSON.parse(init.body);
    assert.equal(body.model, 'default-model');
    assert.deepEqual(body.messages, [{ role: 'user', content: 'hello' }]);
    assert.equal('response_format' in body, false);
  });

  it('prepends a system message and forwards the model, idempotency key and jsonMode', async () => {
    const calls = stubFetch(async () => jsonResponse(CHAT));
    const model = new OpenRouterTextModel('key', 'default-model');
    await model.generate({
      system: 'you are terse',
      user: 'hello',
      model: 'override-model',
      idempotencyKey: 'idem-7',
      jsonMode: true,
    });
    const { init } = calls[0];
    assert.equal(init.headers['X-Idempotency-Key'], 'idem-7');
    const body = JSON.parse(init.body);
    assert.equal(body.model, 'override-model');
    assert.deepEqual(body.messages, [
      { role: 'system', content: 'you are terse' },
      { role: 'user', content: 'hello' },
    ]);
    assert.deepEqual(body.response_format, { type: 'json_object' });
  });

  it('returns normalized usage when the provider reports it', async () => {
    const calls = stubFetch(async () =>
      jsonResponse({
        ...CHAT,
        id: 'req-usage',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 35,
          cost: 0.0012,
          prompt_tokens_details: { cached_tokens: 2 },
          completion_tokens_details: { reasoning_tokens: 4 },
        },
      }),
    );
    const model = new OpenRouterTextModel('key', 'model');
    const result = await model.generate({ user: 'x' });
    assert.equal(calls.length, 1);
    assert.deepEqual(result.usage, {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
      reportedTotalTokens: 35,
      costUsd: 0.0012,
      cachedPromptTokens: 2,
      reasoningTokens: 4,
    });
  });

  it('omits reportedTotalTokens when the provider total agrees', async () => {
    stubFetch(async () =>
      jsonResponse({
        ...CHAT,
        usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7, cost: 0 },
      }),
    );
    const model = new OpenRouterTextModel('key', 'model');
    const result = await model.generate({ user: 'x' });
    assert.deepEqual(result.usage, {
      promptTokens: 3,
      completionTokens: 4,
      totalTokens: 7,
      costUsd: 0,
    });
  });

  it('leaves usage undefined when the response carries none', async () => {
    stubFetch(async () => jsonResponse(CHAT));
    const model = new OpenRouterTextModel('key', 'model');
    const result = await model.generate({ user: 'x' });
    assert.equal(result.usage, undefined);
  });

  it('throws OpenRouterError code http when the provider reports an error body', async () => {
    stubFetch(async () => jsonResponse({ error: { message: 'rate limited' } }));
    const model = new OpenRouterTextModel('key', 'model');
    await assert.rejects(model.generate({ user: 'x' }), (error) => {
      assert.ok(error instanceof OpenRouterError);
      assert.equal(error.code, 'http');
      assert.equal(error.message, 'rate limited');
      return true;
    });
  });

  it('throws OpenRouterError code http on a non-2xx response', async () => {
    stubFetch(async () => jsonResponse({}, 429));
    const model = new OpenRouterTextModel('key', 'model');
    await assert.rejects(model.generate({ user: 'x' }), (error) => {
      assert.equal(error.code, 'http');
      assert.equal(error.message, 'openrouter text 429');
      return true;
    });
  });

  it('throws OpenRouterError code empty when there is no content', async () => {
    stubFetch(async () => jsonResponse({ id: 'req-2', choices: [{ message: {} }] }));
    const model = new OpenRouterTextModel('key', 'model');
    await assert.rejects(model.generate({ user: 'x' }), (error) => {
      assert.equal(error.code, 'empty');
      assert.equal(error.providerRequestId, 'req-2');
      return true;
    });
  });

  it('throws OpenRouterError code network on network failure', async () => {
    globalThis.fetch = async () => {
      throw new Error('socket closed');
    };
    const model = new OpenRouterTextModel('key', 'model');
    await assert.rejects(model.generate({ user: 'x' }), (error) => {
      assert.equal(error.code, 'network');
      assert.equal(error.message, 'socket closed');
      return true;
    });
  });

  it('accepts an injected fetch implementation', async () => {
    let seen = 0;
    const model = new OpenRouterTextModel('key', 'model', async () => {
      seen += 1;
      return jsonResponse(CHAT);
    });
    await model.generate({ user: 'x' });
    assert.equal(seen, 1);
  });
});
