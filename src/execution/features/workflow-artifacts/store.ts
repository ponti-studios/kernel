import { existsSync, readdirSync } from "node:fs";
import { join, normalize, sep } from "node:path";
import { planDetailDirFromPlanPath, planRootPath } from "../commands/lifecycle/artifact_paths";

export interface ResolvedPlanArtifactRef {
  path: string;
  migratedFromLegacySpec: boolean;
}

function extractLegacyBranchName(pathRef: string): string | null {
  const parts = normalize(pathRef).split(sep);
  const specsIndex = parts.lastIndexOf("specs");
  if (specsIndex < 0 || specsIndex + 1 >= parts.length) {
    return null;
  }
  return parts[specsIndex + 1] || null;
}

function canonicalPlanDir(baseDir: string): string {
  return planRootPath(baseDir);
}

function findCanonicalPlanForBranch(baseDir: string, branchName: string): string | null {
  const plansDir = canonicalPlanDir(baseDir);
  if (!existsSync(plansDir)) {
    return null;
  }

  const normalizedBranch = branchName.toLowerCase();
  const matches = readdirSync(plansDir)
    .filter((entry) => entry.endsWith(".md") && entry.toLowerCase().includes(normalizedBranch))
    .sort()
    .reverse();

  if (matches.length === 0) {
    return null;
  }

  return join(plansDir, matches[0]);
}

export function planDetailsDirForPlan(planPath: string): string {
  return planDetailDirFromPlanPath(planPath);
}

export function resolvePlanArtifactRef(baseDir: string, pathRef: string): ResolvedPlanArtifactRef {
  const branchName = extractLegacyBranchName(pathRef);
  if (!branchName) {
    return { path: pathRef, migratedFromLegacySpec: false };
  }

  const mappedCanonical = findCanonicalPlanForBranch(baseDir, branchName);
  if (!mappedCanonical) {
    return { path: pathRef, migratedFromLegacySpec: false };
  }

  return { path: mappedCanonical, migratedFromLegacySpec: true };
}
