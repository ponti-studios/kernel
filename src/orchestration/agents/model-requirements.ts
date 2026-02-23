/**
 * @deprecated This file is DEPRECATED.
 * 
 * Model configuration has moved to ghostwire.json config files:
 * - Global: ~/.config/opencode/ghostwire.json
 * - Project: .opencode/ghostwire.json
 * 
 * This file is kept for backward compatibility but will be removed in a future version.
 * 
 * To update models:
 * 1. Edit ghostwire.json with your model preferences
 * 2. Or run: ghostwire sync-models to update global config with defaults
 * 
 * The new configuration system supports:
 * - Agent-specific model overrides
 * - Category-specific model overrides with variants
 * - Hierarchical config (project overrides global)
 * - Sensible defaults (opencode/kimi-k2.5)
 */

export type FallbackEntry = {
  providers: string[];
  model: string;
  variant?: string; // Entry-specific variant (e.g., GPT→high, Opus→max)
};

export type ModelRequirement = {
  fallbackChain: FallbackEntry[];
  variant?: string; // Default variant (used when entry doesn't specify one)
  requiresModel?: string; // If set, only activates when this model is available (fuzzy match)
};

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  operator: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  executor: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "advisor-plan": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "researcher-data": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "researcher-codebase": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "analyzer-media": {
    // EXCEPTION: Keep gemini-3-flash for vision capabilities
    fallbackChain: [
      {
        providers: ["google", "github-copilot", "opencode"],
        model: "gemini-3-flash",
      },
    ],
  },
  planner: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "advisor-strategy": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "validator-audit": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  orchestrator: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  "visual-engineering": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  ultrabrain: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "max",
      },
    ],
  },
  deep: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "medium",
      },
    ],
  },
  artistry: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  quick: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "unspecified-low": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "unspecified-high": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "max",
      },
    ],
  },
  writing: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};
