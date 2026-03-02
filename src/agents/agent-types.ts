import type { AgentConfig as SDKAgentConfig } from "@opencode-ai/sdk";
import type {
  AgentMode,
  AgentCategory,
  AgentCost,
  DelegationTrigger,
  AgentPromptMetadata,
} from "./schema/metadata";

export type AgentConfig = SDKAgentConfig;

/**
 * Agent factory function with static mode property.
 * Mode is exposed as static property for pre-instantiation access.
 */
export type AgentFactory = ((model: string) => AgentConfig) & {
  mode: AgentMode;
};

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
