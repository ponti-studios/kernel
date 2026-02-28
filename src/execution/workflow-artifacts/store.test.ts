import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolvePlanArtifactRef } from "./store";

describe("resolvePlanArtifactRef", () => {
  test("maps legacy spec plan path to canonical plan path when available", () => {
    const baseDir = mkdtempSync(join(tmpdir(), "gw-artifacts-"));
    const plansDir = join(baseDir, "docs", "plans");
    const specsDir = join(baseDir, "docs", "specs", "feature-auth");
    mkdirSync(plansDir, { recursive: true });
    mkdirSync(specsDir, { recursive: true });

    const canonicalPlan = join(plansDir, "2026-02-26-feature-auth-plan.md");
    writeFileSync(canonicalPlan, "# plan", "utf-8");

    const legacyPath = join(specsDir, "plan.md");
    const resolved = resolvePlanArtifactRef(baseDir, legacyPath);

    expect(resolved.path).toBe(canonicalPlan);
    expect(resolved.migratedFromLegacySpec).toBe(true);
  });

  test("returns original path when no canonical mapping exists", () => {
    const baseDir = mkdtempSync(join(tmpdir(), "gw-artifacts-"));
    const specsDir = join(baseDir, "docs", "specs", "feature-auth");
    mkdirSync(specsDir, { recursive: true });

    const legacyPath = join(specsDir, "plan.md");
    const resolved = resolvePlanArtifactRef(baseDir, legacyPath);

    expect(resolved.path).toBe(legacyPath);
    expect(resolved.migratedFromLegacySpec).toBe(false);
  });
});
