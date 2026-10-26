// Bridge from this skill to the shared ledger (~/.studio).
//
// Deliberately tiny and dependency-free: the ledger is plain ESM so a skill can
// append a fact without the monorepo being built. Every studio-* skill should
// carry this same five-line bridge.
import { join } from 'node:path';

// The ledger ships as the studio-ledger skill, sitting beside this one.
const base = process.env.STUDIO_LEDGER_LIB
  ?? join(import.meta.dirname, '..', '..', '..', 'studio-ledger', 'scripts', 'lib');

const { appendEvent, registerAsset } = await import(join(base, 'ledger.mjs'));
const { PRICE_BOOK, estimateImage } = await import(join(base, 'prices.mjs'));

// Record what was spent and what came out of it. Never let bookkeeping break a
// render: a ledger failure is reported, not thrown.
export async function recordRender({ model, resolution, promptSha256, params, generationId, costUsd, outputPath, idempotencyKey }) {
  try {
    const estimate = estimateImage(model, resolution);
    const cost = typeof costUsd === 'number'
      ? { usd: costUsd, source: 'reported', price_book: PRICE_BOOK, basis: 'provider generation record' }
      : estimate
        ? { usd: estimate.usd, source: 'estimated', price_book: PRICE_BOOK, basis: estimate.basis }
        : { usd: null, source: 'unknown', price_book: PRICE_BOOK, basis: 'no measured price for this model' };

    const { event } = appendEvent({
      tool: 'studio-imagegen',
      surface: 'cli',
      stage: 'render',
      provider: 'openrouter',
      model,
      prompt_sha256: promptSha256,
      params,
      units: { count: 1, unit: 'image' },
      cost,
      idem: idempotencyKey,
      provider_request_id: generationId ?? null,
      tags: params?.spec ? [String(params.spec).split('/').pop().replace('.json', '')] : [],
    });

    const { asset } = registerAsset({ path: outputPath, run_id: event.id, kind: 'image', model }, { copyBlob: true });
    return { eventId: event.id, assetSha: asset.sha256, cost };
  } catch (err) {
    console.error(`ledger: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}
