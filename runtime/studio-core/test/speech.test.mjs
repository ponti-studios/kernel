import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  GEMINI_VOICES,
  OpenRouterSpeechError,
  OpenRouterSpeechModel,
  checkVoice,
  pcmToMp3,
} from "../scripts/lib/speech.mjs";

function audioResponse(bytes, status = 200) {
  return new Response(new Uint8Array(bytes), { status });
}

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("OpenRouterSpeechModel", () => {
  it("returns audio bytes on success", async () => {
    globalThis.fetch = async () => audioResponse([1, 2, 3]);
    const result = await new OpenRouterSpeechModel("key").synthesize({
      model: "elevenlabs/eleven-multilingual-v2",
      voice: "v1",
      text: "Hello.",
    });
    assert.equal(result.byteLength, 3);
    assert.equal(result.audio.length, 3);
    assert.equal(result.voice, "v1");
  });

  it("sends the OpenAI-compatible speech body with mp3 by default", async () => {
    let seen;
    globalThis.fetch = async (url, init) => {
      seen = { url, init };
      return audioResponse([1]);
    };
    await new OpenRouterSpeechModel("key").synthesize({ model: "m", voice: "v", text: " hi " });
    assert.equal(seen.url, "https://openrouter.ai/api/v1/audio/speech");
    assert.equal(seen.init.headers.Authorization, "Bearer key");
    assert.deepEqual(JSON.parse(seen.init.body), {
      model: "m",
      input: "hi",
      voice: "v",
      response_format: "mp3",
    });
  });

  it("passes a pcm response format through", async () => {
    let body;
    globalThis.fetch = async (_url, init) => {
      body = JSON.parse(init.body);
      return audioResponse([1]);
    };
    await new OpenRouterSpeechModel("key").synthesize({
      model: "m",
      voice: "v",
      text: "hi",
      responseFormat: "pcm",
    });
    assert.equal(body.response_format, "pcm");
  });

  it("rejects empty text before any request", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return audioResponse([1]);
    };
    await assert.rejects(
      new OpenRouterSpeechModel("key").synthesize({ model: "m", voice: "v1", text: "  " }),
      (error) => {
        assert.ok(error instanceof OpenRouterSpeechError);
        assert.equal(error.code, "empty");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("maps 402 to credits", async () => {
    globalThis.fetch = async () => audioResponse([], 402);
    await assert.rejects(
      new OpenRouterSpeechModel("key").synthesize({ model: "m", voice: "v1", text: "Hi." }),
      { code: "credits" },
    );
  });

  it("maps other failures to http and rejects empty audio", async () => {
    globalThis.fetch = async () => audioResponse([], 500);
    await assert.rejects(
      new OpenRouterSpeechModel("key").synthesize({ model: "m", voice: "v", text: "Hi." }),
      { code: "http" },
    );
    globalThis.fetch = async () => audioResponse([]);
    await assert.rejects(
      new OpenRouterSpeechModel("key").synthesize({ model: "m", voice: "v", text: "Hi." }),
      { code: "empty" },
    );
  });

  it("reports billed characters and the generation id", async () => {
    globalThis.fetch = async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "X-Generation-Id": "gen-speech-1" },
      });
    const result = await new OpenRouterSpeechModel("key").synthesize({
      model: "m",
      voice: "v",
      text: "  hello there  ",
    });
    assert.equal(result.characters, "hello there".length);
    assert.equal(result.providerRequestId, "gen-speech-1");
  });
});

describe("Gemini default", () => {
  it("requests pcm for a google model and returns mp3 to the caller", async () => {
    let body;
    globalThis.fetch = async (_url, init) => {
      body = JSON.parse(init.body);
      return new Response(new Uint8Array(4800), {
        status: 200,
        headers: { "content-type": "audio/pcm;rate=24000;channels=1" },
      });
    };
    const result = await new OpenRouterSpeechModel("key").synthesize({
      model: "google/gemini-3.8-flash-lite-tts",
      voice: "Despina",
      text: "Hello.",
    });
    assert.equal(body.response_format, "pcm");
    assert.equal(result.format, "mp3");
    const isMp3 =
      (result.audio[0] === 0x49 && result.audio[1] === 0x44 && result.audio[2] === 0x33) ||
      (result.audio[0] === 0xff && (result.audio[1] & 0xe0) === 0xe0);
    assert.ok(isMp3, "expected mp3 bytes back");
  });

  it("keeps raw pcm when the caller asks for it explicitly", async () => {
    globalThis.fetch = async () =>
      new Response(new Uint8Array(4800), {
        status: 200,
        headers: { "content-type": "audio/pcm;rate=24000;channels=1" },
      });
    const result = await new OpenRouterSpeechModel("key").synthesize({
      model: "google/gemini-3.8-flash-lite-tts",
      voice: "Despina",
      text: "Hello.",
      responseFormat: "pcm",
    });
    assert.equal(result.format, "pcm");
    assert.equal(result.byteLength, 4800);
  });
});

describe("speech hardening", () => {
  const gemini = "google/gemini-3.8-flash-lite-tts";
  const pcmResponse = (bytes, type = "audio/pcm;rate=24000;channels=1") =>
    new Response(new Uint8Array(bytes), { status: 200, headers: { "content-type": type } });

  it("refuses a voice that does not fit the model", () => {
    assert.throws(() => checkVoice("elevenlabs/eleven-v3", "Despina"), (error) => error.code === "voice");
    assert.throws(() => checkVoice(gemini, "pNInz6obpgDQGcFmaJgB"), (error) => error.code === "voice");
    assert.doesNotThrow(() => checkVoice(gemini, "Despina"));
  });

  it("accepts every listed Gemini voice", () => {
    for (const voice of GEMINI_VOICES) assert.doesNotThrow(() => checkVoice(gemini, voice));
    assert.equal(GEMINI_VOICES.length, 30);
  });

  it("fails loudly on a pcm body that is not whole 16-bit samples", async () => {
    globalThis.fetch = async () => pcmResponse(4801);
    await assert.rejects(
      new OpenRouterSpeechModel("key").synthesize({ model: gemini, voice: "Despina", text: "Hi." }),
      (error) => error.code === "format",
    );
  });

  it("reports a missing ffmpeg as its own error, not a raw ENOENT", () => {
    const saved = process.env.PATH;
    process.env.PATH = "";
    try {
      assert.throws(
        () => pcmToMp3(new Uint8Array(4), { rate: 24000, channels: 1 }),
        (error) => error.code === "ffmpeg" && /ffmpeg is not on PATH/.test(error.message),
      );
    } finally {
      process.env.PATH = saved;
    }
  });
});
