import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it } from "node:test";

const KEYFRAMES = fileURLToPath(new URL("../scripts/lib/keyframes.mjs", import.meta.url));

const tempDirs = [];
afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

// Stubbed at process start: the CLI builds its provider with globalThis.fetch, so
// one delayed fake serves the whole batch without a network call or any spend.
const STUB = `
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(String(init.body));
  await sleep(500);
  const headers = { "Content-Type": "application/json" };
  if (String(body.prompt).includes("FAIL")) {
    return new Response(JSON.stringify({ error: "rejected" }), { status: 400, headers });
  }
  headers["X-Generation-Id"] = "gen-" + String(body.prompt).slice(0, 6);
  return new Response(
    JSON.stringify({
      data: [{ b64_json: Buffer.from([7, 7, 7]).toString("base64"), media_type: "image/png" }],
      usage: { cost: 0.01, prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
    }),
    { status: 200, headers },
  );
};
`;

async function fixture(scenes) {
  const dir = await mkdtemp(join(tmpdir(), "keyframes-cli-"));
  tempDirs.push(dir);
  const ledger = join(dir, "ledger");
  await mkdir(ledger, { recursive: true });
  await writeFile(
    join(ledger, "ledger.mjs"),
    `export function appendEvent(event) { return { event: { id: "evt-1", ...event } }; }\nexport function registerAsset(asset) { return { asset: { ...asset, sha256: "sha" } }; }\n`,
  );
  await writeFile(join(ledger, "prices.mjs"), "export const PRICE_BOOK = {};\n");
  const stub = join(dir, "fetch-stub.mjs");
  await writeFile(stub, STUB);
  const scenesPath = join(dir, "scenes.json");
  await writeFile(scenesPath, JSON.stringify(scenes));
  return { dir, ledger, stub, scenesPath, out: join(dir, "out"), usage: join(dir, "usage") };
}

function run(f, args) {
  return spawnSync(process.execPath, ["--import", f.stub, KEYFRAMES, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENROUTER_API_KEY: "test-key",
      STUDIO_CONFIG: join(f.dir, "absent.yml"),
      STUDIO_USAGE_DIR: f.usage,
      STUDIO_LEDGER_LIB: f.ledger,
      STUDIO_STAGE_DIR: join(f.dir, "refs"),
      STUDIO_LEGS: "on",
    },
  });
}

const scene = (id, prompt = `a still of ${id}`) => ({ id, prompt, duration_seconds: 2 });

describe("keyframes batch CLI", () => {
  it("keeps the successes, lists the failure and exits 0 when only one job fails", async () => {
    const f = await fixture([scene("one"), scene("two"), scene("three"), scene("FAIL")]);
    const result = run(f, ["--scenes", f.scenesPath, "--out", f.out, "--yes"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /generated: 3\/4/);
    assert.match(result.stdout, /failed:\s+1/);
    assert.match(result.stdout, /FAIL: .*\(http\)/);
    const { readdir, readFile } = await import("node:fs/promises");
    const [name] = await readdir(f.usage);
    const log = JSON.parse(await readFile(join(f.usage, name), "utf8"));
    assert.equal(log.kind, "imagegen-keyframes");
    assert.equal(log.scenes.length, 3);
    assert.equal(log.failed.length, 1);
    assert.equal(log.cost_usd_reported, 0.03);
    for (const call of log.scenes) assert.equal(call.attempts, 1);
  });

  it("exits 1 when every job fails", async () => {
    const f = await fixture([scene("FAIL"), scene("FAIL2")]);
    const result = run(f, ["--scenes", f.scenesPath, "--out", f.out, "--yes"]);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /generated: 0\/2/);
  });

  it("completes four delayed jobs at the default concurrency inside 1.6s", async () => {
    const f = await fixture([scene("a"), scene("b"), scene("c"), scene("d")]);
    const started = Date.now();
    const result = run(f, ["--scenes", f.scenesPath, "--out", f.out, "--yes"]);
    const elapsed = Date.now() - started;
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /generated: 4\/4/);
    assert.ok(elapsed < 1600, `four 500ms jobs took ${elapsed}ms`);
  });

  it("renders in submission order at concurrency 1", async () => {
    const f = await fixture([scene("a"), scene("b"), scene("c")]);
    const result = run(f, [
      "--scenes",
      f.scenesPath,
      "--out",
      f.out,
      "--yes",
      "--concurrency",
      "1",
    ]);
    assert.equal(result.status, 0, result.stderr);
    const order = ["a:", "b:", "c:"].map((id) => result.stdout.indexOf(`  ${id}`));
    assert.ok(order.every((at) => at >= 0), result.stdout);
    assert.deepEqual([...order].sort((x, y) => x - y), order);
  });
});
