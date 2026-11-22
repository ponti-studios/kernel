#!/usr/bin/env node
// Generate one silent clip per scene.
//
//   clips.mjs --scenes <scenes.json> [--out <dir>] [--only <sceneId>]
//             [--model <id>] [--aspect 16:9|9:16] [--vertical]
//             [--resolution 720p] [--max-seconds 10] [--budget 5.00]
//             [--yes] [--dry-run]
//
// --budget <usd> is a ceiling for this batch. Before each clip the script estimates its
// cost (per-second rate, or the most expensive earlier run of the same model in the
// ledger) and skips the clip if it would take the batch over. With no estimate at all,
// a budgeted batch refuses the clip rather than guess.
//
// Video clips are the expensive stage of this pipeline, so this script is a
// DRY RUN until --yes is passed. Use --only <sceneId> to spend on a single
// scene while iterating on a prompt.
//
// Mirrors the app's video stage: the clip prompt is the scene prompt with
// as written (prompt) or compiled from canon (spec), 16:9, 720p, generateAudio
// false, duration rounded from duration_seconds (default 8s). --vertical (or --aspect 9:16) makes the
// clips TikTok/Reels shape; the aspect and resolution land in the usage log. Per-scene failures are collected; the run
// only fails if every scene fails.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { setting } from "./resolve.mjs";
import { outputDir } from "../../../studio-core/scripts/lib/config.mjs";
import { extname, join } from "node:path";
import { parseArgs } from "node:util";

import { apiKey, load, readScenes } from "./resolve.mjs";
import { lintPrompt } from "./rules-lint.mjs";
import { withJob } from "../../../studio-core/scripts/lib/progress.mjs";
import { LEDGER, appendLine, readLedger } from "./runs.mjs";

// Sibling skills live beside this one.
const SKILLS = join(import.meta.dirname, "..", "..", "..");

const USAGE_DIR = setting("STUDIO_USAGE_DIR", "usage_dir", () =>
  join(homedir(), ".hominem", "ai_usage"),
);

const { values } = parseArgs({
  options: {
    scenes: { type: "string" },
    out: { type: "string" },
    only: { type: "string" },
    model: { type: "string" },
    yes: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "timeout-ms": { type: "string" },
    keyframes: { type: "string" },
    aspect: { type: "string" },
    vertical: { type: "boolean", default: false },
    resolution: { type: "string" },
    "max-seconds": { type: "string" },
    budget: { type: "string" },
    strict: { type: "boolean", default: false },
    "text-to-video": { type: "boolean", default: false },
    animatic: { type: "string" },
    "animatic-approved": { type: "boolean", default: false },
  },
});

// Testing cap: while a prompt or spec is still being proven, every clip is cut
// down to this many seconds (--max-seconds 10). Full-length scenes stay in the file.
const maxSeconds = values["max-seconds"] ? Number(values["max-seconds"]) : undefined;
if (maxSeconds !== undefined && !(Number.isInteger(maxSeconds) && maxSeconds > 0)) {
  console.error(`error: --max-seconds must be a positive whole number, got ${values["max-seconds"]}`);
  process.exit(2);
}
// Kling takes whole seconds between 3 and 15; the scene's own length wins unless capped.
const clipSeconds = (scene) => {
  const wanted = Math.ceil(scene.duration_seconds ?? 8);
  return maxSeconds === undefined ? wanted : Math.min(wanted, maxSeconds);
};

// Batch ceiling in USD. Parsed here so a typo fails before anything is priced.
const budgetUsd = values.budget === undefined ? undefined : Number(values.budget);
if (budgetUsd !== undefined && !(Number.isFinite(budgetUsd) && budgetUsd > 0)) {
  console.error(`error: --budget must be a positive dollar amount, got ${values.budget}`);
  process.exit(2);
}

// Vertical is a preset for TikTok/Reels: 9:16. Explicit --aspect wins over it.
const ASPECTS = ["16:9", "9:16"];
const aspect = values.aspect ?? (values.vertical ? "9:16" : "16:9");
const resolution = values.resolution ?? "720p";
if (!ASPECTS.includes(aspect)) {
  console.error(`error: --aspect must be one of ${ASPECTS.join(", ")} (got ${aspect})`);
  process.exit(2);
}

if (!values.scenes) {
  console.error("usage: clips.mjs --scenes <scenes.json> [--out <dir>] [--only <sceneId>] [--yes]");
  process.exit(2);
}

const config = await load("config");
const env = config.loadEnv();
const { OpenRouterVideoModel, OpenRouterVideoError } = await load("providers");

// Spec scenes compile their prompt from canon, the same compiler the imagegen stage uses.
// The universe root defaults to the skill's own example data, like everywhere else.
const universeRoot = setting("STUDIO_UNIVERSE_ROOT", "universe_root", () =>
  join(SKILLS, "studio-universe", "data"),
);
const { compileSpec, loadRegistry } = await load("universe");
const scenePrompt = (scene) => {
  if (scene.prompt) return scene.prompt;
  const spec = JSON.parse(readFileSync(scene.specPath, "utf8"));
  return compileSpec(spec, registry, universeRoot);
};

// Per-second pricing for the chosen model, so the dry run states real money
// instead of "it varies". The videos endpoint exposes pricing_skus; a model
// that doesn't (or a lookup failure) must not block the run.
let catalogue;
async function modelRecord(model) {
  if (catalogue === undefined) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/videos/models", {
        headers: { Authorization: `Bearer ${apiKey()}` },
        signal: AbortSignal.timeout(10000),
      });
      catalogue = res.ok ? ((await res.json()).data ?? []) : [];
    } catch {
      catalogue = [];
    }
  }
  return catalogue.find((m) => m.id === model);
}

async function perSecondUsd(model, { withAudio }) {
  try {
    const record = await modelRecord(model);
    const skus = record?.pricing_skus ?? {};
    const mode = values.keyframes ? "image_to_video" : "text_to_video";
    const suffix = resolution.toLowerCase();
    const raw = withAudio
      ? (skus[`duration_seconds_with_audio_${suffix}`] ?? skus.duration_seconds_with_audio)
      : (skus[`${mode}_duration_seconds_${suffix}`] ??
        skus[`duration_seconds_without_audio_${suffix}`] ??
        skus[`duration_seconds_${suffix}`] ??
        skus.duration_seconds_without_audio ??
        skus.duration_seconds);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

const usd = (n) => `$${n.toFixed(2)}`;
const rateUsd = (n) => `$${n.toFixed(3)}`;

const scenes = await readScenes(values.scenes);
const registry = scenes.some((s) => s.spec) ? loadRegistry(universeRoot) : null;
const selected = values.only ? scenes.filter((s) => s.id === values.only) : scenes;
if (values.only && selected.length === 0) {
  console.error(
    `error: no scene with id '${values.only}' (have: ${scenes.map((s) => s.id).join(", ")})`,
  );
  process.exit(2);
}

const outDir = values.out ?? outputDir("clips");
const clipModel = values.model ?? env.OPENROUTER_VIDEO_MODEL;
const timeoutMs = values["timeout-ms"] === undefined ? 10 * 60 * 1000 : Number(values["timeout-ms"]);
if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
  console.error("error: --timeout-ms must be a positive integer");
  process.exit(2);
}
if (values.keyframes && values["text-to-video"]) {
  console.error("error: choose either --keyframes or --text-to-video");
  process.exit(2);
}

console.log(`model:    ${clipModel}`);
console.log(`out:      ${outDir}`);
console.log(`clips:    ${selected.length}${maxSeconds !== undefined ? `  (test cap: ${maxSeconds}s each)` : ""}`);
console.log(`shipping: ${aspect}, ${resolution}, silent (generateAudio false)\n`);

const rate = await perSecondUsd(clipModel, { withAudio: false });

// What the model accepts, from its own catalogue record. Checked before any spend:
// a duration or aspect the model does not offer is refused here, not billed.
const record = await modelRecord(clipModel);
const caps = record
  ? {
      durations: record.supported_durations ?? [],
      aspects: record.supported_aspect_ratios ?? [],
      seed: record.seed === true,
      negative: (record.allowed_passthrough_parameters ?? []).includes("negative_prompt"),
    }
  : null;
if (caps) {
  if (!record.supported_resolutions?.includes(resolution)) {
    console.error(`error: ${clipModel} does not offer resolution ${resolution}`);
    process.exit(2);
  }
  if (values.keyframes && !record.supported_frame_images?.includes("first_frame")) {
    console.error(`error: ${clipModel} does not support first-frame image input`);
    process.exit(2);
  }
  if (!caps.aspects.includes(aspect)) {
    console.error(`error: ${clipModel} does not offer ${aspect} (offers ${caps.aspects.join(", ")})`);
    process.exit(2);
  }
  for (const scene of selected) {
    if (caps.durations.length && !caps.durations.includes(clipSeconds(scene))) {
      console.error(
        `error: scene '${scene.id}' is ${clipSeconds(scene)}s; ${clipModel} offers ${caps.durations.join(", ")}s (use --max-seconds to cap)`,
      );
      process.exit(2);
    }
  }
}

// Keyframe for a scene, if the keyframes folder has one. Used by the linter and the run log.
const keyframeFor = (scene) => {
  if (!values.keyframes) return undefined;
  const hit = readdirSync(values.keyframes).find(
    (f) => f.replace(/\.[^.]+$/, "") === scene.id && /\.(png|jpe?g|webp)$/i.test(f),
  );
  return hit ? join(values.keyframes, hit) : undefined;
};
const keyframeSize = (path) => {
  const dims = spawnSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", path],
    { encoding: "utf8" },
  );
  const [width, height] = (dims.stdout ?? "").trim().split("x").map(Number);
  return width && height ? { width, height } : undefined;
};

// Per-scene checks against the rulebook (rules-lint.mjs), and the seed and negative
// prompt each model can take. Findings are shown now and written into the run log.
const lintById = new Map();
const extrasById = new Map();
for (const scene of selected) {
  const text = scenePrompt(scene);
  const keyPath = keyframeFor(scene);
  const spec = scene.specPath ? JSON.parse(readFileSync(scene.specPath, "utf8")) : null;
  const findings = lintPrompt(text, {
    aspect,
    durationSeconds: clipSeconds(scene),
    generateAudio: false,
    keyframe: keyPath ? keyframeSize(keyPath) : undefined,
    castCount: spec?.cast?.length,
    hasNegative: Boolean(scene.negative),
    negativeSupported: caps?.negative ?? false,
  });
  const seedDropped = scene.seed !== undefined && caps && !caps.seed;
  if (seedDropped) findings.push({ rule: "R97", severity: "note", message: `${clipModel} has no seed; the scene seed is not sent` });
  if (scene.negative && caps && !caps.negative) {
    findings.push({ rule: "R18", severity: "warn", message: `${clipModel} has no negative field; the scene negative is not sent` });
  }
  lintById.set(scene.id, findings);
  extrasById.set(scene.id, { keyPath, spec, sendSeed: scene.seed !== undefined && (!caps || caps.seed) });
}

let estimated = 0;
for (const scene of selected) {
  const duration = clipSeconds(scene);
  const cost = rate ? duration * rate : undefined;
  if (cost !== undefined) estimated += cost;
  console.log(
    `  ${scene.id.padEnd(12)} ${String(duration).padStart(2)}s  ` +
      `${cost === undefined ? "     ?" : usd(cost).padStart(7)}  ` +
      `${(scene.prompt ?? `spec ${scene.spec}`).slice(0, 60)}`,
  );
}

if (rate) {
  console.log(
    `\nrate:     ${rateUsd(rate)}/second (silent) — ${selected.length} clip(s) ≈ ${usd(estimated)}`,
  );
} else {
  console.log("\nrate:     not exposed for this model; check the key's usage after one clip.");
}

// Compile every spec now, so a broken spec fails here, free, not after a clip is bought.
for (const scene of selected) {
  try {
    scenePrompt(scene);
  } catch (err) {
    console.error(`error: scene '${scene.id}' spec did not compile: ${err.message}`);
    process.exit(2);
  }
}

console.log("\nrules:");
let warnings = 0;
for (const scene of selected) {
  const findings = lintById.get(scene.id) ?? [];
  if (findings.length === 0) console.log(`  ${scene.id.padEnd(12)} clean`);
  for (const f of findings) {
    if (f.severity === "warn") warnings += 1;
    console.log(`  ${scene.id.padEnd(12)} ${f.severity.padEnd(4)} ${f.rule.padEnd(5)} ${f.message}`);
  }
}
if (values.strict && warnings > 0) {
  console.error(`\nerror: ${warnings} rule warning(s) and --strict is set; nothing submitted.`);
  process.exit(2);
}

if (values.yes && !values["dry-run"] && values.keyframes && (!values.animatic || !values["animatic-approved"] || !existsSync(values.animatic))) {
  console.error("error: image-to-video requires an existing reviewed --animatic and --animatic-approved before paid generation");
  process.exit(2);
}
if (values.yes && !values["dry-run"] && values.keyframes) {
  const check = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", values.animatic], {encoding:"utf8"});
  const [width, height] = (check.stdout ?? "").trim().split("x").map(Number);
  const expected = aspect === "9:16" ? 9 / 16 : 16 / 9;
  if (check.status !== 0 || !width || !height || Math.abs(width / height - expected) > 0.02) {
    console.error(`error: approved animatic must be a readable ${aspect} video`);
    process.exit(2);
  }
}
if (values.yes && !values["dry-run"] && !values.keyframes && !values["text-to-video"]) {
  console.error("error: choose --keyframes <dir> or explicitly select --text-to-video");
  process.exit(2);
}
if (values.yes && !values["dry-run"] && (!caps || !caps.durations.length || !rate)) {
  console.error("error: model capabilities, supported durations, and a per-second estimate are required before paid generation; nothing submitted.");
  process.exit(2);
}
if (values.keyframes) {
  const missing = selected.filter((scene) => !extrasById.get(scene.id).keyPath);
  if (missing.length) {
    console.error(`error: missing keyframes for ${missing.map((scene) => scene.id).join(", ")}`);
    process.exit(2);
  }
}
if (!values.yes || values["dry-run"]) {
  console.log(
    "\nDry run — no clips submitted. This stage bills per clip, so pass --yes to generate.",
  );
  console.log("While iterating, spend on one scene at a time: --only <sceneId>.");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

// Image-to-video: a keyframe per scene, published to R2 so the provider can fetch it.
// Without one the clip falls back to text-to-video, which is the drift we are fixing —
// so say which mode is in force rather than silently degrading.
let keyframeUrls = new Map();
if (values.keyframes) {
  const { publishFile } = await import(join(SKILLS, "studio-core", "scripts/lib/r2.mjs"));
  const keyDir = values.keyframes;
  const files = readdirSync(keyDir).filter((f) =>
    [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase()),
  );
  console.log(`keyframes: ${files.length} in ${keyDir}`);
  for (const scene of selected) {
    const match = files.find((f) => f.replace(/\.[^.]+$/, "") === scene.id);
    if (!match) {
      console.log(`  ${scene.id.padEnd(12)} no keyframe — text-to-video fallback`);
      continue;
    }
    const path = join(keyDir, match);
    const contentType = match.endsWith(".png")
      ? "image/png"
      : match.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    const key = `keyframes/${Date.now()}-${scene.id}${extname(match)}`;
    const url = await publishFile({ path, key, contentType });
    keyframeUrls.set(scene.id, url);
    console.log(`  ${scene.id.padEnd(12)} keyframe -> ${url.slice(0, 70)}…`);
  }
}

const run = async (scene, runId) => {
  const video = new OpenRouterVideoModel(apiKey());
  const duration = clipSeconds(scene);
  const started = Date.now();
  const result = await withJob({ kind: "video", label: scene.id, model: clipModel }, () =>
    video.generateClipWithUsage(
    {
      model: clipModel,
      prompt: scenePrompt(scene),
      ...(keyframeUrls.has(scene.id)
        ? { frameImages: [{ type: "first_frame", url: keyframeUrls.get(scene.id) }] }
        : {}),
      duration,
      aspectRatio: aspect,
      resolution,
      generateAudio: false,
      ...(extrasById.get(scene.id).sendSeed ? { seed: scene.seed } : {}),
      ...(caps?.negative && scene.negative ? { negativePrompt: scene.negative } : {}),
    },
    { timeoutMs },
    ),
  );
  // Every take stays where it is, in the same folder, named by its run id, so a re-run
  // never hides or overwrites an earlier one. The current take is also written under the
  // scene id, which assembly reads.
  const takesDir = join(outDir, "takes");
  mkdirSync(takesDir, { recursive: true });
  const path = join(takesDir, `${runId}.mp4`);
  writeFileSync(path, result.bytes);
  const selectionPath = join(outDir, "selection.json");
  const selection = existsSync(selectionPath) ? JSON.parse(readFileSync(selectionPath, "utf8")) : {};
  selection[scene.id] = { path: `takes/${runId}.mp4`, test_capped: duration < Math.ceil(scene.duration_seconds ?? 8) };
  writeFileSync(selectionPath, JSON.stringify(selection, null, 2) + "\n");
  return {
    path,
    bytes: result.bytes.length,
    seconds: (Date.now() - started) / 1000,
    // What OpenRouter said it cost. Absent means unpriced, never free.
    costUsd: result.usage?.costUsd,
    jobId: result.jobId,
  };
};

const done = [];
const failures = [];
let reportedUsd = 0;
let unpricedClips = 0;

// Best guess at one clip's cost before it is bought: the per-second rate if the catalogue
// has one, else the priciest earlier run of this model in the ledger, per second, scaled
// to this clip's length. Undefined means we have no basis, and a budgeted batch refuses it.
const estimateClip = (scene) => {
  const seconds = clipSeconds(scene);
  if (rate) return rate * seconds;
  const priced = readLedger().filter(
    (l) => l.kind === "run" && l.model === clipModel && typeof l.cost_usd === "number" && l.duration_seconds > 0,
  );
  if (!priced.length) return undefined;
  return Math.max(...priced.map((l) => l.cost_usd / l.duration_seconds)) * seconds;
};

for (const scene of selected) {
  if (budgetUsd !== undefined) {
    const est = estimateClip(scene);
    if (est === undefined || reportedUsd + est > budgetUsd) {
      const why = est === undefined ? "no cost estimate yet" : `estimate ${usd(est)} would pass the budget`;
      console.log(`  ${scene.id.padEnd(12)} skipped: ${why} (spent ${usd(reportedUsd)} of ${usd(budgetUsd)})`);
      failures.push(`${scene.id} (budget): ${why}`);
      continue;
    }
  }
  process.stdout.write(`  ${scene.id.padEnd(12)} submitting… `);
  try {
    const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${scene.id}`;
    const result = await run(scene, runId);
    done.push({ id: scene.id, ...result });
    const extras = extrasById.get(scene.id);
    const text = scenePrompt(scene);
    appendLine({
      kind: "run",
      run_id: runId,
      at: new Date().toISOString(),
      model: clipModel,
      scene_id: scene.id,
      spec: scene.specPath ?? null,
      prompt: text,
      prompt_sha256: createHash("sha256").update(text).digest("hex"),
      keyframe: extras.keyPath ? extras.keyPath.replace(/^.*\//, "") : null,
      seed: extras.sendSeed ? scene.seed : null,
      negative: caps?.negative && scene.negative ? scene.negative : null,
      aspect,
      resolution,
      duration_seconds: clipSeconds(scene),
      output: result.path,
      cost_usd: result.costUsd ?? null,
      provider_request_id: result.jobId ?? null,
      lint: lintById.get(scene.id) ?? [],
    });
    if (result.costUsd === undefined) unpricedClips += 1;
    else reportedUsd += result.costUsd;
    console.log(
      `${(result.bytes / 1024 / 1024).toFixed(1)} MB in ${result.seconds.toFixed(0)}s -> ${result.path}`,
    );
    console.log(`  run: ${runId}  (rate it with runs.sh)`);
  } catch (err) {
    const kind = err instanceof OpenRouterVideoError ? err.code : "error";
    failures.push(`${scene.id} (${kind}): ${err.message}`);
    console.log(`FAILED ${kind}: ${err.message}`);
  }
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const logPath = join(USAGE_DIR, `${stamp}-mediagen-clips.json`);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: "mediagen-clips",
      model: clipModel,
      aspect_ratio: aspect,
      resolution,
      generate_audio: false,
      rate_usd_per_second: rate ?? null,
      // reported_usd: summed from each completed job's usage block.
      // estimated_usd: the rate-table fallback, when the provider said nothing.
      reported_usd: unpricedClips === 0 ? Number(reportedUsd.toFixed(4)) : null,
      estimated_usd: rate && unpricedClips > 0 ? Number(estimated.toFixed(2)) : null,
      unpriced_clips: unpricedClips,
      requested: selected.map((s) => ({
        id: s.id,
        duration_seconds: clipSeconds(s),
      })),
      generated: done.map(({ id, bytes, seconds, path, costUsd, jobId }) => ({
        id,
        bytes,
        seconds: Math.round(seconds),
        path,
        cost_usd: costUsd ?? null,
        cost_source: costUsd === undefined ? null : "reported",
        provider_request_id: jobId ?? null,
      })),
      failed: failures,
    },
    null,
    2,
  ),
);

console.log(`\ngenerated: ${done.length}/${selected.length}`);
if (done.length > 0) {
  console.log(
    unpricedClips === 0
      ? `cost:      $${reportedUsd.toFixed(4)} reported by the provider`
      : `cost:      ${done.length - unpricedClips} reported ($${reportedUsd.toFixed(4)}), ${unpricedClips} unpriced`,
  );
}
if (budgetUsd !== undefined) console.log(`budget:    ${usd(reportedUsd)} of ${usd(budgetUsd)} used this batch`);
console.log(`log:       ${logPath}`);
if (failures.length) console.log(`failed:    ${failures.length}\n  ${failures.join("\n  ")}`);
if (failures.length) {
  console.error("\none or more scenes failed.");
  process.exit(1);
}
