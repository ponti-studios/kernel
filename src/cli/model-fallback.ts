import {
  AGENT_MODEL_REQUIREMENTS,
  CATEGORY_MODEL_REQUIREMENTS,
  type FallbackEntry,
} from "../orchestration/agents/model-requirements";
import type { InstallConfig } from "./types";

interface ProviderAvailability {
  native: {
    openai: boolean;
    gemini: boolean;
  };
  opencodeZen: boolean;
  copilot: boolean;
  zai: boolean;
  kimiForCoding: boolean;
}

interface AgentConfig {
  model: string;
  variant?: string;
}

interface CategoryConfig {
  model: string;
  variant?: string;
}

export interface GeneratedOmoConfig {
  $schema: string;
  agents?: Record<string, AgentConfig>;
  categories?: Record<string, CategoryConfig>;
  [key: string]: unknown;
}

const ZAI_MODEL = "zai-coding-plan/glm-4.7";

const ULTIMATE_FALLBACK = "opencode/glm-4.7-free";
const SCHEMA_URL =
  "https://raw.githubusercontent.com/hackefeller/ghostwire/master/assets/ghostwire.schema.json";

function toProviderAvailability(config: InstallConfig): ProviderAvailability {
  return {
    native: {
      openai: config.hasOpenAI,
      gemini: config.hasGemini,
    },
    opencodeZen: config.hasOpencodeZen,
    copilot: config.hasCopilot,
    zai: config.hasZaiCodingPlan,
    kimiForCoding: config.hasKimiForCoding,
  };
}

function isProviderAvailable(provider: string, avail: ProviderAvailability): boolean {
  const mapping: Record<string, boolean> = {
    openai: avail.native.openai,
    google: avail.native.gemini,
    "github-copilot": avail.copilot,
    opencode: avail.opencodeZen,
    "zai-coding-plan": avail.zai,
    "kimi-for-coding": avail.kimiForCoding,
  };
  return mapping[provider] ?? false;
}

function transformModelForProvider(provider: string, model: string): string {
  if (provider === "github-copilot") {
    return model
      .replace("claude-opus-4-5", "claude-opus-4.5")
      .replace("claude-sonnet-4-5", "claude-sonnet-4.5")
      .replace("claude-haiku-4-5", "claude-haiku-4.5")
      .replace("claude-sonnet-4", "claude-sonnet-4");
  }
  return model;
}

function resolveModelFromChain(
  fallbackChain: FallbackEntry[],
  avail: ProviderAvailability,
): { model: string; variant?: string } | null {
  for (const entry of fallbackChain) {
    for (const provider of entry.providers) {
      if (isProviderAvailable(provider, avail)) {
        const transformedModel = transformModelForProvider(provider, entry.model);
        return {
          model: `${provider}/${transformedModel}`,
          variant: entry.variant,
        };
      }
    }
  }
  return null;
}

export function generateModelConfig(config: InstallConfig): GeneratedOmoConfig {
  const avail = toProviderAvailability(config);
  const hasAnyProvider =
    avail.native.openai ||
    avail.native.gemini ||
    avail.opencodeZen ||
    avail.copilot ||
    avail.zai ||
    avail.kimiForCoding;

  if (!hasAnyProvider) {
    return {
      $schema: SCHEMA_URL,
      agents: Object.fromEntries(
        Object.keys(AGENT_MODEL_REQUIREMENTS).map((role) => [role, { model: ULTIMATE_FALLBACK }]),
      ),
      categories: Object.fromEntries(
        Object.keys(CATEGORY_MODEL_REQUIREMENTS).map((cat) => [cat, { model: ULTIMATE_FALLBACK }]),
      ),
    };
  }

  const agents: Record<string, AgentConfig> = {};
  const categories: Record<string, CategoryConfig> = {};

  for (const [role, req] of Object.entries(AGENT_MODEL_REQUIREMENTS)) {
    if (role === "research") {
      if (avail.zai) {
        agents[role] = { model: ZAI_MODEL };
        continue;
      }
      if (avail.opencodeZen) {
        agents[role] = { model: "opencode/claude-haiku-4-5" };
        continue;
      }
      if (avail.copilot) {
        agents[role] = { model: "github-copilot/gpt-5-mini" };
        continue;
      }
      if (avail.native.openai || avail.native.gemini) {
        agents[role] = { model: "opencode/gpt-5-nano" };
        continue;
      }
    }

    const fallbackChain = req.fallbackChain;

    const resolved = resolveModelFromChain(fallbackChain, avail);
    if (resolved) {
      const variant = resolved.variant ?? req.variant;
      agents[role] = variant ? { model: resolved.model, variant } : { model: resolved.model };
    } else {
      agents[role] = { model: ULTIMATE_FALLBACK };
    }
  }

  for (const [cat, req] of Object.entries(CATEGORY_MODEL_REQUIREMENTS)) {
    // Use the standard fallback chain
    const fallbackChain = req.fallbackChain;

    const resolved = resolveModelFromChain(fallbackChain, avail);
    if (resolved) {
      const variant = resolved.variant ?? req.variant;
      categories[cat] = variant ? { model: resolved.model, variant } : { model: resolved.model };
    } else {
      categories[cat] = { model: ULTIMATE_FALLBACK };
    }
  }

  return {
    $schema: SCHEMA_URL,
    agents,
    categories,
  };
}

export function shouldShowChatGPTOnlyWarning(config: InstallConfig): boolean {
  return !config.hasGemini && config.hasOpenAI;
}
