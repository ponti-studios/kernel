import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { preflightBatch, readSpecList } from "../scripts/lib/batch-preflight.mjs";

const tempDirs = [];
afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("image batch preflight", () => {
  it("names an uncompilable spec and still checks the batch without generation", async () => {
    let generationCalls = 0;
    const results = await preflightBatch({
      specs: ["good.json", "broken.json"],
      root: "/universe",
      readSpec: async (path) => ({ path, master: { aspect_ratio: "4:5" }, references: [] }),
      compileSpec: (spec) => {
        if (spec.path === "broken.json") throw new Error("invalid canon");
      },
      loadRegistry: () => ({}),
      fetchCapabilities: async () => ({
        aspect_ratio: { values: ["4:5"] },
        resolution: { values: ["2K"] },
      }),
    });
    assert.equal(results[0].ok, true);
    assert.equal(results[1].ok, false);
    assert.equal(results[1].spec, "broken.json");
    assert.equal(generationCalls, 0);
    assert.match(
      results[1].checks.find((row) => row.label === "spec compiles").detail,
      /invalid canon/,
    );
  });

  it("fetches capabilities once for five specs", async () => {
    let capabilityCalls = 0;
    const results = await preflightBatch({
      specs: ["1", "2", "3", "4", "5"],
      root: "/universe",
      readSpec: async () => ({ master: { aspect_ratio: "4:5" }, references: [] }),
      compileSpec: () => "prompt",
      loadRegistry: () => ({}),
      fetchCapabilities: async () => {
        capabilityCalls += 1;
        return { aspect_ratio: { values: ["4:5"] }, resolution: { values: ["2K"] } };
      },
    });
    assert.equal(results.length, 5);
    assert.equal(capabilityCalls, 1);
  });

  it("reads JSON arrays and newline-delimited spec lists", async () => {
    const dir = await mkdtemp(join(tmpdir(), "spec-list-"));
    tempDirs.push(dir);
    const path = join(dir, "specs.txt");
    await writeFile(path, "a.json\n\nb.json\n");
    assert.deepEqual(readSpecList(path), ["a.json", "b.json"]);
    await writeFile(path, '["a.json", "b.json"]');
    assert.deepEqual(readSpecList(path), ["a.json", "b.json"]);
  });
});
