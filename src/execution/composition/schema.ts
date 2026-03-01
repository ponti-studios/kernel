import { z } from "zod";

/**
 * Zod Schema for canonical ExecutionPlan
 *
 * Fully-resolved execution plan combining intent + profile + asset + tools.
 * Each plan:
 * - Binds a CommandIntentSpec to an AgentProfileSpec
 * - Resolves tool policies to concrete permissions
 * - Includes prompt asset for LLM context
 * - Carries metadata for adapter-specific behavior
 * - Is host-agnostic (Claude Code, Codex, Copilot-ready)
 *
 * Completes → Phase 1.4 Deliverable: Canonical execution composition contract
 */

/**
 * Resolved tool access permissions for this execution plan
 * Keys: tool names, values: permission models
 */
const EXECUTION_TOOLS = [
  "read",
  "search",
  "edit",
  "bash",
  "web",
  "delegate_task",
  "look_at",
  "task",
] as const;

export type ExecutionTool = (typeof EXECUTION_TOOLS)[number];

/**
 * ID pattern: canonical reference format
 * Format: <command-id>::<profile-id>::<asset-id>
 */
const EXECUTION_PLAN_ID_PATTERN = /^[a-z0-9][a-z0-9:_-]*::[a-z0-9][a-z0-9_-]*::[a-z0-9][a-z0-9-]*$/;

export const executionPlanSchema = z.object({
  id: z
    .string()
    .regex(EXECUTION_PLAN_ID_PATTERN, {
      message: "id must follow format: command-id::profile-id::asset-id",
    })
    .describe("Canonical reference combining intent + profile + asset"),
  commandId: z.string().min(1).describe("Referenced CommandIntentSpec id"),
  profileId: z.string().min(1).describe("Referenced AgentProfileSpec id"),
  assetId: z.string().min(1).describe("Referenced PromptAsset id (asset version not included)"),
  route: z.enum(["do", "research"]).describe("Execution route from profile"),
  resolvedTools: z
    .record(
      z.enum(EXECUTION_TOOLS as readonly [ExecutionTool, ...ExecutionTool[]]),
      z.enum(["granted", "denied", "conditional"]),
    )
    .describe("Tool access permissions: granted | denied | conditional"),
  promptContent: z
    .string()
    .min(10)
    .describe("Full prompt text (intent + profile + asset combined)"),
  args: z.unknown().optional().describe("Command arguments from intent"),
  metadata: z
    .object({
      adapterHints: z.record(z.string(), z.unknown()).optional(),
      executionContext: z.record(z.string(), z.unknown()).optional(),
      retryPolicy: z
        .object({
          maxRetries: z.number().min(0),
          backoffMs: z.number().min(0),
        })
        .optional(),
    })
    .optional()
    .describe("Adapter-specific execution metadata"),
  createdAt: z.string().datetime().describe("ISO 8601 timestamp when plan was created"),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .describe("Optional expiration time for plan validity"),
});

export type ExecutionPlan = z.infer<typeof executionPlanSchema> & {
  immutable?: boolean;
};

/**
 * Single execution plan validation
 */
export function validateExecutionPlan(
  candidate: unknown,
): ReturnType<typeof executionPlanSchema.safeParse> {
  return executionPlanSchema.safeParse(candidate);
}

/**
 * Batch validation with per-error diagnostics
 */
export function validateExecutionPlanList(candidates: unknown[]): Array<{
  index: number;
  plan: ExecutionPlan | null;
  isValid: boolean;
  errors: string[];
}> {
  return candidates.map((candidate, index) => {
    const result = validateExecutionPlan(candidate);
    if (result.success) {
      return { index, plan: result.data, isValid: true, errors: [] };
    } else {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return { index, plan: null, isValid: false, errors };
    }
  });
}

/**
 * Detect duplicate execution plan IDs
 * Same composition should not appear twice in plan list
 */
export function detectDuplicateExecutionPlanIds(
  plans: ExecutionPlan[],
): Array<{ id: string; indices: number[] }> {
  const seen = new Map<string, number[]>();
  plans.forEach((plan, index) => {
    if (!seen.has(plan.id)) {
      seen.set(plan.id, []);
    }
    seen.get(plan.id)!.push(index);
  });

  return Array.from(seen.entries())
    .filter(([, indices]) => indices.length > 1)
    .map(([id, indices]) => ({ id, indices }));
}

/**
 * Deterministic JSON serialization for snapshot testing
 * - Sorts keys alphabetically
 * - Preserves metadata structure
 * - Stable across tool invocations
 */
export function serializeExecutionPlan(plan: ExecutionPlan): string {
  const sorted = {
    args: plan.args,
    assetId: plan.assetId,
    commandId: plan.commandId,
    createdAt: plan.createdAt,
    expiresAt: plan.expiresAt,
    id: plan.id,
    metadata: plan.metadata,
    profileId: plan.profileId,
    promptContent: plan.promptContent,
    resolvedTools: plan.resolvedTools,
    route: plan.route,
  };
  return JSON.stringify(sorted);
}

/**
 * SHA-256 digest for execution plan integrity verification
 */
export async function digestExecutionPlan(plan: ExecutionPlan): Promise<string> {
  const serialized = serializeExecutionPlan(plan);
  const encoded = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Check if execution plan is still valid (not expired)
 */
export function isExecutionPlanValid(plan: ExecutionPlan): boolean {
  if (!plan.expiresAt) return true;
  const now = new Date();
  const expiry = new Date(plan.expiresAt);
  return now < expiry;
}

/**
 * Verify tool is accessible in this execution plan
 */
export function canAccessTool(plan: ExecutionPlan, tool: ExecutionTool): boolean {
  const permission = plan.resolvedTools[tool];
  return permission === "granted" || permission === "conditional";
}

/**
 * Count granted tools in plan
 */
export function countGrantedTools(plan: ExecutionPlan): number {
  return Object.values(plan.resolvedTools).filter((p) => p === "granted").length;
}
