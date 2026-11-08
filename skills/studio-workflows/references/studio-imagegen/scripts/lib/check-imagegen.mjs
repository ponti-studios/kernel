#!/usr/bin/env node
// Preflight an image run: packages, registry, model capabilities, reference
// images. Spends nothing. Compiles the spec too, so a refusal surfaces here.
//
//   check-imagegen.mjs [--spec <frame-spec.json>] [--model <id>]
import { existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import { parseArgs } from "node:util";

import { IMAGE_MIME, apiKey, load, readSpec, studioRoot, universeRoot } from "./resolve.mjs";
import { preflightBatch, readSpecList } from "./batch-preflight.mjs";

const { values } = parseArgs({
  options: {
    spec: { type: "string" },
    specs: { type: "string" },
    model: { type: "string" },
    resolution: { type: "string", default: "2K" },
  },
});
if (values.spec && values.specs) {
  console.error("error: pass --spec or --specs, not both");
  process.exit(2);
}

const rows = [];
const check = (label, ok, detail) => rows.push([ok === "warn" ? "warn" : ok, label, detail]);
const warn = (label, detail) => rows.push(["warn", label, detail]);

const root = universeRoot();
let env;
try {
  env = (await load("config")).loadEnv();
  check("packages built and importable", true, studioRoot());
} catch (err) {
  check("packages built and importable", false, err.message);
}

const model = values.model ?? env?.OPENROUTER_IMAGE_MODEL;
check("image model", Boolean(model), model ?? "unset");

if (values.specs) {
  let specs;
  try {
    specs = readSpecList(values.specs);
    if (!specs.length) throw new Error("spec list is empty");
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(2);
  }
  const { compileSpec, loadRegistry } = await load("universe");
  let capabilities;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/images/models", {
      headers: { Authorization: `Bearer ${apiKey()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const record = ((await res.json()).data ?? []).find((entry) => entry.id === model);
    capabilities = record?.supported_parameters;
    if (!record)
      warn(
        "model listed",
        `${model} not found on /images/models — capability validation unavailable`,
      );
  } catch (err) {
    warn("model capabilities", `lookup failed: ${err.message}`);
  }
  const registry = loadRegistry(root);
  const results = await preflightBatch({
    specs,
    resolution: values.resolution,
    root,
    readSpec,
    compileSpec,
    loadRegistry: () => registry,
    fetchCapabilities: async () => capabilities,
  });
  for (const result of results) {
    console.log(`\n${result.spec}:`);
    for (const item of result.checks) check(`${result.spec}: ${item.label}`, item.ok, item.detail);
  }
  let failed = 0;
  let warned = 0;
  for (const [state, label, detail] of rows) {
    if (state === false) failed += 1;
    if (state === "warn") warned += 1;
    const tag = state === false ? "FAIL" : state === "warn" ? "warn" : "ok  ";
    console.log(`  ${tag} ${label.padEnd(40)} ${detail}`);
  }
  console.log(
    failed === 0
      ? `\n${results.length} specs ready${warned ? ` (${warned} warning(s))` : ""}.`
      : `\n${failed} check(s) failed.`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

// Capabilities come from the images models endpoint: resolution and aspect
// enums are enforced by the provider, so a bad combination fails at request time.
let capabilities;
try {
  const res = await fetch("https://openrouter.ai/api/v1/images/models", {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  const record = ((await res.json()).data ?? []).find((m) => m.id === model);
  capabilities = record?.supported_parameters;
  if (!record) {
    warn("model listed", `${model} not found on /images/models — generation may fail`);
  } else {
    const resolutions = capabilities?.resolution?.values ?? [];
    const aspects = capabilities?.aspect_ratio?.values ?? [];
    check(
      "model listed",
      true,
      `${resolutions.join("/") || "any resolution"}${aspects.length ? `, ${aspects.length} aspect ratios` : ""}`,
    );
  }
} catch (err) {
  warn("model capabilities", `lookup failed: ${err.message}`);
}

let spec;
if (values.spec) {
  const { compileSpec, loadRegistry } = await load("universe");
  try {
    spec = await readSpec(values.spec);
    check("spec valid", true, resolve(values.spec));
  } catch (err) {
    check("spec valid", false, err.message);
  }
  if (spec) {
    const registry = loadRegistry(root);
    check("registry loaded", true, `v${registry.version} from ${root}`);
    try {
      const prompt = compileSpec(spec, registry, root);
      check("spec compiles", true, `${prompt.length} chars`);
    } catch (err) {
      check("spec compiles", false, `${err.code ?? "error"}: ${err.message}`);
    }
    const aspect = spec.master.aspect_ratio;
    const aspects = capabilities?.aspect_ratio?.values;
    if (aspects && !aspects.includes(aspect)) {
      check("spec aspect supported", false, `${aspect} not in ${aspects.join(", ")}`);
    } else {
      check("spec aspect supported", true, aspect);
    }
    const refs = spec.references ?? [];
    const missing = refs.filter((r) => !existsSync(resolve(root, r)));
    if (missing.length) {
      check("reference images present", false, `missing: ${missing.join(", ")}`);
    } else {
      check(
        "reference images present",
        true,
        // Show the full relative path: two characters' plates share a
        // basename (bibles/lucy/identity-plate.png vs bibles/akane/...).
        refs.length
          ? `${refs.length}: ${refs.map((r) => `${r} (${IMAGE_MIME[extname(r).toLowerCase()] ?? "image/png"})`).join(", ")}`
          : "none attached",
      );
    }
  }
} else {
  warn("spec", "not checked (pass --spec to validate a frame spec end to end)");
}

let failed = 0;
let warned = 0;
for (const [state, label, detail] of rows) {
  if (state === false) failed += 1;
  if (state === "warn") warned += 1;
  const tag = state === false ? "FAIL" : state === "warn" ? "warn" : "ok  ";
  console.log(`  ${tag} ${label.padEnd(28)} ${detail}`);
}
console.log(
  failed === 0
    ? `\nimage side ready${warned ? ` (${warned} warning(s))` : ""}.`
    : `\n${failed} check(s) failed.`,
);
process.exit(failed === 0 ? 0 : 1);
