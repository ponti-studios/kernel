import { createBuiltinAgents } from "../../orchestration/agents";
import type { AgentConfig as SDKAgentConfig } from "@opencode-ai/sdk";
import {
  loadUserCommands,
  loadProjectCommands,
  loadOpencodeGlobalCommands,
  loadOpencodeProjectCommands,
} from "../../execution/features/claude-code-command-loader";
import { loadCommands } from "../../execution/features/commands";
import {
  loadUserSkills,
  loadProjectSkills,
  loadOpencodeGlobalSkills,
  loadOpencodeProjectSkills,
  discoverUserClaudeSkills,
  discoverProjectClaudeSkills,
  discoverOpencodeGlobalSkills,
  discoverOpencodeProjectSkills,
} from "../../execution/features/opencode-skill-loader";
import {
  loadUserAgents,
  loadProjectAgents,
} from "../../execution/features/claude-code-agent-loader";
import { loadMcpConfigs } from "../../execution/features/claude-code-mcp-loader";
import { loadAllPluginComponents } from "../../execution/features/claude-code-plugin-loader";
import { createMcps } from "../../integration/mcp";
import type { GhostwireConfig } from "../../platform/config";
import { log } from "../../integration/shared";
import { resolveModelWithFallback } from "../../orchestration/agents/model-resolver";
import { AGENT_MODEL_REQUIREMENTS } from "../../orchestration/agents/model-requirements";
import { DEFAULT_CATEGORIES } from "../../execution/tools/delegate-task/constants";
import type { ModelCacheState } from "../../plugin-state";
import type { CategoryConfig } from "../../platform/config/schema";
import { migrateAgentConfig } from "../../platform/config/permission-compat";
import { fetchAvailableModels } from "./model-availability";
import { readConnectedProvidersCache } from "./connected-providers-cache";

export interface ConfigHandlerDeps {
  ctx: { directory: string; client?: any };
  pluginConfig: GhostwireConfig;
  modelCacheState: ModelCacheState;
}

export function resolveCategoryConfig(
  categoryName: string,
  userCategories?: Record<string, CategoryConfig>,
): CategoryConfig | undefined {
  return userCategories?.[categoryName] ?? DEFAULT_CATEGORIES[categoryName];
}

export function createConfigHandler(deps: ConfigHandlerDeps) {
  const { ctx, pluginConfig, modelCacheState } = deps;

  return async (config: Record<string, unknown>) => {
    type ProviderConfig = {
      options?: { headers?: Record<string, string> };
      models?: Record<string, { limit?: { context?: number } }>;
    };
    const providers = config.provider as Record<string, ProviderConfig> | undefined;

    const anthropicBeta = providers?.anthropic?.options?.headers?.["anthropic-beta"];
    modelCacheState.anthropicContext1MEnabled = anthropicBeta?.includes("context-1m") ?? false;

    if (providers) {
      for (const [providerID, providerConfig] of Object.entries(providers)) {
        const models = providerConfig?.models;
        if (models) {
          for (const [modelID, modelConfig] of Object.entries(models)) {
            const contextLimit = modelConfig?.limit?.context;
            if (contextLimit) {
              modelCacheState.modelContextLimitsCache.set(`${providerID}/${modelID}`, contextLimit);
            }
          }
        }
      }
    }

    const pluginComponents =
      (pluginConfig.claude_code?.plugins ?? true)
        ? await loadAllPluginComponents({
            enabledPluginsOverride: pluginConfig.claude_code?.plugins_override,
          })
        : {
            commands: {},
            skills: {},
            agents: {},
            mcpServers: {},
            hooksConfigs: [],
            plugins: [],
            errors: [],
          };

    if (pluginComponents.plugins.length > 0) {
      log(`Loaded ${pluginComponents.plugins.length} Claude Code plugins`, {
        plugins: pluginComponents.plugins.map((p) => `${p.name}@${p.version}`),
      });
    }

    if (pluginComponents.errors.length > 0) {
      log(`Plugin load errors`, { errors: pluginComponents.errors });
    }

    const disabledAgents = pluginConfig.disabled_agents ?? [];

    const includeClaudeSkillsForAwareness = pluginConfig.claude_code?.skills ?? true;
    const [
      discoveredUserSkills,
      discoveredProjectSkills,
      discoveredOpencodeGlobalSkills,
      discoveredOpencodeProjectSkills,
    ] = await Promise.all([
      includeClaudeSkillsForAwareness ? discoverUserClaudeSkills() : Promise.resolve([]),
      includeClaudeSkillsForAwareness ? discoverProjectClaudeSkills() : Promise.resolve([]),
      discoverOpencodeGlobalSkills(),
      discoverOpencodeProjectSkills(),
    ]);

    const allDiscoveredSkills = [
      ...discoveredOpencodeProjectSkills,
      ...discoveredProjectSkills,
      ...discoveredOpencodeGlobalSkills,
      ...discoveredUserSkills,
    ];

    const browserProvider = pluginConfig.browser_automation_engine?.provider ?? "playwright";
    // config.model represents the currently active model in OpenCode (including UI selection)
    // Pass it as uiSelectedModel so it takes highest priority in model resolution
    const currentModel = config.model as string | undefined;

    // Determine whether to inject builtin agents into OpenCode config
    // Default: true (inject globally). Can be disabled via inject_agents_globally: false
    const shouldInjectAgents = pluginConfig.inject_agents_globally !== false;

    const builtinAgents = shouldInjectAgents
      ? await createBuiltinAgents({
          disabledAgents,
          agentOverrides: pluginConfig.agents,
          directory: ctx.directory,
          systemDefaultModel: currentModel, // use active model when fallback yields none
          categories: pluginConfig.categories,
          gitMasterConfig: pluginConfig.git_master,
          discoveredSkills: allDiscoveredSkills,
          client: ctx.client,
          browserProvider,
          uiSelectedModel: currentModel, // takes highest priority
        })
      : {};

    // Claude Code agents: Do NOT apply permission migration
    // Claude Code uses whitelist-based tools format which is semantically different
    // from OpenCode's denylist-based permission system
    const userAgents = (pluginConfig.claude_code?.agents ?? true) ? loadUserAgents() : {};
    const projectAgents = (pluginConfig.claude_code?.agents ?? true) ? loadProjectAgents() : {};

    // Plugin agents: Apply permission migration for compatibility
    const rawPluginAgents = pluginComponents.agents;
    const pluginAgents = Object.fromEntries(
      Object.entries(rawPluginAgents).map(([k, v]) => [
        k,
        v ? migrateAgentConfig(v as Record<string, unknown>) : v,
      ]),
    );

    const isOperatorEnabled = shouldInjectAgents && pluginConfig.operator?.disabled !== true;
    const builderEnabled = pluginConfig.operator?.default_builder_enabled ?? false;
    const plannerEnabled = pluginConfig.operator?.planner_enabled ?? true;
    const replacePlan = pluginConfig.operator?.replace_plan ?? true;

    type AgentConfig = Record<string, Record<string, unknown> | undefined> & {
      build?: Record<string, unknown>;
      plan?: Record<string, unknown>;
      scoutRecon?: { tools?: Record<string, unknown> };
      archiveResearcher?: { tools?: Record<string, unknown> };
      "analyzer-media"?: { tools?: Record<string, unknown> };
      nexusOrchestrator?: { tools?: Record<string, unknown> };
      cipherOperator?: { tools?: Record<string, unknown> };
    };
    const configAgent = config.agent as AgentConfig | undefined;

    if (isOperatorEnabled && builtinAgents["operator"]) {
      (config as { default_agent?: string }).default_agent = "operator";

      const agentConfig: Record<string, unknown> = {
        "operator": builtinAgents["operator"],
      };

      const executorBase = builtinAgents["executor"] as SDKAgentConfig | undefined;
      const executorOverride = pluginConfig.agents?.["executor"] as
        | Record<string, unknown>
        | undefined;
      if (executorBase) {
        agentConfig["executor"] = executorOverride
          ? { ...executorBase, ...executorOverride }
          : executorBase;
      }

      if (builderEnabled) {
        const { name: _buildName, ...buildConfigWithoutName } = configAgent?.build ?? {};
        const migratedBuildConfig = migrateAgentConfig(
          buildConfigWithoutName as Record<string, unknown>,
        );
        const openCodeBuilderOverride = pluginConfig.agents?.["OpenCode-Builder"];
        const openCodeBuilderBase = {
          ...migratedBuildConfig,
          description: `${configAgent?.build?.description ?? "Build agent"} (OpenCode default)`,
        };

        agentConfig["OpenCode-Builder"] = openCodeBuilderOverride
          ? { ...openCodeBuilderBase, ...openCodeBuilderOverride }
          : openCodeBuilderBase;
      }

      if (plannerEnabled) {
        const {
          name: _planName,
          mode: _planMode,
          ...planConfigWithoutName
        } = configAgent?.plan ?? {};
        const migratedPlanConfig = migrateAgentConfig(
          planConfigWithoutName as Record<string, unknown>,
        );
        const augurOverride = pluginConfig.agents?.["planner"] as
          | (Record<string, unknown> & {
              category?: string;
              model?: string;
              variant?: string;
              reasoningEffort?: string;
              textVerbosity?: string;
              thinking?: { type: string; budgetTokens?: number };
              temperature?: number;
              top_p?: number;
              maxTokens?: number;
            })
          | undefined;

        const categoryConfig = augurOverride?.category
          ? resolveCategoryConfig(augurOverride.category, pluginConfig.categories)
          : undefined;

        const augurRequirement = AGENT_MODEL_REQUIREMENTS["planner"];
        const connectedProviders = readConnectedProvidersCache();
        // IMPORTANT: Do NOT pass ctx.client to fetchAvailableModels during plugin initialization.
        // Calling client API (e.g., client.provider.list()) from config handler causes deadlock:
        // - Plugin init waits for server response
        // - Server waits for plugin init to complete before handling requests
        // Use cache-only mode instead. If cache is unavailable, fallback chain uses first model.
        // See: https://github.com/hackefeller/ghostwire/issues/1301
        const availableModels = await fetchAvailableModels(undefined, {
          connectedProviders: connectedProviders ?? undefined,
        });

        const modelResolution = resolveModelWithFallback({
          uiSelectedModel: currentModel,
          userModel: augurOverride?.model ?? categoryConfig?.model,
          fallbackChain: augurRequirement?.fallbackChain,
          availableModels,
          systemDefaultModel: undefined,
        });
        const resolvedModel = modelResolution?.model;
        const resolvedVariant = modelResolution?.variant;

        const variantToUse = augurOverride?.variant ?? resolvedVariant;
        const reasoningEffortToUse =
          augurOverride?.reasoningEffort ?? categoryConfig?.reasoningEffort;
        const textVerbosityToUse = augurOverride?.textVerbosity ?? categoryConfig?.textVerbosity;
        const thinkingToUse = augurOverride?.thinking ?? categoryConfig?.thinking;
        const temperatureToUse = augurOverride?.temperature ?? categoryConfig?.temperature;
        const topPToUse = augurOverride?.top_p ?? categoryConfig?.top_p;
        const maxTokensToUse = augurOverride?.maxTokens ?? categoryConfig?.maxTokens;
        // Get planner prompt from builtin agents instead of reading from file
        // This ensures it works regardless of what directory is being used
        const plannerAgent = builtinAgents["planner"];
        const plannerMarkdown = plannerAgent?.prompt || "";
        const augurBase = {
          name: "planner",
          ...(resolvedModel ? { model: resolvedModel } : {}),
          ...(variantToUse ? { variant: variantToUse } : {}),
          mode: "all" as const,
          prompt: plannerMarkdown,
          permission: { question: "allow", call_grid_agent: "deny", delegate_task: "allow" },
          description: `${configAgent?.plan?.description ?? "Plan agent"} (planner - Ghostwire)`,
          color: (configAgent?.plan?.color as string) ?? "#FF6347",
          ...(temperatureToUse !== undefined ? { temperature: temperatureToUse } : {}),
          ...(topPToUse !== undefined ? { top_p: topPToUse } : {}),
          ...(maxTokensToUse !== undefined ? { maxTokens: maxTokensToUse } : {}),
          ...(categoryConfig?.tools ? { tools: categoryConfig.tools } : {}),
          ...(thinkingToUse ? { thinking: thinkingToUse } : {}),
          ...(reasoningEffortToUse !== undefined ? { reasoningEffort: reasoningEffortToUse } : {}),
          ...(textVerbosityToUse !== undefined ? { textVerbosity: textVerbosityToUse } : {}),
        };

        agentConfig["planner"] = augurOverride ? { ...augurBase, ...augurOverride } : augurBase;
      }

      const filteredConfigAgents = configAgent
        ? Object.fromEntries(
            Object.entries(configAgent)
              .filter(([key]) => {
                if (key === "build") return false;
                if (key === "plan" && replacePlan) return false;
                // Filter out agents that ghostwire provides to prevent
                // OpenCode defaults from overwriting user config in ghostwire.json
                // See: https://github.com/hackefeller/ghostwire/issues/472
                if (key in builtinAgents) return false;
                return true;
              })
              .map(([key, value]) => [
                key,
                value ? migrateAgentConfig(value as Record<string, unknown>) : value,
              ]),
          )
        : {};

      const migratedBuild = configAgent?.build
        ? migrateAgentConfig(configAgent.build as Record<string, unknown>)
        : {};

      const planDemoteConfig =
        replacePlan && agentConfig["planner"]
          ? {
              ...agentConfig["planner"],
              name: "plan",
              mode: "subagent" as const,
            }
          : undefined;

      config.agent = {
        ...agentConfig,
        ...Object.fromEntries(Object.entries(builtinAgents).filter(([k]) => k !== "operator")),
        ...userAgents,
        ...projectAgents,
        ...pluginAgents,
        ...filteredConfigAgents,
        build: { ...migratedBuild, mode: "subagent", hidden: true },
        ...(planDemoteConfig ? { plan: planDemoteConfig } : {}),
      };
    } else {
      config.agent = {
        ...builtinAgents,
        ...userAgents,
        ...projectAgents,
        ...pluginAgents,
        ...configAgent,
      };
    }

    const agentResult = config.agent as AgentConfig;

    config.tools = {
      ...(config.tools as Record<string, unknown>),
      "grep_app_*": false,
      LspHover: false,
      LspCodeActions: false,
      LspCodeActionResolve: false,
    };

    type AgentWithPermission = { permission?: Record<string, unknown> };

    if (agentResult.archiveResearcher) {
      const agent = agentResult.archiveResearcher as AgentWithPermission;
      agent.permission = { ...agent.permission, "grep_app_*": "allow" };
    }
    if (agentResult["analyzer-media"]) {
      const agent = agentResult["analyzer-media"] as AgentWithPermission;
      agent.permission = { ...agent.permission, task: "deny", look_at: "deny" };
    }
    if (agentResult["orchestrator"]) {
      const agent = agentResult["orchestrator"] as AgentWithPermission;
      agent.permission = {
        ...agent.permission,
        task: "deny",
        call_grid_agent: "deny",
        delegate_task: "allow",
      };
    }
    if (agentResult["operator"]) {
      const agent = agentResult["operator"] as AgentWithPermission;
      agent.permission = {
        ...agent.permission,
        call_grid_agent: "deny",
        delegate_task: "allow",
        question: "allow",
      };
    }
    if (agentResult["planner"]) {
      const agent = agentResult["planner"] as AgentWithPermission;
      agent.permission = {
        ...agent.permission,
        call_grid_agent: "deny",
        delegate_task: "allow",
        question: "allow",
      };
    }
    if (agentResult["executor"]) {
      const agent = agentResult["executor"] as AgentWithPermission;
      agent.permission = { ...agent.permission, delegate_task: "allow" };
    }

    config.permission = {
      ...(config.permission as Record<string, unknown>),
      webfetch: "allow",
      external_directory: "allow",
      ...(shouldInjectAgents ? { delegate_task: "deny" } : {}),
    };

    const mcpResult =
      (pluginConfig.claude_code?.mcp ?? true) ? await loadMcpConfigs() : { servers: {} };

    config.mcp = {
      ...createMcps(pluginConfig.disabled_mcps),
      ...(config.mcp as Record<string, unknown>),
      ...mcpResult.servers,
      ...pluginComponents.mcpServers,
    };

    const builtinCommands = loadCommands(pluginConfig.disabled_commands);
    const systemCommands = (config.command as Record<string, unknown>) ?? {};

    // Parallel loading of all commands and skills for faster startup
    const includeClaudeCommands = pluginConfig.claude_code?.commands ?? true;
    const includeClaudeSkills = pluginConfig.claude_code?.skills ?? true;

    const [
      userCommands,
      projectCommands,
      opencodeGlobalCommands,
      opencodeProjectCommands,
      userSkills,
      projectSkills,
      opencodeGlobalSkills,
      opencodeProjectSkills,
    ] = await Promise.all([
      includeClaudeCommands ? loadUserCommands() : Promise.resolve({}),
      includeClaudeCommands ? loadProjectCommands() : Promise.resolve({}),
      loadOpencodeGlobalCommands(),
      loadOpencodeProjectCommands(),
      includeClaudeSkills ? loadUserSkills() : Promise.resolve({}),
      includeClaudeSkills ? loadProjectSkills() : Promise.resolve({}),
      loadOpencodeGlobalSkills(),
      loadOpencodeProjectSkills(),
    ]);

    config.command = {
      ...builtinCommands,
      ...userCommands,
      ...userSkills,
      ...opencodeGlobalCommands,
      ...opencodeGlobalSkills,
      ...systemCommands,
      ...projectCommands,
      ...projectSkills,
      ...opencodeProjectCommands,
      ...opencodeProjectSkills,
      ...pluginComponents.commands,
      ...pluginComponents.skills,
    };
  };
}
