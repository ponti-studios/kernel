#!/usr/bin/env node
// One keyframe per shot, from the shot list.
//
//   keyframes.mjs --scenes <scenes.json> [--out <dir>] [--only <id>]
//                 [--model <id>] [--resolution 720p|1080p|2K] [--yes] [--dry-run]
//
// This is the cheap stage of the video pipeline: a still costs a fraction of a clip,
// so the look is settled here before any motion is bought. Named <scene-id>.png so
// Videogen pairs stills with shots by scene id, without a manifest.
//
// Dry run until --yes, same contract as the clip stage.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";

import { apiKey, outputDir, setting } from "../../../studio-core/scripts/lib/config.mjs";
import {
  batchExitCode,
  BatchExecutor,
  imageCost,
  OpenRouterImageError,
  OpenRouterImageModel,
  RefStager,
} from "../../../studio-core/scripts/lib/images.mjs";
import { recordRender } from "./ledger-bridge.mjs";
import { load, readScenes, universeRoot } from "./resolve.mjs";

const USAGE_DIR = setting("STUDIO_USAGE_DIR", "usage_dir", () =>
  join(homedir(), ".hominem", "ai_usage"),
);

const { values } = parseArgs({
  options: {
    scenes: { type: "string" },
    out: { type: "string" },
    only: { type: "string" },
    model: { type: "string" },
    resolution: { type: "string", default: "2K" },
    aspect: { type: "string", default: "16:9" },
    yes: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    concurrency: { type: "string", default: "4" },
    "stage-refs": { type: "boolean", default: false },
    "no-stage-refs": { type: "boolean", default: false },
  },
});

if (!values.scenes) {
  console.error("usage: keyframes.mjs --scenes <scenes.json> --out <dir> [--only <id>] [--yes]");
  process.exit(2);
}
if (values["stage-refs"] && values["no-stage-refs"]) {
  console.error("error: --stage-refs and --no-stage-refs cannot be combined");
  process.exit(2);
}
const concurrency = Number(values.concurrency);
if (!Number.isInteger(concurrency) || concurrency < 1) {
  console.error("error: --concurrency must be a positive integer");
  process.exit(2);
}

let scenes;
try {
  scenes = await readScenes(values.scenes);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(2);
}

const root = universeRoot();
let registry;
let compileSpec;
if (scenes.some((scene) => scene.spec)) {
  try {
    const universe = await load("universe");
    compileSpec = universe.compileSpec;
    registry = universe.loadRegistry(root);
  } catch (err) {
    console.error(`error: cannot load Universe canon from ${root}: ${err.message}`);
    process.exit(2);
  }
}

const selectedRaw = values.only ? scenes.filter((scene) => scene.id === values.only) : scenes;
if (values.only && selectedRaw.length === 0) {
  console.error(`error: no scene with id '${values.only}' (have: ${scenes.map((s) => s.id).join(", ")})`);
  process.exit(2);
}

const prepared = [];
for (const scene of selectedRaw) {
  if (scene.prompt) {
    prepared.push({
      ...scene,
      renderPrompt: scene.prompt,
      refPaths: scene.references ?? scene.refs ?? [],
      aspect: values.aspect ?? "16:9",
    });
  } else {
    try {
      const raw = JSON.parse(readFileSync(scene.specPath, "utf8"));
      const spec = raw?.frameSpec ?? raw?.draft ?? raw;
      const prompt = compileSpec(spec, registry, root);
      prepared.push({
        ...scene,
        renderPrompt: prompt,
        refPaths: spec.references ?? [],
        aspect: values.aspect ?? "16:9",
        fromSpec: true,
      });
    } catch (err) {
      console.error(`COMPILE REFUSED — ${scene.id}: ${err.code ?? "error"}`);
      console.error(err.message);
      process.exit(1);
    }
  }
}

for (const scene of prepared) {
  scene.references = scene.refPaths.map((ref) => {
    const path = ref.startsWith("/")
      ? ref
      : scene.fromSpec
        ? resolve(root, ref)
        : resolve(dirname(resolve(values.scenes)), ref);
    if (!existsSync(path)) {
      console.error(`error: reference image missing for ${scene.id}: ${ref}`);
      process.exit(2);
    }
    return path;
  });
}

const model =
  values.model ?? setting("OPENROUTER_IMAGE_MODEL", "model_image", "qwen/qwen-image-2.1-turbo");
const outDir = values.out ?? outputDir("keyframes");
const selected = prepared;

console.log(`scenes:  ${selected.length} of ${scenes.length}`);
console.log(`model:   ${model}`);
console.log(`out:     ${outDir}`);
console.log(`shape:   ${values.aspect} at ${values.resolution}`);
console.log(`concurrency: ${concurrency}`);
console.log("");

for (const scene of selected) {
  const file = join(outDir, `${scene.id}.png`);
  const length = String(scene.renderPrompt ?? "").length;
  console.log(
    `  ${String(scene.id).padEnd(18)} ${String(scene.duration_seconds ?? "?").padStart(4)}s  ${length} char prompt  -> ${file}`,
  );
}

if (values["dry-run"] || !values.yes) {
  console.log(
    "\nDry run — no stills generated. A keyframe is the cheap place to iterate; pass --yes to render.",
  );
  console.log("While iterating on a look: --only <sceneId>.");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const image = new OpenRouterImageModel(apiKey(), model);
const started = Date.now();
const calls = [];
const executor = new BatchExecutor({ concurrency });
const stager = values["stage-refs"] ? new RefStager() : null;
const results = await executor.run(selected, async (scene) => {
  const file = join(outDir, `${scene.id}.png`);
  try {
    const references = [];
    for (const path of scene.references) {
      const ext = extname(path).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "image/webp";
      const staged = stager ? await stager.stage(path) : null;
      if (staged?.passthrough) console.log(`staged: passthrough — ${path}`);
      const dataUrl =
        staged?.dataUrl ?? `data:${mime};base64,${readFileSync(path).toString("base64")}`;
      references.push({ dataUrl });
    }
    const res = await image.generate({
      model,
      prompt: scene.renderPrompt,
      references,
      aspectRatio: scene.aspect,
      resolution: values.resolution,
      outputFormat: "png",
    });
    writeFileSync(file, res.bytes);
    const cost = await imageCost(res, (generationId) => image.generationCost(generationId));
    const costUsd = cost.totalCost;
    const record = {
      id: scene.id,
      output: file,
      bytes: res.bytes.length,
      costUsd,
      requestId: res.generationId,
      attempts: res.attempts ?? 1,
      references: references.length,
      aspect: scene.aspect,
      spec: scene.specPath ?? null,
      promptSha256: createHash("sha256").update(scene.renderPrompt).digest("hex"),
    };
    calls.push(record);
    console.log(
      `  ${scene.id}: ${record.bytes} bytes${costUsd === undefined ? " (unpriced)" : ` — $${costUsd.toFixed(4)}`} (attempts ${record.attempts})`,
    );
    return record;
  } catch (err) {
    const kind = err instanceof OpenRouterImageError ? err.code : "error";
    const failure = new Error(`${scene.id} (${kind}): ${err.message}`, { cause: err });
    failure.attempts = err.attempts ?? 1;
    throw failure;
  }
});
const failures = results.failed.map(
  ({ job, error }) => `${job.id}: ${error.message} (attempts ${error.attempts ?? 1})`,
);

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const logPath = join(USAGE_DIR, `${stamp}-videogen-keyframes.json`);
const reported = calls.filter((c) => c.costUsd !== undefined);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: "videogen-keyframes",
      model,
      shape: { aspect: values.aspect, resolution: values.resolution },
      scenes: calls,
      failed: failures,
      // Absent cost is unpriced, never zero.
      cost_usd_reported: reported.length ? reported.reduce((a, c) => a + c.costUsd, 0) : null,
      unpriced: calls.length - reported.length,
      scene_file: values.scenes,
      seconds: (Date.now() - started) / 1000,
    },
    null,
    2,
  ),
);

for (const call of calls) {
  await recordRender({
    model,
    resolution: values.resolution,
    promptSha256: call.promptSha256,
    params: {
      aspect: call.aspect,
      resolution: values.resolution,
      references: call.references,
      scene: call.id,
      ...(call.spec ? { spec: call.spec } : {}),
    },
    generationId: call.requestId ?? null,
    costUsd: call.costUsd ?? null,
    outputPath: call.output,
    idempotencyKey: null,
  });
}

console.log(`\ngenerated: ${calls.length}/${selected.length}`);
if (reported.length)
  console.log(
    `cost:     $${reported.reduce((a, c) => a + c.costUsd, 0).toFixed(4)} reported by the provider`,
  );
console.log(`log:      ${logPath}`);
if (failures.length) console.log(`failed:   ${failures.length}\n  ${failures.join("\n  ")}`);
process.exit(batchExitCode(results));
