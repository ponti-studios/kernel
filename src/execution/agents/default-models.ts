// This module holds the hard‑coded model requirements that were previously
// scattered across the codebase.  These values represent the fallback chains
// used during model resolution when no explicit configuration is provided.
//
// Consumers should avoid reaching into the raw objects; instead they should use
// the helper functions exported here.  Eventually the entire module will go
// away once configuration completely replaces the static defaults.

export type FallbackEntry = {
  providers: string[];
  model: string;
  variant?: string;
};

export type ModelRequirement = {
  fallbackChain: FallbackEntry[];
  variant?: string;
  requiresModel?: string;
};

// --- static data ------------------------------------------------------------

const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  do: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  research: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};

const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
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

// --- public helpers ---------------------------------------------------------

/**
 * Return the requirement object used for a given agent.  If the agent is
 * unknown, `undefined` is returned.
 */
export function getAgentModelRequirement(
  agent: string,
): ModelRequirement | undefined {
  return AGENT_MODEL_REQUIREMENTS[agent];
}

/**
 * Return the requirement object used for a given category name.  `undefined`
 * when the category doesn't exist.
 */
export function getCategoryModelRequirement(
  category: string,
): ModelRequirement | undefined {
  return CATEGORY_MODEL_REQUIREMENTS[category];
}

// Expose the raw data only for legacy callers that still need to iterate.
export { AGENT_MODEL_REQUIREMENTS, CATEGORY_MODEL_REQUIREMENTS };
