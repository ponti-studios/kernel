// One utterance: validate, synthesize, write the file, and record the spend.
// The CLI (scripts/speak.mjs) is a thin stdin/stdout wrapper around this, so the
// whole path is testable with a fake network and a temporary ledger.
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { recordSpeech } from "./ledger-bridge.mjs";
import { OpenRouterSpeechModel, checkVoice, generationCost } from "./speech.mjs";

const TOOL = "studio-speech";

export function usage(message) {
  return Object.assign(new Error(message), { code: "usage" });
}

/**
 * payload: { text, out, voice?, model?, responseFormat? }
 * deps:    { apiKey, defaults: { model, voice }, fetchImpl?, record? }
 */
export async function speak(payload, { apiKey, defaults, fetchImpl = globalThis.fetch, record = recordSpeech }) {
  if (!payload.out) throw usage("out is required");
  if (payload.responseFormat === "pcm" && !/\.pcm$/i.test(payload.out)) {
    throw usage("responseFormat pcm writes raw PCM; give it a .pcm path");
  }
  const model = payload.model ?? defaults.model;
  const voice = payload.voice ?? defaults.voice;
  checkVoice(model, voice);
  const text = (payload.text ?? "").trim();
  const speechModel = new OpenRouterSpeechModel(apiKey, fetchImpl);
  const result = await speechModel.synthesize({
    model,
    voice,
    text,
    responseFormat: payload.responseFormat,
  });
  await writeFile(payload.out, result.audio);

  // The generation record can lag the response, so the cost may be unknown; the
  // ledger keeps that call as unpriced rather than inventing a price.
  const costUsd = await generationCost(result.providerRequestId, apiKey, fetchImpl);
  const recorded = await record({
    tool: TOOL,
    model,
    voice,
    text,
    generationId: result.providerRequestId,
    costUsd,
    outputPath: payload.out,
  });

  return {
    out: payload.out,
    format: result.format,
    voice,
    model,
    bytes: result.byteLength,
    characters: result.characters,
    ledger: recorded ? { eventId: recorded.eventId, costUsd: recorded.cost.usd } : null,
    sha256: createHash("sha256").update(result.audio).digest("hex"),
  };
}
