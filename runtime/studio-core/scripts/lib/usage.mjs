// One reader for provider usage metadata.
//
// OpenRouter reports what a call actually cost, but the shape differs per
// endpoint: chat completions may come back camelCased through an SDK, image and
// video responses are raw snake_case JSON. Reading `usage` ad hoc is how every
// image render ended up logged as `cost_usd: null` for a month — the code asked
// a different endpoint instead. Every provider normalises through here, and a
// provider that reports nothing yields `undefined` rather than zero, so
// "unpriced" stays distinguishable from "free".
//
// Ported from studio packages/providers/src/usage.ts. No dependencies.

const finite = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

const bag = (value) => (typeof value === 'object' && value !== null ? value : undefined);

function pick(raw, ...keys) {
  for (const key of keys) {
    const value = finite(raw[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function collapse(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Normalise a `usage` block from any OpenRouter endpoint. `undefined` when absent. */
export function normalizeUsage(raw) {
  const usage = bag(raw);
  if (!usage) return undefined;

  const completionDetails =
    bag(usage.completion_tokens_details) ?? bag(usage.completionTokensDetails);
  const promptDetails = bag(usage.prompt_tokens_details) ?? bag(usage.promptTokensDetails);

  const normalized = collapse({
    costUsd: pick(usage, 'cost', 'costUsd', 'total_cost', 'totalCost'),
    promptTokens: pick(usage, 'prompt_tokens', 'promptTokens'),
    completionTokens: pick(usage, 'completion_tokens', 'completionTokens'),
    totalTokens: pick(usage, 'total_tokens', 'totalTokens'),
    imageTokens: completionDetails ? pick(completionDetails, 'image_tokens', 'imageTokens') : undefined,
    reasoningTokens: completionDetails
      ? pick(completionDetails, 'reasoning_tokens', 'reasoningTokens')
      : undefined,
    cachedPromptTokens: promptDetails
      ? pick(promptDetails, 'cached_tokens', 'cachedTokens')
      : undefined,
  });

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

/** Merge usage blocks, keeping the first reported value for each field. */
export function mergeUsage(...blocks) {
  const merged = {};
  for (const block of blocks) {
    if (!block) continue;
    for (const [key, value] of Object.entries(block)) {
      if (value !== undefined && merged[key] === undefined) merged[key] = value;
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** True only when the provider itself gave us a price. */
export function hasReportedCost(usage) {
  return usage?.costUsd !== undefined;
}
