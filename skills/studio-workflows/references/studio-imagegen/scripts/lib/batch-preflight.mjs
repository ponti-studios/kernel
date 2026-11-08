import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";

export function readSpecList(path) {
  const source = readFileSync(path, "utf8");
  try {
    const parsed = JSON.parse(source);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function preflightBatch({
  specs,
  resolution = "2K",
  root,
  readSpec,
  compileSpec,
  loadRegistry,
  fetchCapabilities,
}) {
  const capabilities = await fetchCapabilities();
  const registry = loadRegistry(root);
  const results = [];
  for (const path of specs) {
    const result = { spec: path, checks: [], ok: true };
    const check = (label, valid, detail) => {
      result.checks.push({ label, ok: valid, detail });
      if (!valid) result.ok = false;
    };
    let spec;
    try {
      spec = await readSpec(path);
      check("spec valid", true, resolve(path));
    } catch (error) {
      check("spec valid", false, error.message);
    }
    if (spec) {
      try {
        compileSpec(spec, registry, root);
        check("spec compiles", true, "compiled");
      } catch (error) {
        check("spec compiles", false, `${error.code ?? "error"}: ${error.message}`);
      }
      const aspect = spec.master?.aspect_ratio;
      const supportedAspects = capabilities?.aspect_ratio?.values;
      check(
        "aspect supported",
        !supportedAspects || supportedAspects.includes(aspect),
        !supportedAspects || supportedAspects.includes(aspect)
          ? aspect
          : `${aspect} not in ${supportedAspects.join(", ")}`,
      );
      const supportedResolutions = capabilities?.resolution?.values;
      check(
        "resolution supported",
        !supportedResolutions || supportedResolutions.includes(resolution),
        !supportedResolutions || supportedResolutions.includes(resolution)
          ? resolution
          : `${resolution} not in ${supportedResolutions.join(", ")}`,
      );
      const refs = spec.references ?? [];
      const missing = refs.filter((ref) => !existsSync(resolve(root, ref)));
      check(
        "references present",
        missing.length === 0,
        missing.length
          ? `missing: ${missing.join(", ")}`
          : refs.length
            ? refs.map((ref) => `${ref} (${extname(ref)})`).join(", ")
            : "none",
      );
    }
    results.push(result);
  }
  return results;
}
