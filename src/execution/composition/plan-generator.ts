/**
 * ExecutionPlan Catalog Generator
 *
 * Generates deterministic ExecutionPlan catalog by composing:
 * - CommandIntentSpec (what to do)
 * - AgentProfileSpec (who does it)
 * - PromptAsset (how to do it)
 *
 * Produces fully-resolved execution plans with:
 * - Tool access control policy
 * - Deterministic prompt composition
 * - Expiration metadata
 * - Conformance snapshots
 */

import {
  validateExecutionPlanList,
  detectDuplicatePlanIds,
  serializeExecutionPlan,
  digestExecutionPlan,
  type ExecutionPlan,
} from "./schema";
import type { CommandIntentSpec } from "../intents";
import type { AgentProfileSpec } from "../../agents";
import type { PromptAsset } from "../assets";

/**
 * Specification for composing an ExecutionPlan
 */
export interface PlanComposition {
  commandId: string;
  profileId: string;
  assetId: string;
}

/**
 * Catalog of resolved ExecutionPlans indexed by ID
 */
export interface ExecutionPlanCatalog {
  plans: Record<string, ExecutionPlan>;
  metadata: {
    totalCount: number;
    byCommand: Record<string, number>;
    byProfile: Record<string, number>;
    byRoute: Record<string, number>;
    toolGrantCounts: Record<string, number>;
    validationTimestamp: string;
    digest: string;
  };
}

/**
 * Generate execution plan catalog from command, agent, and asset definitions.
 *
 * For each (command, agent) pair, creates a fully resolved ExecutionPlan with:
 * - ID: command::profile::asset
 * - Tool access control based on profile's tool set
 * - Prompt composition from asset + command description
 * - Expiration metadata (1 hour TTL by default)
 *
 * @param compositions Array of {commandId, profileId, assetId} tuples
 * @param commands Map of command ID -> CommandIntentSpec
 * @param agents Map of profile ID -> AgentProfileSpec
 * @param assets Map of asset ID -> PromptAsset
 * @returns Validated and indexed execution plan catalog
 * @throws Error if validation fails or composites are invalid
 */
export async function generateExecutionPlanCatalog(
  compositions: PlanComposition[],
  commands: Record<string, CommandIntentSpec>,
  agents: Record<string, AgentProfileSpec>,
  assets: Record<string, PromptAsset>,
): Promise<ExecutionPlanCatalog> {
  const plans: ExecutionPlan[] = [];
  const errors: string[] = [];

  // Step 1: Compose all plans
  for (const { commandId, profileId, assetId } of compositions) {
    const command = commands[commandId];
    const agent = agents[profileId];
    const asset = assets[assetId];

    if (!command) {
      errors.push(`Command not found: ${commandId}`);
      continue;
    }
    if (!agent) {
      errors.push(`Agent not found: ${profileId}`);
      continue;
    }
    if (!asset) {
      errors.push(`Asset not found: ${assetId}`);
      continue;
    }

    // Resolve tool access control based on agent's tools
    const resolvedTools: Record<string, "granted" | "denied" | "conditional"> = {};
    const AVAILABLE_TOOLS = [
      "read",
      "search",
      "edit",
      "bash",
      "web",
      "delegate_task",
      "look_at",
      "task",
    ];

    for (const tool of AVAILABLE_TOOLS) {
      if (agent.tools.includes(tool as any)) {
        resolvedTools[tool] = "granted";
      } else {
        resolvedTools[tool] = "denied";
      }
    }

    // Compose prompt content
    const promptContent = `# ${command.description}\n\n${asset.content}`;

    // Create execution plan
    const plan: ExecutionPlan = {
      id: `${commandId}::${profileId}::${assetId}`,
      commandId,
      profileId,
      assetId,
      route: agent.route,
      resolvedTools,
      promptContent,
      args: command.argsSchema as any,
      metadata: {
        commandDescription: command.description,
        agentRole: agent.role,
        acceptanceChecks: command.acceptanceChecks,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour TTL
    };

    plans.push(plan);
  }

  if (errors.length > 0) {
    throw new Error(`Failed to compose execution plans:\n${errors.join("\n")}`);
  }

  // Step 2: Validate all plans
  const validation = validateExecutionPlanList(plans);

  if (validation.errors.length > 0) {
    const errorSummary = validation.errors
      .map((err) => `[index ${err.index}] ${err.message}`)
      .join("\n");
    throw new Error(`Execution plan validation failed:\n${errorSummary}`);
  }

  const validatedPlans = validation.valid;

  // Step 3: Detect duplicates
  const duplicates = detectDuplicatePlanIds(validatedPlans);

  if (duplicates.length > 0) {
    const dupSummary = duplicates
      .map((dup) => `${dup.id} (indices: ${dup.indices.join(", ")})`)
      .join("\n");
    throw new Error(`Duplicate execution plan IDs detected:\n${dupSummary}`);
  }

  // Step 4: Build indexed catalog
  const planIndex: Record<string, ExecutionPlan> = {};
  const byCommand: Record<string, number> = {};
  const byProfile: Record<string, number> = {};
  const byRoute: Record<string, number> = {};
  const toolGrantCounts: Record<string, number> = {};

  for (const plan of validatedPlans.sort((a, b) => a.id.localeCompare(b.id))) {
    planIndex[plan.id] = plan;

    // Count by command
    byCommand[plan.commandId] = (byCommand[plan.commandId] || 0) + 1;

    // Count by profile
    byProfile[plan.profileId] = (byProfile[plan.profileId] || 0) + 1;

    // Count by route
    byRoute[plan.route] = (byRoute[plan.route] || 0) + 1;

    // Count tool grants
    for (const [tool, access] of Object.entries(plan.resolvedTools)) {
      if (access === "granted") {
        toolGrantCounts[tool] = (toolGrantCounts[tool] || 0) + 1;
      }
    }
  }

  // Step 5: Compute catalog digest
  const catalogJson = JSON.stringify(
    {
      plans: Object.keys(planIndex)
        .sort()
        .map((id) => serializeExecutionPlan(planIndex[id])),
      timestamp: new Date().toISOString(),
    },
    null,
    2,
  );

  const catalogDigest = await digestCatalogJson(catalogJson);

  return {
    plans: planIndex,
    metadata: {
      totalCount: validatedPlans.length,
      byCommand,
      byProfile,
      byRoute,
      toolGrantCounts,
      validationTimestamp: new Date().toISOString(),
      digest: catalogDigest,
    },
  };
}

/**
 * Compute SHA-256 digest of catalog JSON
 */
async function digestCatalogJson(json: string): Promise<string> {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    const encoder = new TextEncoder();
    const data = encoder.encode(json);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return "digest-not-available";
}

/**
 * Look up an execution plan by ID
 */
export function lookupPlanById(
  catalog: ExecutionPlanCatalog,
  planId: string,
): ExecutionPlan | undefined {
  return catalog.plans[planId];
}

/**
 * Get all execution plans for a command
 */
export function getPlansByCommand(
  catalog: ExecutionPlanCatalog,
  commandId: string,
): ExecutionPlan[] {
  const result = [];
  for (const plan of Object.values(catalog.plans)) {
    if (plan.commandId === commandId) {
      result.push(plan);
    }
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Get all execution plans for a profile
 */
export function getPlansByProfile(
  catalog: ExecutionPlanCatalog,
  profileId: string,
): ExecutionPlan[] {
  const result = [];
  for (const plan of Object.values(catalog.plans)) {
    if (plan.profileId === profileId) {
      result.push(plan);
    }
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Get all execution plans for a runtime route
 */
export function getPlansByRoute(catalog: ExecutionPlanCatalog, route: string): ExecutionPlan[] {
  const result = [];
  for (const plan of Object.values(catalog.plans)) {
    if (plan.route === route) {
      result.push(plan);
    }
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Get execution plans that grant a specific tool
 */
export function getPlansByTool(catalog: ExecutionPlanCatalog, tool: string): ExecutionPlan[] {
  const result = [];
  for (const plan of Object.values(catalog.plans)) {
    if (plan.resolvedTools[tool] === "granted") {
      result.push(plan);
    }
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Serialize execution plan catalog for JSON export
 */
export function serializeExecutionPlanCatalog(catalog: ExecutionPlanCatalog): string {
  return JSON.stringify(
    {
      metadata: catalog.metadata,
      plans: Object.keys(catalog.plans)
        .sort()
        .map((id) => serializeExecutionPlan(catalog.plans[id])),
    },
    null,
    2,
  );
}

/**
 * Validate catalog against snapshot digest
 */
export function validateCatalogDigest(
  catalog: ExecutionPlanCatalog,
  expectedDigest: string,
): { valid: boolean; reason?: string } {
  if (catalog.metadata.digest === expectedDigest) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Digest mismatch: expected ${expectedDigest}, got ${catalog.metadata.digest}`,
  };
}
