// Central entry point for the opencode skill loader subsystem.
//
// Consumers used to import directly from individual implementation files
// like `loader.ts`, `merger.ts` or `skill-content.ts`.  That worked fine
// until we started factoring the subsystem in #001-simplify-agent-framework.
// Once we had a stable, canonical discovery pipeline there suddenly were a
// lot of different import paths sprinkled throughout the repo.  The
// original refactor plan called for a single index file that re‑exports the
// public API surface; this file never made it into the repo and a bunch of
// errors popped up as soon as the module path stopped resolving.  This
// module repairs that by offering one directory-level entry point with
// everything external code needs.
//
// The exported surface is intentionally broader than what the current
// consumers require.  We re-export everything from the submodules so that
// future code can simply `import { foo } from "../opencode-skill-loader"`
// without having to know where `foo` lives internally.  We also implement
// two small orchestration helpers used by tests and runtime initialization:
// `resolveScopedSkillsCanonical` and `discoverSharedPipelineSkills`.


// helper wrappers used by higher‑level callers (cli export, plugin init,
// integration tests, etc)

import type { EnumerateScopedSourcesOptions } from "./loader";
import type { ScopedSkillSource } from "./types";
import { discoverScopedAgentSkills } from "./loader";
import { resolveDeterministicSkillsFirstWins } from "./merger";
import { createSkillResolutionDigest } from "./skill-content";
import type { LoadedSkill, SkillCollisionDiagnostic } from "./types";

export type ResolveScopedSkillsOptions = EnumerateScopedSourcesOptions;

/**
 * Run the canonical discovery pipeline and return detailed resolution
 * information.  The caller can inspect the `skills` array directly or
 * examine the `collisions` list for diagnostics; the digest can be used in
 * snapshot tests to detect unexpected changes.
 */
export async function resolveScopedSkillsCanonical(
  options: ResolveScopedSkillsOptions = {},
): Promise<{
  sources: ScopedSkillSource[];
  skills: LoadedSkill[];
  collisions: SkillCollisionDiagnostic[];
  resolutionDigest: string;
}> {
  const { sources, skills } = await discoverScopedAgentSkills(options);
  const { skills: resolvedSkills, collisions } = resolveDeterministicSkillsFirstWins(skills);
  const resolutionDigest = createSkillResolutionDigest(resolvedSkills);
  return { sources, skills: resolvedSkills, collisions, resolutionDigest };
}

/**
 * Consumer-facing helper used by the shared pipeline.  "Shared" means
 * runtime init, export, and config composition all use the same list of
 * scoped skills; nothing in the public API should ever walk the filesystem
 * directly.
 */
export async function discoverSharedPipelineSkills(
  options: ResolveScopedSkillsOptions = {},
): Promise<LoadedSkill[]> {
  const canonical = await resolveScopedSkillsCanonical(options);
  return canonical.skills;
}

// re-export utilities for external consumers (tests, CLI, runtime)
export { mergeSkills } from "./merger";
