// Bridge from a generating skill to the shared ledger (~/.studio).
//
// The ledger sits beside this file in studio-core, so every bundled skill reaches it
// the same way and no skill reaches across folders. The ledger is loaded lazily and
// inside the try: a missing or broken ledger is reported, and the render goes on.
// Set STUDIO_LEDGER_LIB to point at another copy (tests use this).
import { join } from "node:path";

const libDir = () => process.env.STUDIO_LEDGER_LIB ?? import.meta.dirname;

/** Record what was spent and what came out of it. Returns null when bookkeeping fails. */
export async function recordRender({
  tool,
  model,
  promptSha256,
  params,
  generationId,
  costUsd,
  outputPath,
  idempotencyKey,
}) {
  try {
    const base = libDir();
    const { appendEvent, registerAsset } = await import(join(base, "ledger.mjs"));
    const { PRICE_BOOK } = await import(join(base, "prices.mjs"));
    const cost =
      typeof costUsd === "number"
        ? {
            usd: costUsd,
            source: "reported",
            price_book: PRICE_BOOK,
            basis: "provider generation record",
          }
        : {
            usd: null,
            source: "unknown",
            price_book: PRICE_BOOK,
            basis: "provider did not report a price",
          };

    const { event } = appendEvent({
      tool,
      surface: "cli",
      stage: "render",
      provider: "openrouter",
      model,
      prompt_sha256: promptSha256,
      params,
      units: { count: 1, unit: "image" },
      cost,
      idem: idempotencyKey,
      provider_request_id: generationId ?? null,
      tags: params?.spec ? [String(params.spec).split("/").pop().replace(".json", "")] : [],
    });

    const { asset } = registerAsset(
      { path: outputPath, run_id: event.id, kind: "image", model },
      { copyBlob: true },
    );
    return { eventId: event.id, assetSha: asset.sha256, cost };
  } catch (err) {
    console.error(`ledger: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}
