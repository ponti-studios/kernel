import type { AgentConfig as SDKAgentConfig } from "@opencode-ai/sdk";
export type AgentConfig = SDKAgentConfig;

/**
 * Agent mode determines UI model selection behavior:
 * - "primary": Respects user's UI-selected model (cipherOperator, nexusOrchestrator)
 * - "subagent": Uses own fallback chain, ignores UI selection (advisorPlan, researcher-codebase, etc.)
 * - "all": Available in both contexts (OpenCode compatibility)
 */
export type AgentMode = "primary" | "subagent" | "all";

/**
 * Agent factory function with static mode property.
 * Mode is exposed as static property for pre-instantiation access.
 */
export type AgentFactory = ((model: string) => AgentConfig) & {
  mode: AgentMode;
};

/**
 * Agent category for grouping in operator prompt sections
 */
export type AgentCategory =
  | "exploration"
  | "specialist"
  | "advisor"
  | "utility"
  | "review"
  | "research"
  | "design"
  | "workflow"
  | "documentation";

/**
 * Cost classification for Tool Selection table
 */
export type AgentCost = "FREE" | "CHEAP" | "EXPENSIVE" | "LOW" | "MODERATE" | "HIGH";

/**
 * Delegation trigger for operator prompt's Delegation Table
 */
export interface DelegationTrigger {
  /** Domain of work (e.g., "Frontend UI/UX") */
  domain: string;
  /** When to delegate (e.g., "Visual changes only...") */
  trigger: string;
}

/**
 * Metadata for generating operator prompt sections dynamically
 * This allows adding/removing agents without manually updating the operator prompt
 */
export interface AgentPromptMetadata {
  /** Category for grouping in prompt sections */
  category: AgentCategory;

  /** Cost classification for Tool Selection table */
  cost: AgentCost;

  /** Domain triggers for Delegation Table */
  triggers: DelegationTrigger[];

  /** When to use this agent (for detailed sections) */
  useWhen?: string[];

  /** When NOT to use this agent */
  avoidWhen?: string[];

  /** Optional dedicated prompt section (markdown) - for agents like Advisor Plan that have special sections */
  dedicatedSection?: string;

  /** Nickname/alias used in prompt (e.g., "Advisor Plan" instead of "advisor-plan") */
  promptAlias?: string;

  /** Key triggers that should appear in Phase 0 (e.g., "External library mentioned → fire researcher-data") */
  keyTrigger?: string;
}

export function isGptModel(model: string): boolean {
  return model.startsWith("openai/") || model.startsWith("github-copilot/gpt-");
}

export type BuiltinAgentName = string;

export type OverridableAgentName = "build" | BuiltinAgentName;

export type AgentName = BuiltinAgentName;

export type AgentOverrideConfig = Partial<AgentConfig> & {
  prompt_append?: string;
  variant?: string;
};

export type AgentOverrides = Partial<Record<OverridableAgentName, AgentOverrideConfig>>;
