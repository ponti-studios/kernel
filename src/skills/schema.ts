import { z } from "zod";
// import type { Skill } from "./types"; // unused

// Name pattern allows lowercase letters, digits and hyphens, must start with a letter.
// Examples: agent-browser, frontend-ui-ux, git-master
const SKILL_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

export const skillSchema = z.object({
  name: z.string().min(1).regex(SKILL_NAME_PATTERN, {
    message:
      "name must start with a lowercase letter and contain only lowercase letters, digits, and hyphens",
  }),
  description: z.string().min(1).max(2000),
  template: z.string().min(1),
  license: z.string().optional(),
  compatibility: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  allowedTools: z.array(z.string()).optional(),
  agent: z.string().optional(),
  model: z.string().optional(),
  subtask: z.boolean().optional(),
  argumentHint: z.string().optional(),
  mcpConfig: z.object().optional(),
});

export type SkillSpec = z.infer<typeof skillSchema>;

export function validateSkill(candidate: unknown) {
  return skillSchema.safeParse(candidate);
}

export function validateSkillList(candidates: unknown[]): Array<{
  index: number;
  skill: SkillSpec | null;
  isValid: boolean;
  errors: string[];
}> {
  return candidates.map((candidate, index) => {
    const result = validateSkill(candidate);
    if (result.success) {
      return { index, skill: result.data, isValid: true, errors: [] };
    } else {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return { index, skill: null, isValid: false, errors };
    }
  });
}

export function detectDuplicateSkillNames(
  specs: SkillSpec[],
): Array<{ name: string; indices: number[] }> {
  const seen = new Map<string, number[]>();
  specs.forEach((spec, index) => {
    if (!seen.has(spec.name)) {
      seen.set(spec.name, []);
    }
    seen.get(spec.name)!.push(index);
  });

  return Array.from(seen.entries())
    .filter(([, indices]) => indices.length > 1)
    .map(([name, indices]) => ({ name, indices }));
}

/**
 * Deterministic serialization used for snapshot tests and digest calculations.
 */
export function serializeSkill(spec: SkillSpec): string {
  const sorted: Record<string, unknown> = {
    name: spec.name,
    description: spec.description,
    template: spec.template,
  };

  if (spec.allowedTools) sorted.allowedTools = [...spec.allowedTools].sort();
  if (spec.agent) sorted.agent = spec.agent;
  if (spec.model) sorted.model = spec.model;
  if (spec.subtask !== undefined) sorted.subtask = spec.subtask;
  if (spec.argumentHint) sorted.argumentHint = spec.argumentHint;
  if (spec.mcpConfig) sorted.mcpConfig = spec.mcpConfig;
  if (spec.metadata) sorted.metadata = spec.metadata;
  if (spec.license) sorted.license = spec.license;
  if (spec.compatibility) sorted.compatibility = spec.compatibility;

  return JSON.stringify(sorted);
}

export async function digestSkill(spec: SkillSpec): Promise<string> {
  const serialized = serializeSkill(spec);
  const encoded = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
