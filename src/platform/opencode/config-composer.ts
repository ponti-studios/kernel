import { createAgents } from "../../orchestration/agents";
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
import { DEFAULT_CATEGORIES } from "../../execution/tools/delegate-task/constants";
import type { ModelCacheState } from "../../plugin-state";
import type { CategoryConfig } from "../../platform/config/schema";
import { migrateAgentConfig } from "../../platform/config/permission-compat";

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
      ? await createAgents({
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

    const isPrimaryDoEnabled = shouldInjectAgents && pluginConfig.operator?.disabled !== true;
    const builderEnabled = pluginConfig.operator?.default_builder_enabled ?? false;

    type AgentConfig = Record<string, Record<string, unknown> | undefined> & {
      build?: Record<string, unknown>;
      do?: { permission?: Record<string, unknown> };
      research?: { permission?: Record<string, unknown> };
    };
    const configAgent = (config.agent as AgentConfig | undefined) ?? {};
    const { build: rawBuild, ...rawConfigAgents } = configAgent;

    const migratedConfigAgents = Object.fromEntries(
      Object.entries(rawConfigAgents).map(([key, value]) => [
        key,
        value ? migrateAgentConfig(value as Record<string, unknown>) : value,
      ]),
    );

    const migratedBuild = rawBuild
      ? migrateAgentConfig(rawBuild as Record<string, unknown>)
      : undefined;

    if (isPrimaryDoEnabled && builtinAgents["do"]) {
      (config as { default_agent?: string }).default_agent = "do";
    }

    const mergedAgents: Record<string, unknown> = {
      ...(shouldInjectAgents ? builtinAgents : {}),
      ...userAgents,
      ...projectAgents,
      ...pluginAgents,
      ...migratedConfigAgents,
    };

    if (builderEnabled || migratedBuild) {
      mergedAgents.build = { ...(migratedBuild ?? {}), mode: "subagent", hidden: true };
    }

    config.agent = mergedAgents;

    const agentResult = config.agent as AgentConfig;

    config.tools = {
      ...(config.tools as Record<string, unknown>),
      "grep_app_*": false,
      LspHover: false,
      LspCodeActions: false,
      LspCodeActionResolve: false,
    };

    type AgentWithPermission = { permission?: Record<string, unknown> };

    if (agentResult.do) {
      const agent = agentResult.do as AgentWithPermission;
      agent.permission = {
        ...agent.permission,
        call_grid_agent: "deny",
        delegate_task: "allow",
        question: "allow",
      };
    }
    if (agentResult.research) {
      const agent = agentResult.research as AgentWithPermission;
      agent.permission = {
        ...agent.permission,
        call_grid_agent: "deny",
        delegate_task: "deny",
        question: "allow",
      };
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
