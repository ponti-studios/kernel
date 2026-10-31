// Price book. Every estimate records the book version that produced it, so a
// historical number can always be explained. A price we have not measured is
// `null` — the ledger would rather say "unknown" than invent a number.
//
// Image rates below were MEASURED from the provider's own response `usage.cost`
// (OpenRouter returns a full usage block on image responses; the skill used to
// ask /generation, which 404s for images, and so logged null).
export const PRICE_BOOK = 'pb_2026-10-24b';

// per output image: base + per reference image, in USD
export const IMAGE_PRICES = {
  'qwen/qwen-image-2.1-turbo': {
    '1K': { base: 0.0184, per_ref: 0 },
    '2K': { base: 0.16, per_ref: 0 },
  },
  // measured: 1K and 2K both $0.018 with 3 references — Seedream Flash prices the
  // output, not the pixels
  'bytedance-seed/seedream-5-0-flash': {
    '1K': { base: 0.018, per_ref: 0 },
    '2K': { base: 0.018, per_ref: 0 },
  },
  // measured: 1K 0.045 + 0.002/ref = 0.051 with 3 refs; 2K 0.09 + 0.002/ref = 0.096
  'bytedance-seed/seedream-5-0-pro': {
    '1K': { base: 0.045, per_ref: 0.002 },
    '2K': { base: 0.09, per_ref: 0.002 },
  },
  'openai/gpt-image-2.5-sunburst': { '2K': { base: 0.1174, per_ref: 0 } },
};

// per token, USD
export const TEXT_PRICES = {
  'deepseek/deepseek-chat-v3-0324': { in: 0.00000027, out: 0.0000011 },
  'openai/gpt-4o-mini': { in: 0.00000015, out: 0.0000006 },
};

export const SPEECH_PRICES = {
  'elevenlabs/eleven-multilingual-v2': { per_char: null },
};

export const VIDEO_PRICES = {
  'kwaivgi/kling-v3.0-std': { per_second: 0.084, per_second_audio: 0.126 },
};

export function estimateImage(model, resolution, references = 0) {
  const row = IMAGE_PRICES[model];
  if (!row) return null;
  const price = row[resolution] ?? row['1K'];
  if (!price) return null;
  const usd = price.base + price.per_ref * (references || 0);
  const basis =
    `${model} ${resolution} $${price.base}` +
    (price.per_ref ? ` + $${price.per_ref}/reference × ${references || 0}` : '') +
    ' (measured)';
  return { usd: Math.round(usd * 1e6) / 1e6, basis };
}

export function estimateText(model, tokensIn, tokensOut) {
  const row = TEXT_PRICES[model];
  if (!row) return null;
  return {
    usd: (tokensIn || 0) * row.in + (tokensOut || 0) * row.out,
    basis: `${model} per token`,
  };
}
