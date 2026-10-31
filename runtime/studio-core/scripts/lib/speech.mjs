// OpenRouter text-to-speech via POST /api/v1/audio/speech (OpenAI Audio Speech
// compatible). Raw fetch: the response is audio bytes, not JSON.
//
// Ported from studio packages/providers/src/openrouter-speech.ts.
const BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterSpeechError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OpenRouterSpeechError';
    this.code = code;
  }
}

export class OpenRouterSpeechModel {
  #apiKey;
  #fetchImpl;

  constructor(apiKey, fetchImpl = globalThis.fetch) {
    this.#apiKey = apiKey;
    this.#fetchImpl = fetchImpl;
  }

  async synthesize(input) {
    const text = input.text.trim();
    if (!text) throw new OpenRouterSpeechError('empty', 'nothing to synthesize');

    let response;
    try {
      response = await this.#fetchImpl(`${BASE_URL}/audio/speech`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model,
          input: text,
          voice: input.voice,
          response_format: input.responseFormat ?? 'mp3',
        }),
      });
    } catch (cause) {
      throw new OpenRouterSpeechError(
        'network',
        cause instanceof Error ? cause.message : 'speech request failed',
      );
    }
    if (response.status === 402) {
      throw new OpenRouterSpeechError('credits', 'openrouter credits insufficient');
    }
    if (!response.ok) {
      throw new OpenRouterSpeechError('http', `speech ${response.status}`);
    }
    const providerRequestId =
      response.headers.get('X-Generation-Id') ?? response.headers.get('x-generation-id') ?? undefined;
    const audio = new Uint8Array(await response.arrayBuffer());
    if (audio.length === 0) {
      throw new OpenRouterSpeechError('empty', 'speech returned no audio');
    }
    return {
      audio,
      voice: input.voice,
      byteLength: audio.length,
      // Speech is priced per character, not per token.
      characters: text.length,
      ...(providerRequestId ? { providerRequestId } : {}),
    };
  }
}
