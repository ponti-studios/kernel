// OpenRouter image generation: POST /api/v1/images.
//
// Reference plates ride as data URLs, so no public hosting is needed. Raw fetch:
// the response carries base64 bytes, and cost is recovered per generation id
// (or, better, straight off the response's usage block).
//
// Ported from studio packages/providers/src/openrouter-images.ts.
import { normalizeUsage } from "./usage.mjs";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { spawn } from "node:child_process";

function runMagick(bytes, maxEdge, quality) {
  return new Promise((resolve) => {
    const child = spawn("magick", [
      "-",
      "-auto-orient",
      "-resize",
      `${maxEdge}x${maxEdge}>`,
      "-quality",
      String(quality),
      "jpeg:-",
    ]);
    const chunks = [];
    child.stdin.on("error", () => {});
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.on("error", () => resolve(null));
    child.on("close", (code) => resolve(code === 0 ? Buffer.concat(chunks) : null));
    child.stdin.end(bytes);
  });
}

async function defaultResizer(bytes, { maxEdge, quality }) {
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(bytes)
      .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND" && error?.code !== "MODULE_NOT_FOUND") throw error;
  }
  return runMagick(bytes, maxEdge, quality);
}

const BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterImageError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "OpenRouterImageError";
    this.code = code;
    if (status !== undefined) this.status = status;
  }
}

const RETRYABLE_STATUS = (status) => status === 429 || (status >= 500 && status <= 599);

export async function withRetry(fn, { attempts = 2, backoffMs = 750 } = {}) {
  let count = 0;
  while (true) {
    count += 1;
    try {
      return { ...(await fn()), attempts: count };
    } catch (error) {
      const retryable =
        error?.code === "network" ||
        error?.code === "rate_limited" ||
        RETRYABLE_STATUS(error?.status) ||
        (error?.code === "http" && /^image generation 5\d\d$/.test(error.message));
      if (!retryable || count >= attempts || process.env.STUDIO_LEGS === "off") {
        if (error && typeof error === "object") error.attempts = count;
        throw error;
      }
      await delay(backoffMs);
    }
  }
}

export async function imageCost(result, generationCost) {
  if (result.usage?.costUsd !== undefined) {
    return {
      totalCost: result.usage.costUsd,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    };
  }
  if (result.generationId) return generationCost(result.generationId);
  return {};
}

export class BatchExecutor {
  constructor({ concurrency = 4, onJobDone = () => {} } = {}) {
    if (!Number.isInteger(concurrency) || concurrency < 1)
      throw new TypeError("concurrency must be a positive integer");
    this.concurrency = concurrency;
    this.onJobDone = onJobDone;
  }

  async run(jobs, worker) {
    const done = [];
    const failed = [];
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(this.concurrency, jobs.length) }, async () => {
        while (next < jobs.length) {
          const index = next++;
          const job = jobs[index];
          try {
            const value = await worker(job);
            const result = { job, value };
            done.push(result);
            await this.onJobDone(result);
          } catch (error) {
            failed.push({ job, error });
            await this.onJobDone({ job, error });
          }
        }
      }),
    );
    return { done, failed };
  }
}

export function batchExitCode({ done, failed }) {
  return done.length > 0 || failed.length === 0 ? 0 : 1;
}

export class RefStager {
  #inflight = new Map();

  constructor({
    cacheDir = process.env.STUDIO_STAGE_DIR ?? join(homedir(), ".cache", "studio", "refs"),
    resizer = defaultResizer,
    maxEdge = 1024,
    quality = 88,
  } = {}) {
    this.cacheDir = cacheDir;
    this.resizer = resizer;
    this.maxEdge = maxEdge;
    this.quality = quality;
  }

  async stage(path) {
    const originalBytes = await readFile(path);
    const key = createHash("sha256")
      .update(originalBytes)
      .update(`\0${this.maxEdge}\0${this.quality}`)
      .digest("hex");
    const cached = await this.#readCache(key);
    if (cached) return { ...cached, originalBytes: originalBytes.length, fromCache: true };
    // A batch usually shares plates between scenes: stage each content key once.
    let pending = this.#inflight.get(key);
    if (!pending) {
      pending = this.#stageAndCache(key, path, originalBytes).finally(() =>
        this.#inflight.delete(key),
      );
      this.#inflight.set(key, pending);
    }
    return pending;
  }

  async #readCache(key) {
    const cachedPath = join(this.cacheDir, `${key}.stage`);
    try {
      const stagedBytes = await readFile(cachedPath);
      const metadata = JSON.parse(await readFile(`${cachedPath}.json`, "utf8"));
      return {
        dataUrl: `data:${metadata.mime};base64,${stagedBytes.toString("base64")}`,
        stagedBytes,
        passthrough: metadata.passthrough,
      };
    } catch {
      return null;
    }
  }

  async #stageAndCache(key, path, originalBytes) {
    // Another process may have filled the entry while this one was reading bytes.
    const raced = await this.#readCache(key);
    if (raced) return { ...raced, originalBytes: originalBytes.length, fromCache: true };
    const resized = this.resizer
      ? await this.resizer(originalBytes, { maxEdge: this.maxEdge, quality: this.quality })
      : null;
    const passthrough = !resized;
    const stagedBytes = resized ?? originalBytes;
    const mimeByExtension = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const mime = passthrough
      ? (mimeByExtension[extname(path).toLowerCase()] ?? "image/jpeg")
      : "image/jpeg";
    await mkdir(this.cacheDir, { recursive: true });
    const cachedPath = join(this.cacheDir, `${key}.stage`);
    // Atomic: a concurrent reader must never see a half-written plate.
    const temp = `${cachedPath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temp, stagedBytes);
    await rename(temp, cachedPath);
    const metaTemp = `${temp}.json`;
    await writeFile(metaTemp, JSON.stringify({ mime, passthrough }));
    await rename(metaTemp, `${cachedPath}.json`);
    return {
      dataUrl: `data:${mime};base64,${stagedBytes.toString("base64")}`,
      stagedBytes,
      originalBytes: originalBytes.length,
      fromCache: false,
      passthrough,
    };
  }
}

export class OpenRouterImageModel {
  #apiKey;
  #defaultModel;
  #fetchImpl;

  constructor(apiKey, defaultModel, fetchImpl = globalThis.fetch) {
    this.#apiKey = apiKey;
    this.#defaultModel = defaultModel;
    this.#fetchImpl = fetchImpl;
  }

  get #headers() {
    return {
      Authorization: `Bearer ${this.#apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async generate(input) {
    const result = await withRetry(() => this.#generate(input));
    return result;
  }

  async #generate(input) {
    const model = input.model || this.#defaultModel;
    let response;
    try {
      response = await this.#fetchImpl(`${BASE_URL}/images`, {
        method: "POST",
        headers: this.#headers,
        body: JSON.stringify({
          model,
          prompt: input.prompt,
          input_references: (input.references ?? []).map((r) => ({
            type: "image_url",
            image_url: { url: r.dataUrl },
          })),
          aspect_ratio: input.aspectRatio,
          resolution: input.resolution,
          output_format: input.outputFormat,
        }),
      });
    } catch (cause) {
      throw new OpenRouterImageError(
        "network",
        cause instanceof Error ? cause.message : "image request failed",
      );
    }
    if (response.status === 402) {
      throw new OpenRouterImageError("credits", "openrouter credits insufficient", 402);
    }
    if (response.status === 429) {
      throw new OpenRouterImageError("rate_limited", "image generation rate limited", 429);
    }
    if (!response.ok) {
      throw new OpenRouterImageError("http", `image generation ${response.status}`, response.status);
    }
    const generationId =
      response.headers.get("X-Generation-Id") ??
      response.headers.get("x-generation-id") ??
      undefined;
    let body;
    try {
      body = await response.json();
    } catch {
      throw new OpenRouterImageError("shape", "image response was not JSON");
    }
    const item = body?.data?.[0];
    if (!item?.b64_json) {
      throw new OpenRouterImageError("shape", "image response has no b64_json output");
    }
    const usage = normalizeUsage(body.usage);
    const bytes = Uint8Array.from(Buffer.from(item.b64_json, "base64"));
    if (bytes.length === 0) {
      throw new OpenRouterImageError("empty", "image response decoded to no bytes");
    }
    return {
      bytes,
      mimeType: input.outputFormat === "png" ? "image/png" : "image/webp",
      ...(item.media_type ? { mediaType: item.media_type } : {}),
      ...((generationId ?? body.id) ? { generationId: generationId ?? body.id } : {}),
      ...(usage ? { usage } : {}),
    };
  }

  /** Cost for one generation. Never throws: an unpriced render returns {}. */
  async generationCost(generationId) {
    try {
      const response = await this.#fetchImpl(`${BASE_URL}/generation?id=${generationId}`, {
        headers: this.#headers,
      });
      if (!response.ok) return {};
      const body = await response.json();
      const data = body?.data ?? {};
      return {
        ...(data.total_cost !== undefined ? { totalCost: data.total_cost } : {}),
        ...(data.tokens_prompt !== undefined ? { promptTokens: data.tokens_prompt } : {}),
        ...(data.tokens_completion !== undefined
          ? { completionTokens: data.tokens_completion }
          : {}),
        ...(data.total_tokens !== undefined ? { totalTokens: data.total_tokens } : {}),
      };
    } catch {
      return {};
    }
  }
}
