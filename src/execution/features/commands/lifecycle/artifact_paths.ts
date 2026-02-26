import { basename, dirname, join } from "node:path";

export const PLAN_ROOT_DIR = ".ghostwire/plans";
export const LEGACY_SPEC_ROOT_DIR = ".ghostwire/specs";

export function planRootPath(baseDir: string): string {
  return join(baseDir, PLAN_ROOT_DIR);
}

export function legacySpecRootPath(baseDir: string): string {
  return join(baseDir, LEGACY_SPEC_ROOT_DIR);
}

export function planDetailDirFromPlanPath(planPath: string): string {
  const planFileName = basename(planPath);
  const planId = planFileName.endsWith("-plan.md")
    ? planFileName.slice(0, -8)
    : planFileName.replace(/\.md$/, "");
  return join(dirname(planPath), planId);
}
