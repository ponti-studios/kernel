import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { repriceSpeech } from "../scripts/lib/reprice-speech.mjs";

const gap = (id, extra = {}) => ({
  id,
  tool: "studio-speech",
  stage: "speech",
  kind: "generation",
  provider: "openrouter",
  model: "google/gemini-3.8-flash-lite-tts",
  provider_request_id: `gen-${id}`,
  cost: { usd: null, source: "unknown" },
  ...extra,
});

function fakeLedger(events) {
  const appended = [];
  return {
    appended,
    readEvents: () => [...events, ...appended],
    appendEvent: (input) => {
      appended.push({ ...input, id: `rp-${input.ref}`, kind: "repricing" });
      return { event: appended.at(-1), duplicate: false };
    },
  };
}

describe("repriceSpeech", () => {
  it("prices unpriced speech calls from the generation record and points each at its original", async () => {
    const ledger = fakeLedger([gap("a"), gap("b")]);
    const lookup = async (id) => (id === "gen-a" ? 0.0007 : 0.0009);
    const result = await repriceSpeech({ apiKey: "k", ...ledger, lookup });
    assert.deepEqual(result, { checked: 2, priced: 2, stillUnpriced: [] });
    assert.deepEqual(
      ledger.appended.map((e) => [e.ref, e.cost.usd, e.cost.source]),
      [["a", 0.0007, "reported"], ["b", 0.0009, "reported"]],
    );
  });

  it("leaves a call unpriced, and says so, when its record never appears", async () => {
    const ledger = fakeLedger([gap("late")]);
    const result = await repriceSpeech({ apiKey: "k", ...ledger, lookup: async () => undefined });
    assert.deepEqual(result, { checked: 1, priced: 0, stillUnpriced: ["late"] });
    assert.equal(ledger.appended.length, 0);
  });

  it("running it again adds nothing for calls already repriced", async () => {
    const ledger = fakeLedger([gap("a")]);
    await repriceSpeech({ apiKey: "k", ...ledger, lookup: async () => 0.0007 });
    const second = await repriceSpeech({ apiKey: "k", ...ledger, lookup: async () => 0.0007 });
    assert.deepEqual(second, { checked: 0, priced: 0, stillUnpriced: [] });
    assert.equal(ledger.appended.length, 1);
  });

  it("skips calls that already have a cost, other tools, and non-speech events", async () => {
    const ledger = fakeLedger([
      gap("priced", { cost: { usd: 0.01, source: "reported" } }),
      gap("other", { tool: "studio-imagegen" }),
      gap("image", { stage: "render" }),
      gap("no-id", { provider_request_id: null }),
    ]);
    const result = await repriceSpeech({ apiKey: "k", ...ledger, lookup: async () => 1 });
    assert.deepEqual(result, { checked: 0, priced: 0, stillUnpriced: [] });
  });

  it("dry run reports what it would price and writes nothing", async () => {
    const ledger = fakeLedger([gap("a")]);
    const result = await repriceSpeech({ apiKey: "k", dryRun: true, ...ledger, lookup: async () => 0.0007 });
    assert.deepEqual(result, { checked: 1, priced: 1, stillUnpriced: [] });
    assert.equal(ledger.appended.length, 0);
  });

  it("refuses to run without a key", async () => {
    await assert.rejects(repriceSpeech({ apiKey: "" }), /needs an OpenRouter key/);
  });
});
