import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../scripts/speak.mjs", import.meta.url));

// Runs the CLI with an isolated environment: no key, no user config file.
function run(payload, env = {}) {
  const dir = mkdtempSync(join(tmpdir(), "speak-"));
  const result = spawnSync(process.execPath, [CLI], {
    input: JSON.stringify({ out: join(dir, "out.mp3"), ...payload }),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      HOME: dir,
      STUDIO_CONFIG: join(dir, "missing.yml"),
      OPENROUTER_API_KEY: "",
      ...env,
    },
  });
  return { ...result, out: join(dir, "out.mp3") };
}

const errorOf = (result) => JSON.parse(result.stderr.trim().split("\n").pop()).error;

describe("speak CLI", () => {
  it("reports empty text as a JSON error on stderr and exits 1", () => {
    const result = run({ text: "   " }, { OPENROUTER_API_KEY: "key" });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(errorOf(result).code, "empty");
  });

  it("reports a missing key as a config error", () => {
    const result = run({ text: "Hello." });
    assert.equal(result.status, 1);
    assert.equal(errorOf(result).code, "config");
  });

  it("refuses pcm written to an .mp3 path before any request", () => {
    const result = run({ text: "Hello.", responseFormat: "pcm", out: "/tmp/x.mp3" }, { OPENROUTER_API_KEY: "key" });
    assert.equal(result.status, 1);
    assert.equal(errorOf(result).code, "usage");
  });

  it("requires an out path", () => {
    const result = run({ text: "Hello.", out: undefined }, { OPENROUTER_API_KEY: "key" });
    assert.equal(result.status, 1);
    assert.equal(errorOf(result).code, "usage");
  });

  it("refuses a voice that does not fit the model, before any request", () => {
    const result = run(
      { text: "Hello.", model: "elevenlabs/eleven-v3", voice: "Despina" },
      { OPENROUTER_API_KEY: "key" },
    );
    assert.equal(result.status, 1);
    assert.equal(errorOf(result).code, "voice");
    assert.equal(existsSync(result.out), false);
  });

  it("reports malformed JSON on stdin as an error, not a crash", () => {
    const result = spawnSync(process.execPath, [CLI], {
      input: "{not json",
      encoding: "utf8",
      env: { PATH: process.env.PATH, HOME: tmpdir(), STUDIO_CONFIG: "/nope", OPENROUTER_API_KEY: "key" },
    });
    assert.equal(result.status, 1);
    assert.ok(errorOf(result).message);
  });
});
