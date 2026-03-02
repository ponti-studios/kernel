import { z } from "zod";

/**
 * Zod Schema for canonical AgentSpec
 *
 * Each agent spec:
 * - Has strict ID format (lowercase + underscore separators only)
 * - Defines single runtime route (do | research)
 * - Enumerates required tools with strict set
 * - Lists acceptance checks for completion validation
 * - References default command this profile typically executes
 * - Includes immutable prompt text for deployment
 * - Optional lifecycle hints for adapter-specific behavior
 *
 * Completes → Phase 1.2 Deliverable: canonical agent specs for all 39 profiles
 */

const VALID_TOOLS = [
  "read",
  "search",
  "edit",
  "bash",
  "web",
  "delegate_task",
  "look_at",
  "task",
] as const;

export type RuntimeRoute = "do" | "research";
export type ValidTool = (typeof VALID_TOOLS)[number];

/**
 * ID pattern: lowercase start, followed by lowercase/digits/underscores
 * Examples: advisor_architecture, reviewer_typescript, validator_audit
 * Rejects: AdvisorArchitecture, advisor-architecture, 123invalid
 */
const PROFILE_ID_PATTERN = /^[a-z][a-z0-9_]*$/;

export const agentSpecSchema = z.object({
  id: z.string().min(1).regex(PROFILE_ID_PATTERN, {
    message:
      "id must start with lowercase letter, contain only lowercase letters, digits, and underscores",
  }),
  intent: z.string().min(10).max(500),
  role: z
    .string()
    .min(1)
    .max(100)
    .describe("Role classification: Reviewer, Planner, Architect, etc."),
  route: z.enum(["do", "research"]),
  tools: z
    .array(z.enum(VALID_TOOLS as readonly [ValidTool, ...ValidTool[]]))
    .min(1)
    .describe("Required tools for this profile to execute"),
  acceptanceChecks: z
    .array(z.string().min(1).max(200))
    .min(1)
    .describe("Measurable completion criteria for this profile"),
  defaultCommand: z.string().min(1),
  promptAppend: z
    .string()
    .min(10)
    .max(2000)
    .describe("Immutable prompt text appended during execution"),
  lifecycleHints: z.unknown().optional().describe("Adapter-specific behavior hints"),
});

export type AgentSpec = z.infer<typeof agentSpecSchema>;

/**
 * Single profile validation with detailed error diagnostics
 */
export function validateAgentSpec(
  candidate: unknown,
): ReturnType<typeof agentSpecSchema.safeParse> {
  return agentSpecSchema.safeParse(candidate);
}

/**
 * Batch validation with per-error diagnostics
 * Returns array of { index, spec, errors }
 */
export function validateAgentSpecList(candidates: unknown[]): Array<{
  index: number;
  spec: AgentSpec | null;
  isValid: boolean;
  errors: string[];
}> {
  return candidates.map((candidate, index) => {
    const result = validateAgentSpec(candidate);
    if (result.success) {
      return { index, spec: result.data, isValid: true, errors: [] };
    } else {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return { index, spec: null, isValid: false, errors };
    }
  });
}

/**
 * Detect duplicate profile IDs
 * Returns array of collisions: { id, indices }
 */
export function detectDuplicateAgentIds(
  specs: AgentSpec[],
): Array<{ id: string; indices: number[] }> {
  const seen = new Map<string, number[]>();
  specs.forEach((spec, index) => {
    if (!seen.has(spec.id)) {
      seen.set(spec.id, []);
    }
    seen.get(spec.id)!.push(index);
  });

  return Array.from(seen.entries())
    .filter(([, indices]) => indices.length > 1)
    .map(([id, indices]) => ({ id, indices }));
}

/**
 * Deterministic JSON serialization for snapshot testing
 * - Sorts keys alphabetically
 * - Ensures consistent spacing
 * - Stable across tool invocations
 */
export function serializeAgentSpec(spec: AgentSpec): string {
  const sorted = {
    acceptanceChecks: spec.acceptanceChecks,
    defaultCommand: spec.defaultCommand,
    id: spec.id,
    intent: spec.intent,
    lifecycleHints: spec.lifecycleHints,
    promptAppend: spec.promptAppend,
    role: spec.role,
    route: spec.route,
    tools: spec.tools.sort(), // Stable tool ordering
  };
  return JSON.stringify(sorted);
}

/**
 * SHA-256 digest for snapshot verification
 * Both agent specs can be compared by digest to detect material changes
 */
export async function digestAgentSpec(spec: AgentSpec): Promise<string> {
  const serialized = serializeAgentSpec(spec);
  const encoded = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
