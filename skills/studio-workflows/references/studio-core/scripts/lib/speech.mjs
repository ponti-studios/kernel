// OpenRouter text-to-speech via POST /api/v1/audio/speech (OpenAI Audio Speech
// compatible). Raw fetch: the response is audio bytes, not JSON.
//
// Ported from studio packages/providers/src/openrouter-speech.ts.
//
// Gemini TTS only returns raw PCM (mp3 is a 400). For google/* models the request
// asks for pcm and the bytes are converted to mp3 here, so every caller still gets
// mp3. Pass responseFormat: "pcm" to keep the raw bytes.
import { execFileSync } from "node:child_process";

const BASE_URL = "https://openrouter.ai/api/v1";

// The voices Gemini TTS accepts, from the OpenRouter models API (supported_voices).
export const GEMINI_VOICES = Object.freeze([
  "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede", "Callirrhoe",
  "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina", "Erinome",
  "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar", "Gacrux",
  "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager",
  "Sulafat",
]);

const isGemini = (model) => String(model).startsWith("google/");

/** Sample rate and channel count from Content-Type, e.g. audio/pcm;rate=24000;channels=1. */
export function pcmFormat(contentType = "") {
  const rate = Number(/rate=(\d+)/.exec(contentType)?.[1] ?? 24000);
  const channels = Number(/channels=(\d+)/.exec(contentType)?.[1] ?? 1);
  return { rate, channels };
}

/**
 * Raw 16-bit little-endian PCM to mp3, through ffmpeg on PATH. Synchronous on
 * purpose: it runs once per utterance in a CLI, not in a hot loop.
 */
export function pcmToMp3(pcm, { rate, channels }) {
  try {
    return new Uint8Array(
      execFileSync(
        "ffmpeg",
        ["-hide_banner", "-loglevel", "error", "-f", "s16le", "-ar", String(rate), "-ac", String(channels), "-i", "pipe:0", "-f", "mp3", "pipe:1"],
        { input: pcm, maxBuffer: 256 * 1024 * 1024 },
      ),
    );
  } catch (cause) {
    if (cause?.code === "ENOENT") {
      throw new OpenRouterSpeechError(
        "ffmpeg",
        "ffmpeg is not on PATH; Gemini speech needs it to convert to mp3 (or pass responseFormat: \"pcm\")",
      );
    }
    throw new OpenRouterSpeechError("ffmpeg", `ffmpeg failed: ${cause?.message ?? cause}`);
  }
}

/** A voice name must fit the model: Gemini names for google/*, anything else for the rest. */
export function checkVoice(model, voice) {
  if (isGemini(model)) {
    if (!GEMINI_VOICES.includes(voice)) {
      throw new OpenRouterSpeechError(
        "voice",
        `"${voice}" is not a Gemini voice for ${model}; use one of: ${GEMINI_VOICES.join(", ")}`,
      );
    }
  } else if (GEMINI_VOICES.includes(voice)) {
    throw new OpenRouterSpeechError(
      "voice",
      `"${voice}" is a Gemini voice but the model is ${model}; set the speech model and DEFAULT_VOICE_ID together`,
    );
  }
}

export class OpenRouterSpeechError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "OpenRouterSpeechError";
    this.code = code;
  }
}

export class OpenRouterSpeechModel {
  #apiKey;
  #fetchImpl;

  constructor(apiKey, fetchImpl = globalThis.fetch) {
    this.#apiKey = apiKey;
    this.#fetchImpl = fetchImpl;
  }

  async synthesize(input) {
    const text = input.text.trim();
    if (!text) throw new OpenRouterSpeechError("empty", "nothing to synthesize");

    const requested = input.responseFormat ?? (isGemini(input.model) ? "pcm" : "mp3");
    let response;
    try {
      response = await this.#fetchImpl(`${BASE_URL}/audio/speech`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: input.model,
          input: text,
          voice: input.voice,
          response_format: requested,
        }),
      });
    } catch (cause) {
      throw new OpenRouterSpeechError(
        "network",
        cause instanceof Error ? cause.message : "speech request failed",
      );
    }
    if (response.status === 402) {
      throw new OpenRouterSpeechError("credits", "openrouter credits insufficient");
    }
    if (!response.ok) {
      throw new OpenRouterSpeechError("http", `speech ${response.status}`);
    }
    const providerRequestId =
      response.headers.get("X-Generation-Id") ??
      response.headers.get("x-generation-id") ??
      undefined;
    let audio = new Uint8Array(await response.arrayBuffer());
    if (audio.length === 0) {
      throw new OpenRouterSpeechError("empty", "speech returned no audio");
    }
    let format = requested;
    if (requested === "pcm" && !input.responseFormat) {
      // 16-bit samples are two bytes each, so an odd length is not the format we asked for.
      if (audio.length % 2 !== 0) {
        throw new OpenRouterSpeechError(
          "format",
          `pcm length ${audio.length} is not a whole number of 16-bit samples`,
        );
      }
      audio = pcmToMp3(audio, pcmFormat(response.headers.get("content-type") ?? ""));
      format = "mp3";
    }
    return {
      audio,
      format,
      voice: input.voice,
      byteLength: audio.length,
      // Speech is priced per character, not per token.
      characters: text.length,
      ...(providerRequestId ? { providerRequestId } : {}),
    };
  }
}

/**
 * Real cost of one speech generation, from OpenRouter's generation record. Never
 * throws: a record that is not ready yet returns undefined, and the ledger keeps the
 * call as unpriced instead of estimating it.
 */
export async function generationCost(generationId, apiKey, fetchImpl = globalThis.fetch) {
  if (!generationId) return undefined;
  try {
    const response = await fetchImpl(`${BASE_URL}/generation?id=${encodeURIComponent(generationId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return undefined;
    const body = await response.json();
    const total = body?.data?.total_cost;
    return typeof total === "number" ? total : undefined;
  } catch {
    return undefined;
  }
}
