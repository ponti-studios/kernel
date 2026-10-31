// OpenRouter image generation: POST /api/v1/images.
//
// Reference plates ride as data URLs, so no public hosting is needed. Raw fetch:
// the response carries base64 bytes, and cost is recovered per generation id
// (or, better, straight off the response's usage block).
//
// Ported from studio packages/providers/src/openrouter-images.ts.
import { normalizeUsage } from './usage.mjs';

const BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterImageError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OpenRouterImageError';
    this.code = code;
  }
}

export class OpenRouterImageModel {
  #apiKey;
  #defaultModel;
  #fetchImpl;

  constructor(apiKey, defaultModel, fetchImpl = globalThis.fetch) {
    this.#apiKey = apiKey;
    this.#defaultModel = defaultModel;
    this.#fetchImpl = fetchImpl;
  }

  get #headers() {
    return {
      Authorization: `Bearer ${this.#apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async generate(input) {
    const model = input.model || this.#defaultModel;
    let response;
    try {
      response = await this.#fetchImpl(`${BASE_URL}/images`, {
        method: 'POST',
        headers: this.#headers,
        body: JSON.stringify({
          model,
          prompt: input.prompt,
          input_references: (input.references ?? []).map((r) => ({
            type: 'image_url',
            image_url: { url: r.dataUrl },
          })),
          aspect_ratio: input.aspectRatio,
          resolution: input.resolution,
          output_format: input.outputFormat,
        }),
      });
    } catch (cause) {
      throw new OpenRouterImageError(
        'network',
        cause instanceof Error ? cause.message : 'image request failed',
      );
    }
    if (response.status === 402) {
      throw new OpenRouterImageError('credits', 'openrouter credits insufficient');
    }
    if (!response.ok) {
      throw new OpenRouterImageError('http', `image generation ${response.status}`);
    }
    const generationId =
      response.headers.get('X-Generation-Id') ?? response.headers.get('x-generation-id') ?? undefined;
    let body;
    try {
      body = await response.json();
    } catch {
      throw new OpenRouterImageError('shape', 'image response was not JSON');
    }
    const item = body?.data?.[0];
    if (!item?.b64_json) {
      throw new OpenRouterImageError('shape', 'image response has no b64_json output');
    }
    const usage = normalizeUsage(body.usage);
    const bytes = Uint8Array.from(Buffer.from(item.b64_json, 'base64'));
    if (bytes.length === 0) {
      throw new OpenRouterImageError('empty', 'image response decoded to no bytes');
    }
    return {
      bytes,
      mimeType: input.outputFormat === 'png' ? 'image/png' : 'image/webp',
      ...(item.media_type ? { mediaType: item.media_type } : {}),
      ...((generationId ?? body.id) ? { generationId: generationId ?? body.id } : {}),
      ...(usage ? { usage } : {}),
    };
  }

  /** Cost for one generation. Never throws: an unpriced render returns {}. */
  async generationCost(generationId) {
    try {
      const response = await this.#fetchImpl(
        `${BASE_URL}/generation?id=${generationId}`,
        { headers: this.#headers },
      );
      if (!response.ok) return {};
      const body = await response.json();
      const data = body?.data ?? {};
      return {
        ...(data.total_cost !== undefined ? { totalCost: data.total_cost } : {}),
        ...(data.tokens_prompt !== undefined ? { promptTokens: data.tokens_prompt } : {}),
        ...(data.tokens_completion !== undefined ? { completionTokens: data.tokens_completion } : {}),
        ...(data.total_tokens !== undefined ? { totalTokens: data.total_tokens } : {}),
      };
    } catch {
      return {};
    }
  }
}
