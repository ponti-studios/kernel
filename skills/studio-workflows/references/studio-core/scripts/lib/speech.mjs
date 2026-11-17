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

const isGemini = (model) => String(model).startsWith("google/");

/** Sample rate and channel count from Content-Type, e.g. audio/pcm;rate=24000;channels=1. */
export function pcmFormat(contentType = "") {
  const rate = Number(/rate=(\d+)/.exec(contentType)?.[1] ?? 24000);
  const channels = Number(/channels=(\d+)/.exec(contentType)?.[1] ?? 1);
  return { rate, channels };
}

/** Raw 16-bit little-endian PCM to mp3, through ffmpeg on PATH. */
export function pcmToMp3(pcm, { rate, channels }) {
  return new Uint8Array(
    execFileSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "s16le",
        "-ar",
        String(rate),
        "-ac",
        String(channels),
        "-i",
        "pipe:0",
        "-f",
        "mp3",
        "pipe:1",
      ],
      { input: pcm, maxBuffer: 256 * 1024 * 1024 },
    ),
  );
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
