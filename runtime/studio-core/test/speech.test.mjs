import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { OpenRouterSpeechError, OpenRouterSpeechModel } from '../scripts/lib/speech.mjs';

function audioResponse(bytes, status = 200) {
  return new Response(new Uint8Array(bytes), { status });
}

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('OpenRouterSpeechModel', () => {
  it('returns audio bytes on success', async () => {
    globalThis.fetch = async () => audioResponse([1, 2, 3]);
    const result = await new OpenRouterSpeechModel('key').synthesize({
      model: 'elevenlabs/eleven-multilingual-v2',
      voice: 'v1',
      text: 'Hello.',
    });
    assert.equal(result.byteLength, 3);
    assert.equal(result.audio.length, 3);
    assert.equal(result.voice, 'v1');
  });

  it('sends the OpenAI-compatible speech body with mp3 by default', async () => {
    let seen;
    globalThis.fetch = async (url, init) => {
      seen = { url, init };
      return audioResponse([1]);
    };
    await new OpenRouterSpeechModel('key').synthesize({ model: 'm', voice: 'v', text: ' hi ' });
    assert.equal(seen.url, 'https://openrouter.ai/api/v1/audio/speech');
    assert.equal(seen.init.headers.Authorization, 'Bearer key');
    assert.deepEqual(JSON.parse(seen.init.body), {
      model: 'm',
      input: 'hi',
      voice: 'v',
      response_format: 'mp3',
    });
  });

  it('passes a pcm response format through', async () => {
    let body;
    globalThis.fetch = async (_url, init) => {
      body = JSON.parse(init.body);
      return audioResponse([1]);
    };
    await new OpenRouterSpeechModel('key').synthesize({
      model: 'm',
      voice: 'v',
      text: 'hi',
      responseFormat: 'pcm',
    });
    assert.equal(body.response_format, 'pcm');
  });

  it('rejects empty text before any request', async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return audioResponse([1]);
    };
    await assert.rejects(
      new OpenRouterSpeechModel('key').synthesize({ model: 'm', voice: 'v1', text: '  ' }),
      (error) => {
        assert.ok(error instanceof OpenRouterSpeechError);
        assert.equal(error.code, 'empty');
        return true;
      },
    );
    assert.equal(called, false);
  });

  it('maps 402 to credits', async () => {
    globalThis.fetch = async () => audioResponse([], 402);
    await assert.rejects(
      new OpenRouterSpeechModel('key').synthesize({ model: 'm', voice: 'v1', text: 'Hi.' }),
      { code: 'credits' },
    );
  });

  it('maps other failures to http and rejects empty audio', async () => {
    globalThis.fetch = async () => audioResponse([], 500);
    await assert.rejects(
      new OpenRouterSpeechModel('key').synthesize({ model: 'm', voice: 'v', text: 'Hi.' }),
      { code: 'http' },
    );
    globalThis.fetch = async () => audioResponse([]);
    await assert.rejects(
      new OpenRouterSpeechModel('key').synthesize({ model: 'm', voice: 'v', text: 'Hi.' }),
      { code: 'empty' },
    );
  });

  it('reports billed characters and the generation id', async () => {
    globalThis.fetch = async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg', 'X-Generation-Id': 'gen-speech-1' },
      });
    const result = await new OpenRouterSpeechModel('key').synthesize({
      model: 'm',
      voice: 'v',
      text: '  hello there  ',
    });
    assert.equal(result.characters, 'hello there'.length);
    assert.equal(result.providerRequestId, 'gen-speech-1');
  });
});
