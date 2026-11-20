import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { recordRender, recordSpeech } from "../scripts/lib/ledger-bridge.mjs";

const saved = process.env.STUDIO_LEDGER_LIB;
const dirs = [];
afterEach(async () => {
  if (saved === undefined) delete process.env.STUDIO_LEDGER_LIB;
  else process.env.STUDIO_LEDGER_LIB = saved;
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const base = { tool: "studio-test", model: "m", promptSha256: "hash", params: {}, generationId: "g", outputPath: "/tmp/out.png" };

describe("shared ledger bridge", () => {
  it("reports a missing ledger and returns null instead of throwing", async () => {
    process.env.STUDIO_LEDGER_LIB = join(tmpdir(), "no-such-ledger-dir-for-test");
    const errors = [];
    const original = console.error;
    console.error = (line) => errors.push(String(line));
    try {
      const result = await recordRender({ ...base, costUsd: 0.01 });
      assert.equal(result, null);
    } finally {
      console.error = original;
    }
    assert.match(errors.join("\n"), /^ledger: /);
  });

  it("tags each event with the tool that rendered it and never estimates a missing price", async () => {
    const dir = await mkdtemp(join(tmpdir(), "bridge-ledger-"));
    dirs.push(dir);
    await writeFile(
      join(dir, "ledger.mjs"),
      `export function appendEvent(event) { globalThis.__event = event; return { event: { id: "e1" } }; }
       export function registerAsset() { return { asset: { sha256: "abc" } }; }`,
    );
    await writeFile(
      join(dir, "prices.mjs"),
      `export const PRICE_BOOK = "test"; export function estimateImage() { throw new Error("must not estimate"); }`,
    );
    process.env.STUDIO_LEDGER_LIB = dir;
    const unpriced = await recordRender({ ...base, tool: "studio-videogen", costUsd: null });
    assert.equal(globalThis.__event.tool, "studio-videogen");
    assert.deepEqual(unpriced.cost, { usd: null, source: "unknown", price_book: "test", basis: "provider did not report a price" });
  });

  it("gives a speech call with no generation id its own idempotency key", async () => {
    const dir = await mkdtemp(join(tmpdir(), "bridge-ledger-"));
    dirs.push(dir);
    await writeFile(
      join(dir, "ledger.mjs"),
      `export function appendEvent(event) { (globalThis.__events ??= []).push(event); return { event: { id: "e1" } }; }
       export function registerAsset() { return { asset: { sha256: "abc" } }; }`,
    );
    await writeFile(join(dir, "prices.mjs"), `export const PRICE_BOOK = "test";`);
    process.env.STUDIO_LEDGER_LIB = dir;
    globalThis.__events = [];
    const speech = { tool: "studio-speech", model: "m", voice: "v", text: "hi", costUsd: 0.01, outputPath: "/tmp/a.mp3" };
    await recordSpeech(speech);
    await recordSpeech(speech);
    const [first, second] = globalThis.__events;
    assert.ok(first.idem && second.idem && first.idem !== second.idem);
    assert.equal(first.provider_request_id, null);
    await recordSpeech({ ...speech, generationId: "gen-1" });
    assert.equal(globalThis.__events[2].idem, "gen-1");
  });
});
