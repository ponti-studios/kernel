// OpenRouter chat completions (POST /api/v1/chat/completions).
//
// Ported from studio packages/providers/src/openrouter.ts, which used
// @openrouter/sdk. The SDK is gone; this is plain fetch against the same
// documented endpoint, with the same request body, the same idempotency header
// and the same result shape.
import { normalizeUsage } from './usage.mjs';

const BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterError extends Error {
  constructor(code, message, providerRequestId) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
    this.providerRequestId = providerRequestId;
  }
}

export class OpenRouterTextModel {
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
    const messages = [];
    if (input.system) messages.push({ role: 'system', content: input.system });
    messages.push({ role: 'user', content: input.user });

    const body = {
      model: input.model ?? this.#defaultModel,
      messages,
      ...(input.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };
    const headers = {
      ...this.#headers,
      ...(input.idempotencyKey ? { 'X-Idempotency-Key': input.idempotencyKey } : {}),
    };

    let response;
    try {
      response = await this.#fetchImpl(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (cause) {
      throw normalizeError(cause, 'openrouter request failed');
    }

    const payload = await readJson(response);
    // An error body is an http-level failure whatever status carried it: the
    // SDK surfaced these as its own API error, and callers branch on 'http'.
    if (payload?.error) {
      throw new OpenRouterError(
        'http',
        payload.error.message ?? `openrouter text ${response.status}`,
        payload.id,
      );
    }
    if (!response.ok) {
      throw new OpenRouterError('http', `openrouter text ${response.status}`, payload?.id);
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new OpenRouterError('empty', 'openrouter returned no content', payload?.id);
    }

    const usage = textUsage(payload.usage);
    return {
      content,
      provider: 'openrouter',
      providerRequestId: payload.id,
      ...(usage ? { usage } : {}),
    };
  }
}

/**
 * Chat usage in the shape the app and the ledger already read: totalTokens is
 * prompt+completion, with the provider's own total kept beside it when the two
 * disagree (cache and reasoning accounting make them disagree routinely).
 */
function textUsage(raw) {
  const usage = normalizeUsage(raw);
  if (!usage) return undefined;
  const { promptTokens, completionTokens, totalTokens, ...rest } = usage;
  if (promptTokens === undefined && completionTokens === undefined) return undefined;
  const sum = (promptTokens ?? 0) + (completionTokens ?? 0);
  return {
    promptTokens: promptTokens ?? 0,
    completionTokens: completionTokens ?? 0,
    totalTokens: sum,
    ...(totalTokens !== undefined && totalTokens !== sum ? { reportedTotalTokens: totalTokens } : {}),
    ...rest,
  };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function normalizeError(cause, fallbackMessage) {
  const error = cause;
  return new OpenRouterError(
    error?.statusCode ? 'http' : 'network',
    error?.message ?? fallbackMessage,
  );
}
