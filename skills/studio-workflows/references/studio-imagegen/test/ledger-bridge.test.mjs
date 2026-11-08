import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

const dirs = [];
const oldLedgerLib = process.env.STUDIO_LEDGER_LIB;
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  if (oldLedgerLib === undefined) delete process.env.STUDIO_LEDGER_LIB;
  else process.env.STUDIO_LEDGER_LIB = oldLedgerLib;
});

describe("image ledger bridge", () => {
  it("records provider costs and leaves unpriced renders null without estimating", async () => {
    const dir = await mkdtemp(join(tmpdir(), "image-ledger-"));
    dirs.push(dir);
    await writeFile(
      join(dir, "ledger.mjs"),
      `
      export function appendEvent(event) { globalThis.__imageEvent = event; return { event: { id: 'event-1' } }; }
      export function registerAsset() { return { asset: { sha256: 'abc' } }; }
    `,
    );
    await writeFile(
      join(dir, "prices.mjs"),
      `export const PRICE_BOOK = 'test'; export function estimateImage() { throw new Error('must not estimate'); }`,
    );
    process.env.STUDIO_LEDGER_LIB = dir;
    const bridge = await import(
      `${new URL("../scripts/lib/ledger-bridge.mjs", import.meta.url).href}?test=${Date.now()}`
    );
    const base = {
      model: "m",
      promptSha256: "hash",
      params: {},
      generationId: "g",
      outputPath: "/tmp/out.png",
    };
    const priced = await bridge.recordRender({ ...base, costUsd: 0.042 });
    assert.deepEqual(priced.cost, {
      usd: 0.042,
      source: "reported",
      price_book: "test",
      basis: "provider generation record",
    });
    const unpriced = await bridge.recordRender({ ...base, costUsd: null });
    assert.deepEqual(unpriced.cost, {
      usd: null,
      source: "unknown",
      price_book: "test",
      basis: "provider did not report a price",
    });
    assert.deepEqual(Object.keys(globalThis.__imageEvent.cost), [
      "usd",
      "source",
      "price_book",
      "basis",
    ]);
    delete globalThis.__imageEvent;
  });
});
