// Fill in the real cost of speech calls that were recorded before their generation
// record existed. Each recovered cost is a repricing event that points at the original
// call (never an edit), and the dedupe key is the original id, so running this twice
// adds nothing the second time.
import { generationCost } from "./speech.mjs";
import { appendEvent as defaultAppend, readEvents as defaultRead } from "./ledger.mjs";
import { PRICE_BOOK } from "./prices.mjs";

const SPEECH_TOOL = "studio-speech";

export async function repriceSpeech({
  apiKey,
  dryRun = false,
  fetchImpl = globalThis.fetch,
  readEvents = defaultRead,
  appendEvent = defaultAppend,
  lookup = generationCost,
} = {}) {
  if (!apiKey) throw new Error("reprice-speech needs an OpenRouter key");
  const events = readEvents();
  const repriced = new Set(events.filter((e) => e.kind === "repricing").map((e) => e.ref));
  const gaps = events.filter(
    (e) =>
      e.tool === SPEECH_TOOL &&
      e.stage === "speech" &&
      e.kind !== "repricing" &&
      e.cost?.usd == null &&
      e.provider_request_id &&
      !repriced.has(e.id),
  );

  const result = { checked: gaps.length, priced: 0, stillUnpriced: [] };
  for (const gap of gaps) {
    const usd = await lookup(gap.provider_request_id, apiKey, fetchImpl, { attempts: 3, delayMs: 2000 });
    if (typeof usd !== "number") {
      result.stillUnpriced.push(gap.id);
      continue;
    }
    if (!dryRun) {
      appendEvent({
        kind: "repricing",
        ref: gap.id,
        tool: SPEECH_TOOL,
        stage: "speech",
        provider: gap.provider,
        model: gap.model,
        provider_request_id: gap.provider_request_id,
        cost: { usd, source: "reported", price_book: PRICE_BOOK, basis: "provider generation record (repriced)" },
        tags: ["repricing"],
      });
    }
    result.priced += 1;
  }
  return result;
}
