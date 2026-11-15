import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it } from "node:test";

import { solidPng } from "./support.mjs";

const GENERATE = fileURLToPath(new URL("../scripts/lib/generate-image.mjs", import.meta.url));

const tempDirs = [];
afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

// Delayed fake transport, plus a ledger stub that journals what the bridge sent so
// the event shape and the cost source can be asserted without touching ~/.studio.
const STUB = `
import { appendFileSync } from "node:fs";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
globalThis.fetch = async (url, init) => {
  await sleep(10);
  const body = JSON.parse(String(init.body));
  return new Response(
    JSON.stringify({
      data: [{ b64_json: Buffer.from([1, 2, 3, 4]).toString("base64"), media_type: "image/png" }],
      usage: { cost: 0.0184, prompt_tokens: 5, completion_tokens: 6, total_tokens: 11 },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Generation-Id": "gen-" + body.aspect_ratio },
    },
  );
};
globalThis.__ledgerJournal = (row) => appendFileSync(process.env.STUB_LEDGER_LOG, JSON.stringify(row) + "\\n");
`;

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), "generate-image-cli-"));
  tempDirs.push(dir);
  const ledger = join(dir, "ledger");
  await mkdir(ledger, { recursive: true });
  await writeFile(
    join(ledger, "ledger.mjs"),
    `export function appendEvent(event) {\nglobalThis.__ledgerJournal({ kind: "event", event });\nreturn { event: { id: "evt-1", ...event } };\n}\nexport function registerAsset(asset) {\nglobalThis.__ledgerJournal({ kind: "asset", asset });\nreturn { asset: { ...asset, sha256: "sha" } };\n}\n`,
  );
  await writeFile(join(ledger, "prices.mjs"), "export const PRICE_BOOK = {};\n");
  const stub = join(dir, "stub.mjs");
  await writeFile(stub, STUB);
  return {
    dir,
    ledger,
    stub,
    inbox: join(dir, "inbox"),
    usage: join(dir, "usage"),
    journal: join(dir, "ledger.jsonl"),
  };
}

function run(f, args, env = {}) {
  return spawnSync(process.execPath, ["--import", f.stub, GENERATE, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENROUTER_API_KEY: "test-key",
      STUDIO_CONFIG: join(f.dir, "absent.yml"),
      STUDIO_INBOX: f.inbox,
      STUDIO_USAGE_DIR: f.usage,
      STUDIO_LEDGER_LIB: f.ledger,
      STUDIO_STAGE_DIR: join(f.dir, "refs"),
      STUB_LEDGER_LOG: f.journal,
      ...env,
    },
  });
}

describe("generate-image single-shot CLI", () => {
  it("writes the image, sidecar, usage log and ledger event unchanged", async () => {
    const f = await fixture();
    const out = join(f.inbox, "frame.png");
    const result = run(f, ["--prompt", "a quiet beach", "--out", out, "--meta"]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal((await stat(out)).size, 4);

    const sidecar = JSON.parse(await readFile(join(f.inbox, "frame.json"), "utf8"));
    assert.equal(sidecar.model, "qwen/qwen-image-2.1-turbo");
    assert.equal(sidecar.format_returned, "png");
    assert.equal(sidecar.generation_id, "gen-4:5");
    assert.equal(sidecar.attempts, 1);
    assert.equal(sidecar.cost_usd, 0.0184);
    assert.equal(sidecar.cost_source, "reported");
    assert.equal(sidecar.image_tokens, null);
    assert.deepEqual(sidecar.tokens, { prompt: 5, completion: 6, total: 11 });

    const [usageName] = await readdir(f.usage);
    const usage = JSON.parse(await readFile(join(f.usage, usageName), "utf8"));
    assert.equal(usage.kind, "imagegen");

    const journal = (await readFile(f.journal, "utf8"))
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    const event = journal.find((row) => row.kind === "event").event;
    assert.equal(event.tool, "studio-imagegen");
    assert.equal(event.stage, "render");
    assert.equal(event.units.count, 1);
    assert.equal(event.cost.usd, 0.0184);
    assert.equal(event.cost.source, "reported");
  });

  it("keeps inbox naming when --out is omitted", async () => {
    const f = await fixture();
    const result = run(f, ["--prompt", "a quiet beach", "--format", "webp"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /out:\s+.*\/\d{8}-\d{6}_qwen-image-2\.1-turbo_prompt\.webp/,
    );
  });

  it("stages --ref plates with --stage-refs and leaves them full-size with --no-stage-refs", async () => {
    const f = await fixture();
    const plate = join(f.dir, "plate.png");
    await writeFile(plate, solidPng(2048, 1400));
    const staged = run(f, ["--prompt", "a plate", "--ref", plate, "--stage-refs", "--dry-run"]);
    assert.equal(staged.status, 0, staged.stderr);
    assert.match(staged.stdout, /references:\s+1/);
    // A machine without sharp or ImageMagick reports the passthrough instead of
    // pretending the plate was downscaled.
    const resized = staged.stdout.match(/staged: (\d+) → (\d+) bytes.*plate\.png/);
    if (resized) {
      assert.ok(Number(resized[2]) < Number(resized[1]), "the staged plate is smaller");
    } else {
      assert.match(staged.stdout, /staged: passthrough — .*plate\.png/);
    }

    const full = run(f, ["--prompt", "a plate", "--ref", plate, "--no-stage-refs", "--dry-run"]);
    assert.equal(full.status, 0, full.stderr);
    assert.match(full.stdout, /references:\s+1/);
    assert.doesNotMatch(full.stdout, /staged:/);
  });

  it("stages the spec's own reference plates too", async () => {
    const f = await fixture();
    const spec = fileURLToPath(
      new URL(
        "../../studio-universe/test/fixtures/specs/aurora-night-sleeper--frame3-the-trap.json",
        import.meta.url,
      ),
    );
    const result = run(f, ["--spec", spec, "--stage-refs", "--dry-run"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /source:\s+spec 3 — THE TRAP/);
    assert.match(result.stdout, /references:\s+3/);
    assert.equal((result.stdout.match(/^staged: /gm) ?? []).length, 3);
  });
});
