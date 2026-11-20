import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import { speak } from "../scripts/lib/speak.mjs";

const MP3 = new Uint8Array([0xff, 0xfb, 0x90, 0x00, 1, 2, 3, 4]);
const ELEVEN = "elevenlabs/eleven-v3";
const VOICE = "pNInz6obpgDQGcFmaJgB";
const defaults = { model: ELEVEN, voice: VOICE };

// A fake OpenRouter: speech returns mp3 with a generation id; the generation record
// returns the given cost (or 404 when cost is null, like a record that is not ready).
function fakeNetwork({ cost = 0.0004, generationId = "gen-abc" } = {}) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (String(url).includes("/audio/speech")) {
      return new Response(MP3, { status: 200, headers: { "x-generation-id": generationId } });
    }
    if (String(url).includes("/generation")) {
      if (cost === null) return new Response("{}", { status: 404 });
      return new Response(JSON.stringify({ data: { total_cost: cost } }), { status: 200 });
    }
    throw new Error(`unexpected url ${url}`);
  };
  return { fetchImpl, calls };
}

const saved = { root: process.env.STUDIO_LEDGER_ROOT, lib: process.env.STUDIO_LEDGER_LIB };
let dir;
let ledger;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "speak-ledger-"));
  process.env.STUDIO_LEDGER_ROOT = join(dir, "ledger");
  delete process.env.STUDIO_LEDGER_LIB;
  ledger = await import(`../scripts/lib/ledger.mjs?t=${Date.now()}`);
});

afterEach(async () => {
  for (const [key, value] of [["STUDIO_LEDGER_ROOT", saved.root], ["STUDIO_LEDGER_LIB", saved.lib]]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  await rm(dir, { recursive: true, force: true });
});

describe("speak() records each generation in the ledger", () => {
  it("writes the file and records characters, the real cost and the audio asset", async () => {
    const { fetchImpl } = fakeNetwork({ cost: 0.0004 });
    const out = join(dir, "line.mp3");
    const result = await speak(
      { text: "  Hello there.  ", out },
      { apiKey: "key", defaults, fetchImpl },
    );
    assert.deepEqual(await readFile(out), Buffer.from(MP3));
    assert.equal(result.ledger.costUsd, 0.0004);

    const events = ledger.readEvents().filter((e) => e.tool === "studio-speech");
    assert.equal(events.length, 1);
    const [event] = events;
    assert.equal(event.stage, "speech");
    assert.equal(event.provider, "openrouter");
    assert.equal(event.model, ELEVEN);
    assert.deepEqual(event.units, { count: "Hello there.".length, unit: "character" });
    assert.equal(event.provider_request_id, "gen-abc");
    assert.equal(event.cost.usd, 0.0004);
    assert.equal(event.cost.source, "reported");

    const asset = ledger.readAssets().find((a) => a.sha256 === result.sha256);
    assert.ok(asset, "the audio file is registered as an asset");
    assert.equal(asset.kind, "audio");
  });

  it("keeps a call unpriced when the generation record is not ready, instead of estimating", async () => {
    const { fetchImpl } = fakeNetwork({ cost: null, generationId: "gen-pending" });
    const result = await speak({ text: "Pending cost.", out: join(dir, "p.mp3") }, { apiKey: "key", defaults, fetchImpl });
    assert.equal(result.ledger.costUsd, null);
    const event = ledger.readEvents().find((e) => e.provider_request_id === "gen-pending");
    assert.equal(event.cost.usd, null);
    assert.equal(event.cost.source, "unknown");
  });

  it("counts two identical lines as two spends", async () => {
    const out = join(dir, "same.mp3");
    await speak({ text: "Again.", out }, { apiKey: "key", defaults, fetchImpl: fakeNetwork({ generationId: "gen-1" }).fetchImpl });
    await speak({ text: "Again.", out }, { apiKey: "key", defaults, fetchImpl: fakeNetwork({ generationId: "gen-2" }).fetchImpl });
    const ids = ledger.readEvents().filter((e) => e.tool === "studio-speech").map((e) => e.provider_request_id).sort();
    assert.deepEqual(ids, ["gen-1", "gen-2"]);
  });

  it("does not let a broken ledger stop the audio being written", async () => {
    const broken = join(dir, "no-ledger-here");
    await writeFile(join(dir, "placeholder"), "");
    process.env.STUDIO_LEDGER_LIB = broken;
    const out = join(dir, "still.mp3");
    const original = console.error;
    const messages = [];
    console.error = (line) => messages.push(String(line));
    try {
      const result = await speak({ text: "Still saved.", out }, { apiKey: "key", defaults, fetchImpl: fakeNetwork().fetchImpl });
      assert.equal(result.ledger, null);
    } finally {
      console.error = original;
    }
    assert.deepEqual(await readFile(out), Buffer.from(MP3));
    assert.match(messages.join("\n"), /^ledger: /);
  });

  it("refuses a voice that does not fit the model before any spend", async () => {
    const network = fakeNetwork();
    await assert.rejects(
      speak({ text: "Hi.", out: join(dir, "x.mp3"), voice: "Despina" }, { apiKey: "key", defaults, fetchImpl: network.fetchImpl }),
      (error) => error.code === "voice",
    );
    assert.equal(network.calls.length, 0);
  });

  it("sends instructions to the provider so a voice can be steered toward an accent", async () => {
    let body;
    const fetchImpl = async (url, init) => {
      if (String(url).includes("/audio/speech")) {
        body = JSON.parse(init.body);
        return new Response(MP3, { status: 200, headers: { "x-generation-id": "gen-instr" } });
      }
      return new Response("{}", { status: 404 });
    };
    await speak(
      { text: "Accent check.", out: join(dir, "accent.mp3"), instructions: "British English accent." },
      {
        apiKey: "key",
        defaults: { model: "google/gemini-3.8-flash-lite-tts", voice: "Despina" },
        fetchImpl,
        toMp3: () => MP3,
      },
    );
    assert.equal(body.instructions, "British English accent.");
  });
});
