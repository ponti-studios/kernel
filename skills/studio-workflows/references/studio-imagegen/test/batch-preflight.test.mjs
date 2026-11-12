import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
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

  it("fails a spec whose aspect the model does not support, naming the spec", async () => {
    const dir = await mkdtemp(join(tmpdir(), "spec-aspect-"));
    tempDirs.push(dir);
    const root = join(dir, "universe");
    await mkdir(root, { recursive: true });
    const results = await preflightBatch({
      specs: ["wide.json"],
      resolution: "4K",
      root,
      readSpec: async () => ({ master: { aspect_ratio: "21:9" }, references: [] }),
      compileSpec: () => "prompt",
      loadRegistry: () => ({}),
      fetchCapabilities: async () => ({
        aspect_ratio: { values: ["4:5", "1:1"] },
        resolution: { values: ["1K", "2K"] },
      }),
    });
    assert.equal(results[0].ok, false);
    assert.equal(results[0].spec, "wide.json");
    const failed = results[0].checks.filter((check) => !check.ok).map((check) => check.label);
    assert.deepEqual(failed, ["aspect supported", "resolution supported"]);
    assert.match(
      results[0].checks.find((check) => check.label === "aspect supported").detail,
      /21:9 not in 4:5, 1:1/,
    );
  });

  it("fails a spec with a missing reference file before any spend", async () => {
    const dir = await mkdtemp(join(tmpdir(), "spec-refs-"));
    tempDirs.push(dir);
    const root = join(dir, "universe");
    await mkdir(join(root, "bibles"), { recursive: true });
    await writeFile(join(root, "bibles", "present.png"), "plate");
    let generationCalls = 0;
    const results = await preflightBatch({
      specs: ["frame.json"],
      root,
      readSpec: async () => ({
        master: { aspect_ratio: "4:5" },
        references: ["bibles/present.png", "bibles/missing.png"],
      }),
      compileSpec: () => {
        generationCalls += 1;
        return "prompt";
      },
      loadRegistry: () => ({}),
      fetchCapabilities: async () => ({}),
    });
    assert.equal(results[0].ok, false);
    const refs = results[0].checks.find((check) => check.label === "references present");
    assert.equal(refs.ok, false);
    assert.match(refs.detail, /bibles\/missing\.png/);
    assert.ok(generationCalls >= 1, "compilation runs; no provider generation is attempted");
  });

});
