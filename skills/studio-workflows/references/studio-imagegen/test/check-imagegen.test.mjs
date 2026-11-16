import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it } from "node:test";

const CHECK = fileURLToPath(new URL("../scripts/lib/check-imagegen.mjs", import.meta.url));
const SPECS = fileURLToPath(
  new URL("../../studio-universe/test/fixtures/specs/", import.meta.url),
);
const MODEL = "qwen/qwen-image-2.1-turbo";
const BOARDS = "aurora-night-sleeper--frame1-the-boarding.json";

const tempDirs = [];
afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

// The only transport preflight may touch is the capabilities lookup, so a fake
// fetch journals every request: the batch tests prove one lookup per batch and
// no image POST. A spend cannot happen silently.
const STUB = `
import { appendFileSync } from "node:fs";
globalThis.fetch = async (url) => {
  appendFileSync(process.env.STUB_REQUESTS, String(url) + "\\n");
  return new Response(
    JSON.stringify({
      data: [
        {
          id: process.env.STUB_MODEL,
          supported_parameters: {
            aspect_ratio: { values: ["4:5"] },
            resolution: { values: ["1K", "2K"] },
          },
        },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
`;

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), "check-imagegen-cli-"));
  tempDirs.push(dir);
  const stub = join(dir, "fetch-stub.mjs");
  await writeFile(stub, STUB);
  return {
    dir,
    stub,
    journal: join(dir, "requests.txt"),
    list: join(dir, "specs.txt"),
  };
}

function run(f, args) {
  return spawnSync(process.execPath, ["--import", f.stub, CHECK, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENROUTER_API_KEY: "test-key",
      STUDIO_CONFIG: join(f.dir, "absent.yml"),
      STUB_REQUESTS: f.journal,
      STUB_MODEL: MODEL,
    },
  });
}

async function requests(f) {
  try {
    return (await readFile(f.journal, "utf8")).trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

describe("check-imagegen batch CLI", () => {
  it("fails a spec whose model lacks its aspect, naming the spec and spending nothing", async () => {
    const f = await fixture();
    const source = JSON.parse(await readFile(join(SPECS, BOARDS), "utf8"));
    const wide = join(f.dir, "wide.json");
    await writeFile(
      wide,
      JSON.stringify({ ...source, master: { ...source.master, aspect_ratio: "21:9" } }),
    );
    await writeFile(f.list, `${join(SPECS, BOARDS)}\n${wide}\n`);

    const result = run(f, ["--specs", f.list, "--model", MODEL, "--resolution", "2K"]);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /wide\.json: aspect supported\s+21:9 not in 4:5/);
    assert.deepEqual(await requests(f), ["https://openrouter.ai/api/v1/images/models"]);
  });

  it("fetches model capabilities once for a five-spec batch and posts no image", async () => {
    const f = await fixture();
    const specs = [
      BOARDS,
      "aurora-night-sleeper--frame2-the-empty-case.json",
      "aurora-night-sleeper--frame3-the-trap.json",
      "oxford-last-bus--frame1-the-last-bus.json",
      "scooby-halloween--frame3-the-trap.json",
    ].map((name) => join(SPECS, name));
    await writeFile(f.list, `${specs.join("\n")}\n`);

    const result = run(f, ["--specs", f.list, "--model", MODEL, "--resolution", "2K"]);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /5 specs ready/);
    assert.deepEqual(await requests(f), ["https://openrouter.ai/api/v1/images/models"]);
  });
});
