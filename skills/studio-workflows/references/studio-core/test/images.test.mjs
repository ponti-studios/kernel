import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  batchExitCode,
  BatchExecutor,
  imageCost,
  OpenRouterImageError,
  OpenRouterImageModel,
  RefStager,
} from "../scripts/lib/images.mjs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function bytesResponse(body, status = 200, generationId) {
  const headers = { "Content-Type": "application/json" };
  if (generationId) headers["X-Generation-Id"] = generationId;
  if (body instanceof Uint8Array) return new Response(body, { status, headers });
  return new Response(JSON.stringify(body), { status, headers });
}

const INPUT = {
  model: "qwen/qwen-image-2.1-turbo",
  prompt: "A picture palace.",
  references: [{ dataUrl: "data:image/png;base64,AAA" }],
  aspectRatio: "4:5",
  resolution: "2K",
  outputFormat: "webp",
};
const CONTRACT = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./fixtures/openrouter-image-contract.json", import.meta.url)),
    "utf8",
  ),
);

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("OpenRouterImageModel", () => {
  it("decodes b64 output and keeps the generation id", async () => {
    const b64 = Buffer.from([1, 2, 3]).toString("base64");
    globalThis.fetch = async () =>
      bytesResponse({ data: [{ b64_json: b64, media_type: "image/webp" }] }, 200, "gen-1");
    const model = new OpenRouterImageModel("key", "m");
    const result = await model.generate(INPUT);
    assert.equal(result.bytes.length, 3);
    assert.deepEqual([...result.bytes], [1, 2, 3]);
    assert.equal(result.mimeType, "image/webp");
    assert.equal(result.mediaType, "image/webp");
    assert.equal(result.generationId, "gen-1");
  });

  it("falls back to the response body id when the header is absent", async () => {
    const b64 = Buffer.from([4]).toString("base64");
    globalThis.fetch = async () => bytesResponse({ id: "gen-body", data: [{ b64_json: b64 }] });
    const result = await new OpenRouterImageModel("key", "m").generate(INPUT);
    assert.equal(result.generationId, "gen-body");
  });

  it("sends the documented image body with references as image_url objects", async () => {
    let sent;
    globalThis.fetch = async (url, init) => {
      assert.equal(url, "https://openrouter.ai/api/v1/images");
      assert.equal(init.method, "POST");
      assert.equal(init.headers.Authorization, "Bearer key");
      sent = JSON.parse(String(init.body));
      return bytesResponse({ data: [{ b64_json: Buffer.from([9]).toString("base64") }] });
    };
    await new OpenRouterImageModel("key", "m").generate(INPUT);
    assert.deepEqual(sent, {
      model: "qwen/qwen-image-2.1-turbo",
      prompt: "A picture palace.",
      input_references: [{ type: "image_url", image_url: { url: "data:image/png;base64,AAA" } }],
      aspect_ratio: "4:5",
      resolution: "2K",
      output_format: "webp",
    });
  });

  it("matches the shared OpenRouter transport fixture", async () => {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, CONTRACT.endpoint);
      assert.deepEqual(JSON.parse(String(init.body)), CONTRACT.payload);
      return bytesResponse(CONTRACT.response);
    };
    const result = await new OpenRouterImageModel("key", "m").generate({
      model: CONTRACT.payload.model,
      prompt: CONTRACT.payload.prompt,
      references: [{ dataUrl: CONTRACT.payload.input_references[0].image_url.url }],
      aspectRatio: CONTRACT.payload.aspect_ratio,
      resolution: CONTRACT.payload.resolution,
      outputFormat: CONTRACT.payload.output_format,
    });
    assert.equal(result.usage.costUsd, CONTRACT.cost.response_usage);
    assert.equal(CONTRACT.cost.unpriced, null);
  });

  it("uses response cost before generation cost, then leaves unpriced output null", async () => {
    let lookups = 0;
    const generationCost = async () => {
      lookups += 1;
      return { totalCost: CONTRACT.cost.generation_cost };
    };
    assert.equal(
      (
        await imageCost(
          { usage: { costUsd: CONTRACT.cost.response_usage }, generationId: "g" },
          generationCost,
        )
      ).totalCost,
      CONTRACT.cost.response_usage,
    );
    assert.equal(lookups, 0);
    assert.equal(
      (await imageCost({ generationId: "g" }, generationCost)).totalCost,
      CONTRACT.cost.generation_cost,
    );
    assert.equal(lookups, 1);
    assert.deepEqual(await imageCost({}, generationCost), {});
  });

  it("uses the default model when the input model is empty", async () => {
    let sent;
    globalThis.fetch = async (_url, init) => {
      sent = JSON.parse(String(init.body));
      return bytesResponse({ data: [{ b64_json: Buffer.from([1]).toString("base64") }] });
    };
    await new OpenRouterImageModel("key", "fallback-model").generate({ ...INPUT, model: "" });
    assert.equal(sent.model, "fallback-model");
  });

  it("reads the reported usage block, including cost", async () => {
    const b64 = Buffer.from([1]).toString("base64");
    globalThis.fetch = async () =>
      bytesResponse({
        data: [{ b64_json: b64 }],
        usage: {
          cost: 0.018,
          prompt_tokens: 16,
          completion_tokens: 1088,
          total_tokens: 1104,
          completion_tokens_details: { image_tokens: 1024 },
        },
      });
    const result = await new OpenRouterImageModel("key", "m").generate(INPUT);
    assert.deepEqual(result.usage, {
      costUsd: 0.018,
      promptTokens: 16,
      completionTokens: 1088,
      totalTokens: 1104,
      imageTokens: 1024,
    });
  });

  // The bug that made every image render unpriced for weeks: the response DID
  // carry the cost, but nothing read it, and the caller fell back to an endpoint
  // that 404s for images. A response without usage must say so, not say zero.
  it("leaves usage undefined when the response carries none", async () => {
    const b64 = Buffer.from([1]).toString("base64");
    globalThis.fetch = async () => bytesResponse({ data: [{ b64_json: b64 }] }, 200, "gen-2");
    const result = await new OpenRouterImageModel("key", "m").generate(INPUT);
    assert.equal(result.usage, undefined);
    assert.equal(result.generationId, "gen-2");
  });

  it("maps 402 to credits", async () => {
    globalThis.fetch = async () => bytesResponse({}, 402);
    await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT), (error) => {
      assert.ok(error instanceof OpenRouterImageError);
      assert.equal(error.code, "credits");
      assert.equal(error.attempts, 1);
      return true;
    });
  });

  it("maps server errors to http", async () => {
    globalThis.fetch = async () => bytesResponse({}, 500);
    await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT), { code: "http" });
  });

  it("retries a 500 once and reports attempts", async () => {
    let calls = 0;
    globalThis.fetch = async () =>
      ++calls === 1
        ? bytesResponse({}, 500)
        : bytesResponse({ data: [{ b64_json: Buffer.from([1]).toString("base64") }] });
    const result = await new OpenRouterImageModel("key", "m").generate(INPUT);
    assert.equal(calls, 2);
    assert.equal(result.attempts, 2);
  });

  it("splits and retries rate limits", async () => {
    let calls = 0;
    globalThis.fetch = async () =>
      ++calls === 1
        ? bytesResponse({}, 429)
        : bytesResponse({ data: [{ b64_json: Buffer.from([1]).toString("base64") }] });
    assert.equal((await new OpenRouterImageModel("key", "m").generate(INPUT)).attempts, 2);
  });

  it("preserves rate_limited as the typed error when retries are disabled", async () => {
    const previous = process.env.STUDIO_LEGS;
    process.env.STUDIO_LEGS = "off";
    try {
      globalThis.fetch = async () => bytesResponse({}, 429);
      await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT), {
        code: "rate_limited",
      });
    } finally {
      if (previous === undefined) delete process.env.STUDIO_LEGS;
      else process.env.STUDIO_LEGS = previous;
    }
  });

  it("does not retry client errors and preserves the typed error", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return bytesResponse({}, 400);
    };
    await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT), (error) => {
      assert.ok(error instanceof OpenRouterImageError);
      assert.equal(error.code, "http");
      return true;
    });
    assert.equal(calls, 1);
  });

  it("does not retry other 4xx, malformed responses, or empty image bytes", async () => {
    for (const status of [401, 403, 404]) {
      let calls = 0;
      globalThis.fetch = async () => {
        calls += 1;
        return bytesResponse({}, status);
      };
      await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT));
      assert.equal(calls, 1);
    }
    for (const body of [{ not: "an image" }, { data: [{ b64_json: "" }] }]) {
      let calls = 0;
      globalThis.fetch = async () => {
        calls += 1;
        return bytesResponse(body);
      };
      await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT));
      assert.equal(calls, 1);
    }
  });

  it("retries network errors once", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      if (calls === 1) throw new Error("reset");
      return bytesResponse({ data: [{ b64_json: Buffer.from([1]).toString("base64") }] });
    };
    assert.equal((await new OpenRouterImageModel("key", "m").generate(INPUT)).attempts, 2);
  });

  it("stages references with content-addressed caching", async () => {
    const dir = await mkdtemp(join(tmpdir(), "image-stage-"));
    const file = join(dir, "plate.png");
    let resized = 0;
    try {
      await writeFile(file, "first");
      const stager = new RefStager({
        cacheDir: join(dir, "cache"),
        resizer: async (b) => {
          resized += 1;
          return Buffer.from(`jpg:${b}`);
        },
      });
      assert.equal((await stager.stage(file)).fromCache, false);
      assert.equal((await stager.stage(file)).fromCache, true);
      await writeFile(file, "edited");
      assert.equal((await stager.stage(file)).fromCache, false);
      assert.equal(resized, 2);
      assert.equal(await readFile(join(dir, "cache", "missing.jpg")).catch(() => null), null);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("reports and caches a passthrough plate with its original MIME type", async () => {
    const dir = await mkdtemp(join(tmpdir(), "image-passthrough-"));
    const file = join(dir, "plate.png");
    try {
      await writeFile(file, "not-a-real-png");
      const stager = new RefStager({ cacheDir: join(dir, "cache"), resizer: async () => null });
      const first = await stager.stage(file);
      const second = await stager.stage(file);
      assert.equal(first.passthrough, true);
      assert.equal(second.passthrough, true);
      assert.equal(first.dataUrl, second.dataUrl);
      assert.match(second.dataUrl, /^data:image\/png;base64,/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("collects batch failures and completion callbacks", async () => {
    const seen = [];
    const result = await new BatchExecutor({
      concurrency: 2,
      onJobDone: (row) => seen.push(row.job),
    }).run([1, 2, 3], async (job) => {
      if (job === 2) throw new Error("bad");
      return job;
    });
    assert.equal(result.done.length, 2);
    assert.equal(result.failed.length, 1);
    assert.equal(batchExitCode(result), 0);
    assert.deepEqual([...seen].sort(), [1, 2, 3]);
    const allFailed = await new BatchExecutor({ concurrency: 4 }).run([1, 2, 3, 4], async () => {
      throw new Error("offline");
    });
    assert.equal(allFailed.done.length, 0);
    assert.equal(allFailed.failed.length, 4);
    assert.equal(batchExitCode(allFailed), 1);
  });

  it("runs four delayed jobs concurrently and preserves order at concurrency one", async () => {
    const started = Date.now();
    await new BatchExecutor({ concurrency: 4 }).run([1, 2, 3, 4], async (n) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return n;
    });
    assert.ok(Date.now() - started < 1600);
    const order = [];
    await new BatchExecutor({ concurrency: 1 }).run([1, 2, 3], async (n) => {
      order.push(n);
      return n;
    });
    assert.deepEqual(order, [1, 2, 3]);
  });

  it("maps a transport failure to network", async () => {
    globalThis.fetch = async () => {
      throw new Error("dns");
    };
    await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT), { code: "network" });
  });

  it("rejects responses without image data", async () => {
    globalThis.fetch = async () => bytesResponse({ data: [] });
    await assert.rejects(new OpenRouterImageModel("key", "m").generate(INPUT), { code: "shape" });
  });

  it("recovers cost per generation id, tolerating lookup failure", async () => {
    globalThis.fetch = async () =>
      bytesResponse({ data: { total_cost: 0.05, total_tokens: 1200 } });
    const model = new OpenRouterImageModel("key", "m");
    assert.deepEqual(await model.generationCost("gen-1"), { totalCost: 0.05, totalTokens: 1200 });

    globalThis.fetch = async () => {
      throw new Error("down");
    };
    assert.deepEqual(await new OpenRouterImageModel("key", "m").generationCost("gen-1"), {});
  });

  it("returns an empty cost object when the lookup is not ok", async () => {
    globalThis.fetch = async () => bytesResponse({}, 404);
    assert.deepEqual(await new OpenRouterImageModel("key", "m").generationCost("gen-1"), {});
  });
});
