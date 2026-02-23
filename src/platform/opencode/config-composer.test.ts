import { describe, test, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { resolveCategoryConfig, createConfigHandler } from "./config-composer";
import type { CategoryConfig } from "../../platform/config/schema";
import type { GhostwireConfig } from "../../platform/config";

import * as agents from "../../orchestration/agents";
import * as commandLoader from "../../execution/features/claude-code-command-loader";
import * as commands from "../../execution/features/commands";
import * as skillLoader from "../../execution/features/opencode-skill-loader";
import * as agentLoader from "../../execution/features/claude-code-agent-loader";
import * as mcpLoader from "../../execution/features/claude-code-mcp-loader";
import * as pluginLoader from "../../execution/features/claude-code-plugin-loader";
import * as mcpModule from "../../integration/mcp";
import * as logger from "../../integration/shared/logger";
import * as modelAvailability from "./model-availability";
import * as providersCache from "./connected-providers-cache";
import * as configDir from "./config-dir";
import * as fs from "node:fs";
import * as permissionCompat from "../../platform/config/permission-compat";
import * as modelResolver from "../../orchestration/agents/model-resolver";

let existsSyncSpy: ReturnType<typeof spyOn> | null = null;

beforeEach(() => {
  // Default: simulate project-level OpenCode config present
  existsSyncSpy = spyOn(fs, "existsSync" as any).mockImplementation((p: unknown) => {
    const s = String(p);
    // detectConfigFile checks .jsonc first, then .json
    if (s === "/tmp/.opencode/opencode.json") return true;
    return false;
  });

  spyOn(agents, "createBuiltinAgents" as any).mockResolvedValue({
    "operator": {
      name: "operator",
      prompt: "test",
      mode: "primary",
    },
    "advisor-plan": { name: "advisor-plan", prompt: "test", mode: "subagent" },
    "executor": { name: "executor", prompt: "test", mode: "subagent" },
  });

  spyOn(commandLoader, "loadUserCommands" as any).mockResolvedValue({});
  spyOn(commandLoader, "loadProjectCommands" as any).mockResolvedValue({});
  spyOn(commandLoader, "loadOpencodeGlobalCommands" as any).mockResolvedValue({});
  spyOn(commandLoader, "loadOpencodeProjectCommands" as any).mockResolvedValue({});

  spyOn(commands, "loadCommands" as any).mockReturnValue({});

  spyOn(skillLoader, "loadUserSkills" as any).mockResolvedValue({});
  spyOn(skillLoader, "loadProjectSkills" as any).mockResolvedValue({});
  spyOn(skillLoader, "loadOpencodeGlobalSkills" as any).mockResolvedValue({});
  spyOn(skillLoader, "loadOpencodeProjectSkills" as any).mockResolvedValue({});
  spyOn(skillLoader, "discoverUserClaudeSkills" as any).mockResolvedValue([]);
  spyOn(skillLoader, "discoverProjectClaudeSkills" as any).mockResolvedValue([]);
  spyOn(skillLoader, "discoverOpencodeGlobalSkills" as any).mockResolvedValue([]);
  spyOn(skillLoader, "discoverOpencodeProjectSkills" as any).mockResolvedValue([]);

  spyOn(agentLoader, "loadUserAgents" as any).mockReturnValue({});
  spyOn(agentLoader, "loadProjectAgents" as any).mockReturnValue({});

  spyOn(mcpLoader, "loadMcpConfigs" as any).mockResolvedValue({ servers: {} });

  spyOn(pluginLoader, "loadAllPluginComponents" as any).mockResolvedValue({
    commands: {},
    skills: {},
    agents: {},
    mcpServers: {},
    hooksConfigs: [],
    plugins: [],
    errors: [],
  });

  spyOn(mcpModule, "createMcps" as any).mockReturnValue({});

  spyOn(logger, "log" as any).mockImplementation(() => {});
  spyOn(modelAvailability, "fetchAvailableModels" as any).mockResolvedValue(
    new Set(["anthropic/claude-opus-4-5"]),
  );
  spyOn(providersCache, "readConnectedProvidersCache" as any).mockReturnValue(null);

  spyOn(configDir, "getOpenCodeConfigPaths" as any).mockReturnValue({
    global: "/tmp/.config/opencode",
    project: "/tmp/.opencode",
  });

  spyOn(fs, "readFileSync" as any).mockReturnValue("PLANNER_PROMPT");

  spyOn(permissionCompat, "migrateAgentConfig" as any).mockImplementation(
    (config: Record<string, unknown>) => config,
  );

  spyOn(modelResolver, "resolveModelWithFallback" as any).mockReturnValue({
    model: "anthropic/claude-opus-4-5",
  });
});

afterEach(() => {
  existsSyncSpy?.mockRestore?.();
  existsSyncSpy = null;

  (agents.createBuiltinAgents as any)?.mockRestore?.();
  (commandLoader.loadUserCommands as any)?.mockRestore?.();
  (commandLoader.loadProjectCommands as any)?.mockRestore?.();
  (commandLoader.loadOpencodeGlobalCommands as any)?.mockRestore?.();
  (commandLoader.loadOpencodeProjectCommands as any)?.mockRestore?.();
  (commands.loadCommands as any)?.mockRestore?.();
  (skillLoader.loadUserSkills as any)?.mockRestore?.();
  (skillLoader.loadProjectSkills as any)?.mockRestore?.();
  (skillLoader.loadOpencodeGlobalSkills as any)?.mockRestore?.();
  (skillLoader.loadOpencodeProjectSkills as any)?.mockRestore?.();
  (skillLoader.discoverUserClaudeSkills as any)?.mockRestore?.();
  (skillLoader.discoverProjectClaudeSkills as any)?.mockRestore?.();
  (skillLoader.discoverOpencodeGlobalSkills as any)?.mockRestore?.();
  (skillLoader.discoverOpencodeProjectSkills as any)?.mockRestore?.();
  (agentLoader.loadUserAgents as any)?.mockRestore?.();
  (agentLoader.loadProjectAgents as any)?.mockRestore?.();
  (mcpLoader.loadMcpConfigs as any)?.mockRestore?.();
  (pluginLoader.loadAllPluginComponents as any)?.mockRestore?.();
  (mcpModule.createMcps as any)?.mockRestore?.();
  (logger.log as any)?.mockRestore?.();
  (modelAvailability.fetchAvailableModels as any)?.mockRestore?.();
  (providersCache.readConnectedProvidersCache as any)?.mockRestore?.();
  (configDir.getOpenCodeConfigPaths as any)?.mockRestore?.();
  (fs.readFileSync as any)?.mockRestore?.();
  (permissionCompat.migrateAgentConfig as any)?.mockRestore?.();
  (modelResolver.resolveModelWithFallback as any)?.mockRestore?.();
});

describe("Ghostwire builtin agent injection scope", () => {
  test("injects builtin agents by default (inject_agents_globally not set)", async () => {
    // #given
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then
    const agentConfig = config.agent as Record<string, unknown>;
    expect(agentConfig["operator"]).toBeDefined();
    expect(agentConfig["planner"]).toBeDefined();
    expect((config as { default_agent?: string }).default_agent).toBe("operator");

    const permission = config.permission as Record<string, unknown>;
    expect(permission.delegate_task).toBe("deny");

    expect(agents.createBuiltinAgents).toHaveBeenCalled();
  });

  test("does not inject builtin agents when inject_agents_globally is false", async () => {
    // #given
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
      inject_agents_globally: false,
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then
    const agentConfig = config.agent as Record<string, unknown>;
    expect(agentConfig["operator"]).toBeUndefined();
    expect(agentConfig["planner"]).toBeUndefined();
    expect((config as { default_agent?: string }).default_agent).toBeUndefined();

    const permission = config.permission as Record<string, unknown>;
    expect(permission.delegate_task).toBeUndefined();

    expect(agents.createBuiltinAgents).not.toHaveBeenCalled();
  });
});

describe("Plan agent demote behavior", () => {
  test("plan agent should be demoted to subagent mode when replacePlan is true", async () => {
    // #given
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
        replace_plan: true,
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {
        plan: {
          name: "plan",
          mode: "primary",
          prompt: "original plan prompt",
        },
      },
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then
    const agents = config.agent as Record<string, { mode?: string; name?: string }>;
    expect(agents.plan).toBeDefined();
    expect(agents.plan.mode).toBe("subagent");
    expect(agents.plan.name).toBe("plan");
  });

  test("planner should have mode 'all' to be callable via delegate_task", async () => {
    // #given
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then
    const agents = config.agent as Record<string, { mode?: string }>;
    expect(agents["planner"]).toBeDefined();
    expect(agents["planner"].mode).toBe("all");
  });
});

describe("planner category config resolution", () => {
  test("resolves ultrabrain category config", () => {
    // #given
    const categoryName = "ultrabrain";

    // #when
    const config = resolveCategoryConfig(categoryName);

    // #then
    expect(config).toBeDefined();
    expect(config?.model).toBe("openai/gpt-5.2-codex");
    expect(config?.variant).toBe("xhigh");
  });

  test("resolves visual-engineering category config", () => {
    // #given
    const categoryName = "visual-engineering";

    // #when
    const config = resolveCategoryConfig(categoryName);

    // #then
    expect(config).toBeDefined();
    expect(config?.model).toBe("google/gemini-3-pro");
  });

  test("user categories override default categories", () => {
    // #given
    const categoryName = "ultrabrain";
    const userCategories: Record<string, CategoryConfig> = {
      ultrabrain: {
        model: "google/antigravity-claude-opus-4-5-thinking",
        temperature: 0.1,
      },
    };

    // #when
    const config = resolveCategoryConfig(categoryName, userCategories);

    // #then
    expect(config).toBeDefined();
    expect(config?.model).toBe("google/antigravity-claude-opus-4-5-thinking");
    expect(config?.temperature).toBe(0.1);
  });

  test("returns undefined for unknown category", () => {
    // #given
    const categoryName = "nonexistent-category";

    // #when
    const config = resolveCategoryConfig(categoryName);

    // #then
    expect(config).toBeUndefined();
  });

  test("falls back to default when user category has no entry", () => {
    // #given
    const categoryName = "ultrabrain";
    const userCategories: Record<string, CategoryConfig> = {
      "visual-engineering": {
        model: "custom/visual-model",
      },
    };

    // #when
    const config = resolveCategoryConfig(categoryName, userCategories);

    // #then - falls back to DEFAULT_CATEGORIES
    expect(config).toBeDefined();
    expect(config?.model).toBe("openai/gpt-5.2-codex");
    expect(config?.variant).toBe("xhigh");
  });

  test("preserves all category properties (temperature, top_p, tools, etc.)", () => {
    // #given
    const categoryName = "custom-category";
    const userCategories: Record<string, CategoryConfig> = {
      "custom-category": {
        model: "test/model",
        temperature: 0.5,
        top_p: 0.9,
        maxTokens: 32000,
        tools: { tool1: true, tool2: false },
      },
    };

    // #when
    const config = resolveCategoryConfig(categoryName, userCategories);

    // #then
    expect(config).toBeDefined();
    expect(config?.model).toBe("test/model");
    expect(config?.temperature).toBe(0.5);
    expect(config?.top_p).toBe(0.9);
    expect(config?.maxTokens).toBe(32000);
    expect(config?.tools).toEqual({ tool1: true, tool2: false });
  });
});

describe("planner direct override priority over category", () => {
  test("direct reasoningEffort takes priority over category reasoningEffort", async () => {
    // #given - category has reasoningEffort=xhigh, direct override says "low"
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
      categories: {
        "test-planning": {
          model: "openai/gpt-5.2",
          reasoningEffort: "xhigh",
        },
      },
      agents: {
        "planner": {
          category: "test-planning",
          reasoningEffort: "low",
        },
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then - direct override's reasoningEffort wins
    const agents = config.agent as Record<string, { reasoningEffort?: string }>;
    expect(agents["planner"]).toBeDefined();
    expect(agents["planner"].reasoningEffort).toBe("low");
  });

  test("category reasoningEffort applied when no direct override", async () => {
    // #given - category has reasoningEffort but no direct override
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
      categories: {
        "reasoning-cat": {
          model: "openai/gpt-5.2",
          reasoningEffort: "high",
        },
      },
      agents: {
        "planner": {
          category: "reasoning-cat",
        },
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then - category's reasoningEffort is applied
    const agents = config.agent as Record<string, { reasoningEffort?: string }>;
    expect(agents["planner"]).toBeDefined();
    expect(agents["planner"].reasoningEffort).toBe("high");
  });

  test("direct temperature takes priority over category temperature", async () => {
    // #given
    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
      categories: {
        "temp-cat": {
          model: "openai/gpt-5.2",
          temperature: 0.8,
        },
      },
      agents: {
        "planner": {
          category: "temp-cat",
          temperature: 0.1,
        },
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then - direct temperature wins over category
    const agents = config.agent as Record<string, { temperature?: number }>;
    expect(agents["planner"]).toBeDefined();
    expect(agents["planner"].temperature).toBe(0.1);
  });
});

describe("Deadlock prevention - fetchAvailableModels must not receive client", () => {
  test("fetchAvailableModels should be called with undefined client to prevent deadlock during plugin init", async () => {
    // #given - This test ensures we don't regress on issue #1301
    // Passing client to fetchAvailableModels during config handler causes deadlock:
    // - Plugin init waits for server response (client.provider.list())
    // - Server waits for plugin init to complete before handling requests
    const fetchSpy = spyOn(modelAvailability, "fetchAvailableModels" as any).mockResolvedValue(
      new Set<string>(),
    );

    const pluginConfig: GhostwireConfig = {
      operator: {
        planner_enabled: true,
      },
    };
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-5",
      agent: {},
    };
    const mockClient = {
      provider: { list: () => Promise.resolve({ data: { connected: [] } }) },
      model: { list: () => Promise.resolve({ data: [] }) },
    };
    const handler = createConfigHandler({
      ctx: { directory: "/tmp", client: mockClient },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    });

    // #when
    await handler(config);

    // #then - fetchAvailableModels must be called with undefined as first argument (no client)
    // This prevents the deadlock described in issue #1301
    expect(fetchSpy).toHaveBeenCalled();
    const firstCallArgs = fetchSpy.mock.calls[0];
    expect(firstCallArgs[0]).toBeUndefined();

    fetchSpy.mockRestore?.();
  });
});
