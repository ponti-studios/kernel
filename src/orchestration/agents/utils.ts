import type { AgentConfig } from "@opencode-ai/sdk";
import type {
  BuiltinAgentName,
  AgentOverrideConfig,
  AgentOverrides,
  AgentFactory,
  AgentPromptMetadata,
} from "./types";
import type {
  CategoriesConfig,
  CategoryConfig,
  GitMasterConfig,
} from "../../platform/config/schema";
import { createAgentToolRestrictions } from "../../platform/config/permission-compat";
import { loadMarkdownAgents } from "./load-markdown-agents";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-builder";
import { deepMerge, findCaseInsensitive, includesCaseInsensitive } from "../../integration/shared";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(__dirname, "../..");
import {
  fetchAvailableModels,
  isModelAvailable,
  readConnectedProvidersCache,
} from "../../platform/opencode";
import { resolveModelWithFallback } from "./model-resolver";
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements";
import {
  DEFAULT_CATEGORIES,
  CATEGORY_DESCRIPTIONS,
} from "../../execution/tools/delegate-task/constants";
import { resolveMultipleSkills } from "../../execution/features/opencode-skill-loader/skill-content";
import { createSkills } from "../../execution/features/skills";
import type { LoadedSkill, SkillScope } from "../../execution/features/opencode-skill-loader/types";
import type { BrowserAutomationProvider } from "../../platform/config/schema";
export {
  createAgentToolAllowlist,
  createAgentToolRestrictions,
} from "../../platform/config/permission-compat";

type AgentCallable = (model: string) => AgentConfig;
type AgentSource = AgentFactory | AgentCallable | AgentConfig;

type MarkdownAgentMetadata = {
  id: string;
  name: string;
  purpose: string;
  models: { primary: string; fallback?: string };
  temperature: number;
  category?: string;
  cost?: string;
  triggers?: Array<{ domain: string; trigger: string }>;
  useWhen?: string[];
  avoidWhen?: string[];
  promptAlias?: string;
  keyTrigger?: string;
  dedicatedSection?: string;
  prompt: string;
};

function applyMarkdownModelOverrides(
  base: AgentConfig,
  markdownAgent: MarkdownAgentMetadata,
): AgentConfig {
  const overrides: AgentConfig = {
    description: markdownAgent.purpose,
    prompt: markdownAgent.prompt,
    temperature: markdownAgent.temperature,
  };
  if (markdownAgent.category) overrides.category = markdownAgent.category;
  return { ...base, ...overrides };
}

function buildOperatorAgentConfig(
  markdownAgent: MarkdownAgentMetadata,
  model: string,
): AgentConfig {
  const permission = { question: "allow", call_grid_agent: "deny" } as AgentConfig["permission"];
  const base: AgentConfig = {
    description: "Powerful AI orchestrator.",
    mode: "primary",
    model,
    maxTokens: 64000,
    color: "#00CED1",
    permission,
    prompt: markdownAgent.prompt,
    temperature: markdownAgent.temperature,
  };

  if (model.startsWith("openai/") || model.startsWith("github-copilot/gpt-")) {
    return applyMarkdownModelOverrides({ ...base, reasoningEffort: "medium" }, markdownAgent);
  }

  return applyMarkdownModelOverrides(
    { ...base, thinking: { type: "enabled", budgetTokens: 32000 } },
    markdownAgent,
  );
}

function buildOrchestratorAgentConfig(
  markdownAgent: MarkdownAgentMetadata,
  model: string,
): AgentConfig {
  const base: AgentConfig = {
    description: "Master orchestrator agent.",
    mode: "primary",
    model,
    maxTokens: 64000,
    color: "#9370DB",
    prompt: markdownAgent.prompt,
    temperature: markdownAgent.temperature,
    permission: createAgentToolRestrictions(["task", "call_grid_agent"]).permission,
  };

  if (model.startsWith("openai/") || model.startsWith("github-copilot/gpt-")) {
    return applyMarkdownModelOverrides({ ...base, reasoningEffort: "medium" }, markdownAgent);
  }

  return applyMarkdownModelOverrides(
    { ...base, thinking: { type: "enabled", budgetTokens: 32000 } },
    markdownAgent,
  );
}

function mapMarkdownMetadataToPromptMetadata(
  agent: MarkdownAgentMetadata,
): AgentPromptMetadata | undefined {
  if (!agent.category || !agent.cost) return undefined;
  if (!agent.triggers) return undefined;

  return {
    category: agent.category as AgentPromptMetadata["category"],
    cost: agent.cost as AgentPromptMetadata["cost"],
    triggers: agent.triggers,
    useWhen: agent.useWhen,
    avoidWhen: agent.avoidWhen,
    promptAlias: agent.promptAlias,
    keyTrigger: agent.keyTrigger,
    dedicatedSection: agent.dedicatedSection,
  };
}

function isFactory(source: AgentSource): source is AgentFactory | AgentCallable {
  return typeof source === "function";
}

export function buildAgent(
  source: AgentSource,
  model: string,
  categories?: CategoriesConfig,
  gitMasterConfig?: GitMasterConfig,
  browserProvider?: BrowserAutomationProvider,
): AgentConfig {
  const base = isFactory(source) ? source(model) : source;
  const categoryConfigs: Record<string, CategoryConfig> = categories
    ? { ...DEFAULT_CATEGORIES, ...categories }
    : DEFAULT_CATEGORIES;

  const agentWithCategory = base as AgentConfig & {
    category?: string;
    skills?: string[];
    variant?: string;
  };
  if (agentWithCategory.category) {
    const categoryConfig = categoryConfigs[agentWithCategory.category];
    if (categoryConfig) {
      if (!base.model) {
        base.model = categoryConfig.model;
      }
      if (base.temperature === undefined && categoryConfig.temperature !== undefined) {
        base.temperature = categoryConfig.temperature;
      }
      if (base.variant === undefined && categoryConfig.variant !== undefined) {
        base.variant = categoryConfig.variant;
      }
    }
  }

  if (agentWithCategory.skills?.length) {
    const { resolved } = resolveMultipleSkills(agentWithCategory.skills, {
      gitMasterConfig,
      browserProvider,
    });
    if (resolved.size > 0) {
      const skillContent = Array.from(resolved.values()).join("\n\n");
      base.prompt = skillContent + (base.prompt ? "\n\n" + base.prompt : "");
    }
  }

  if (!base.model || base.model === "inherit") {
    base.model = model;
  }

  return base;
}

/**
 * Creates OmO-specific environment context (time, timezone, locale).
 * Note: Working directory, platform, and date are already provided by OpenCode's system.ts,
 * so we only include fields that OpenCode doesn't provide to avoid duplication.
 * See: https://github.com/hackefeller/ghostwire/issues/379
 */
export function createEnvContext(): string {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  const dateStr = now.toLocaleDateString(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `
<grid-env>
  Current date: ${dateStr}
  Current time: ${timeStr}
  Timezone: ${timezone}
  Locale: ${locale}
</grid-env>`;
}

/**
 * Expands a category reference from an agent override into concrete config properties.
 * Category properties are applied unconditionally (overwriting factory defaults),
 * because the user's chosen category should take priority over factory base values.
 * Direct override properties applied later via mergeAgentConfig() will supersede these.
 */
function applyCategoryOverride(
  config: AgentConfig,
  categoryName: string,
  mergedCategories: Record<string, CategoryConfig>,
): AgentConfig {
  const categoryConfig = mergedCategories[categoryName];
  if (!categoryConfig) return config;

  const result = { ...config } as AgentConfig & Record<string, unknown>;
  if (categoryConfig.model) result.model = categoryConfig.model;
  if (categoryConfig.variant !== undefined) result.variant = categoryConfig.variant;
  if (categoryConfig.temperature !== undefined) result.temperature = categoryConfig.temperature;
  if (categoryConfig.reasoningEffort !== undefined)
    result.reasoningEffort = categoryConfig.reasoningEffort;
  if (categoryConfig.textVerbosity !== undefined)
    result.textVerbosity = categoryConfig.textVerbosity;
  if (categoryConfig.thinking !== undefined) result.thinking = categoryConfig.thinking;
  if (categoryConfig.top_p !== undefined) result.top_p = categoryConfig.top_p;
  if (categoryConfig.maxTokens !== undefined) result.maxTokens = categoryConfig.maxTokens;

  return result as AgentConfig;
}

function mergeAgentConfig(base: AgentConfig, override: AgentOverrideConfig): AgentConfig {
  const { prompt_append, ...rest } = override;
  const merged = deepMerge(base, rest as Partial<AgentConfig>);

  if (prompt_append && merged.prompt) {
    merged.prompt = merged.prompt + "\n" + prompt_append;
  }

  return merged;
}

function mapScopeToLocation(scope: SkillScope): AvailableSkill["location"] {
  if (scope === "user" || scope === "opencode") return "user";
  if (scope === "project" || scope === "opencode-project") return "project";
  return "plugin";
}

export interface CreateBuiltinAgentsOptions {
  disabledAgents?: string[];
  agentOverrides?: AgentOverrides;
  directory?: string;
  systemDefaultModel?: string;
  categories?: CategoriesConfig;
  gitMasterConfig?: GitMasterConfig;
  discoveredSkills?: LoadedSkill[];
  client?: any;
  browserProvider?: BrowserAutomationProvider;
  uiSelectedModel?: string;
}

export async function createAgents(
  options: CreateBuiltinAgentsOptions,
): Promise<Record<string, AgentConfig>> {
  const {
    disabledAgents = [],
    agentOverrides = {},
    directory,
    systemDefaultModel,
    categories,
    gitMasterConfig,
    discoveredSkills = [],
    client,
    browserProvider,
    uiSelectedModel,
  } = options;
  // If no directory provided, don't construct one - let loadMarkdownAgents
  // use the embedded manifest exclusively
  const agentsDir = directory ? join(directory, "src/orchestration/agents") : undefined;
  const markdownAgents = await loadMarkdownAgents(agentsDir);
  const markdownAgentMap = new Map(markdownAgents.map((agent) => [agent.id, agent]));
  const agentSources = new Map<string, AgentSource>(
    markdownAgents
      .filter((agent) => agent.id !== "operator" && agent.id !== "orchestrator")
      .map((agent) => {
        const config: AgentConfig = {
          description: agent.purpose,
          prompt: agent.prompt,
          temperature: agent.temperature,
          mode: agent.id === "do" ? "primary" : "subagent",
        };
        return [agent.id, config] as [string, AgentSource];
      }),
  );

  let connectedProviders = readConnectedProvidersCache();
  if (connectedProviders === null && client) {
    try {
      const { updateConnectedProvidersCache } =
        await import("../../platform/opencode/connected-providers-cache");
      await updateConnectedProvidersCache(client);
      connectedProviders = readConnectedProvidersCache();
    } catch (err) {
      // ignore cache update failures
    }
  }
  // IMPORTANT: Do NOT pass client to fetchAvailableModels during plugin initialization.
  // This function is called from config handler, and calling client API causes deadlock.
  // See: https://github.com/hackefeller/ghostwire/issues/1301
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: connectedProviders ?? undefined,
  });

  const result: Record<string, AgentConfig> = {};
  const availableAgents: AvailableAgent[] = [];

  const mergedCategories = categories
    ? { ...DEFAULT_CATEGORIES, ...categories }
    : DEFAULT_CATEGORIES;

  const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(
    ([name]) => ({
      name,
      description:
        categories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks",
    }),
  );

  const skills = createSkills({ browserProvider });
  const skillNames = new Set(skills.map((s) => s.name));

  const skillsAvailable: AvailableSkill[] = skills.map((skill) => ({
    name: skill.name,
    description: skill.description,
    location: "plugin" as const,
  }));

  const discoveredAvailable: AvailableSkill[] = discoveredSkills
    .filter((s) => !skillNames.has(s.name))
    .map((skill) => ({
      name: skill.name,
      description: skill.definition.description ?? "",
      location: mapScopeToLocation(skill.scope),
    }));

  const availableSkills: AvailableSkill[] = [...skillsAvailable, ...discoveredAvailable];

  for (const [agentName, source] of agentSources.entries()) {
    if (agentName === "orchestrator") continue;
    if (includesCaseInsensitive(disabledAgents, agentName)) continue;

    const override = findCaseInsensitive(agentOverrides, agentName as BuiltinAgentName);
    const requirement = AGENT_MODEL_REQUIREMENTS[agentName as BuiltinAgentName];

    // Check if agent requires a specific model
    if (requirement?.requiresModel && availableModels) {
      if (!isModelAvailable(requirement.requiresModel, availableModels)) {
        continue;
      }
    }

    const resolution = resolveModelWithFallback({
      uiSelectedModel,
      userModel: override?.model,
      fallbackChain: requirement?.fallbackChain,
      availableModels,
      systemDefaultModel,
    });
    if (!resolution && !systemDefaultModel) {
      continue;
    }
    const model = resolution?.model ?? systemDefaultModel ?? "";
    const resolvedVariant = resolution?.variant;

    const markdownAgent = markdownAgentMap.get(agentName);
    const baseConfig = buildAgent(
      source,
      model,
      mergedCategories,
      gitMasterConfig,
      browserProvider,
    );

    let config = markdownAgent
      ? applyMarkdownModelOverrides(baseConfig, markdownAgent)
      : baseConfig;

    if (model.startsWith("openai/") || model.startsWith("github-copilot/gpt-")) {
      config = { ...config, reasoningEffort: "medium", thinking: undefined };
    } else {
      config = {
        ...config,
        thinking: { type: "enabled", budgetTokens: 32000 },
        reasoningEffort: undefined,
      };
    }

    // Apply resolved variant from model fallback chain
    if (resolvedVariant) {
      config = { ...config, variant: resolvedVariant };
    }

    // Expand override.category into concrete properties (higher priority than factory/resolved)
    const overrideCategory = (override as Record<string, unknown> | undefined)?.category as
      | string
      | undefined;
    if (overrideCategory) {
      config = applyCategoryOverride(config, overrideCategory, mergedCategories);
    }

    if (agentName === "researcher-data" && directory && config.prompt) {
      const envContext = createEnvContext();
      config = { ...config, prompt: config.prompt + envContext };
    }

    // Direct override properties take highest priority
    if (override) {
      config = mergeAgentConfig(config, override);
    }

    result[agentName] = config;

    const metadata = markdownAgent ? mapMarkdownMetadataToPromptMetadata(markdownAgent) : undefined;
    if (metadata) {
      availableAgents.push({
        name: agentName,
        description: config.description ?? "",
        metadata,
      });
    }
  }

  if (!disabledAgents.includes("operator")) {
    const operatorMarkdown = markdownAgentMap.get("operator");
    const operatorOverride = agentOverrides["operator"];
    const operatorRequirement = AGENT_MODEL_REQUIREMENTS["operator"];

    const operatorResolution = resolveModelWithFallback({
      uiSelectedModel,
      userModel: operatorOverride?.model,
      fallbackChain: operatorRequirement?.fallbackChain,
      availableModels,
      systemDefaultModel,
    });

    if (operatorResolution && operatorMarkdown) {
      const { model: operatorModel, variant: operatorResolvedVariant } = operatorResolution;

      let operatorConfig = buildOperatorAgentConfig(operatorMarkdown, operatorModel);

      if (operatorResolvedVariant) {
        operatorConfig = { ...operatorConfig, variant: operatorResolvedVariant };
      }

      const sisOverrideCategory = operatorOverride?.category as string | undefined;
      if (sisOverrideCategory) {
        operatorConfig = applyCategoryOverride(
          operatorConfig,
          sisOverrideCategory,
          mergedCategories,
        );
      }

      if (directory && operatorConfig.prompt) {
        const envContext = createEnvContext();
        operatorConfig = {
          ...operatorConfig,
          prompt: operatorConfig.prompt + envContext,
        };
      }

      if (operatorOverride) {
        operatorConfig = mergeAgentConfig(operatorConfig, operatorOverride);
      }

      result["operator"] = operatorConfig;
    }
  }

  if (!disabledAgents.includes("orchestrator")) {
    const orchestratorMarkdown = markdownAgentMap.get("orchestrator");
    const orchestratorOverride = agentOverrides["orchestrator"];
    const nexusRequirement = AGENT_MODEL_REQUIREMENTS["orchestrator"];

    const nexusResolution = resolveModelWithFallback({
      // NOTE: orchestrator does NOT use uiSelectedModel - respects its own fallbackChain (k2p5 primary)
      userModel: orchestratorOverride?.model,
      fallbackChain: nexusRequirement?.fallbackChain,
      availableModels,
      systemDefaultModel,
    });

    if (nexusResolution && orchestratorMarkdown) {
      const { model: nexusModel, variant: nexusResolvedVariant } = nexusResolution;

      let orchestratorConfig = buildOrchestratorAgentConfig(orchestratorMarkdown, nexusModel);

      if (nexusResolvedVariant) {
        orchestratorConfig = {
          ...orchestratorConfig,
          variant: nexusResolvedVariant,
        };
      }

      const nexusOverrideCategory = (orchestratorOverride as Record<string, unknown> | undefined)
        ?.category as string | undefined;
      if (nexusOverrideCategory) {
        orchestratorConfig = applyCategoryOverride(
          orchestratorConfig,
          nexusOverrideCategory,
          mergedCategories,
        );
      }

      if (orchestratorOverride) {
        orchestratorConfig = mergeAgentConfig(orchestratorConfig, orchestratorOverride);
      }

      result["orchestrator"] = orchestratorConfig;
    }
  }

  return result;
}
