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
import * as configDir from "./config-dir";
import * as fs from "node:fs";
import * as permissionCompat from "../../platform/config/permission-compat";

let existsSyncSpy: ReturnType<typeof spyOn> | null = null;

beforeEach(() => {
  existsSyncSpy = spyOn(fs, "existsSync" as any).mockImplementation((p: unknown) => {
    const s = String(p);
    if (s === "/tmp/.opencode/opencode.json") return true;
    return false;
  });

  spyOn(agents, "createAgents" as any).mockResolvedValue({
    do: {
      name: "do",
      prompt: "do prompt",
      mode: "primary",
      permission: {},
    },
    research: {
      name: "research",
      prompt: "research prompt",
      mode: "subagent",
      permission: {},
    },
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

  spyOn(configDir, "getOpenCodeConfigPaths" as any).mockReturnValue({
    global: "/tmp/.config/opencode",
    project: "/tmp/.opencode",
  });

  spyOn(permissionCompat, "migrateAgentConfig" as any).mockImplementation(
    (config: Record<string, unknown>) => config,
  );
});

afterEach(() => {
  existsSyncSpy?.mockRestore?.();
  existsSyncSpy = null;

  (agents.createAgents as any)?.mockRestore?.();
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
  (configDir.getOpenCodeConfigPaths as any)?.mockRestore?.();
  (permissionCompat.migrateAgentConfig as any)?.mockRestore?.();
});

describe("Ghostwire agent injection scope", () => {
  test("injects do/research by default", async () => {
    const pluginConfig: GhostwireConfig = {};
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

    await handler(config);

    const agentConfig = config.agent as Record<string, unknown>;
    expect(agentConfig.do).toBeDefined();
    expect(agentConfig.research).toBeDefined();
    expect((config as { default_agent?: string }).default_agent).toBe("do");

    const permission = config.permission as Record<string, unknown>;
    expect(permission.delegate_task).toBe("deny");

    expect(agents.createAgents).toHaveBeenCalled();
  });

  test("does not inject builtin agents when inject_agents_globally is false", async () => {
    const pluginConfig: GhostwireConfig = {
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

    await handler(config);

    const agentConfig = config.agent as Record<string, unknown>;
    expect(agentConfig.do).toBeUndefined();
    expect(agentConfig.research).toBeUndefined();
    expect((config as { default_agent?: string }).default_agent).toBeUndefined();

    const permission = config.permission as Record<string, unknown>;
    expect(permission.delegate_task).toBeUndefined();

    expect(agents.createAgents).not.toHaveBeenCalled();
  });

  test("applies runtime permissions for do/research", async () => {
    const pluginConfig: GhostwireConfig = {};
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

    await handler(config);

    const agentConfig = config.agent as Record<string, { permission?: Record<string, unknown> }>;
    expect(agentConfig.do.permission?.delegate_task).toBe("allow");
    expect(agentConfig.do.permission?.call_grid_agent).toBe("deny");
    expect(agentConfig.research.permission?.delegate_task).toBe("deny");
    expect(agentConfig.research.permission?.call_grid_agent).toBe("deny");
  });
});

describe("resolveCategoryConfig", () => {
  test("resolves builtin category", () => {
    const config = resolveCategoryConfig("ultrabrain");
    expect(config).toBeDefined();
    expect(typeof config?.model).toBe("string");
    expect(config?.model?.length).toBeGreaterThan(0);
  });

  test("user categories override builtin categories", () => {
    const userCategories: Record<string, CategoryConfig> = {
      ultrabrain: {
        model: "openai/gpt-5.2",
        temperature: 0.1,
      },
    };

    const config = resolveCategoryConfig("ultrabrain", userCategories);

    expect(config?.model).toBe("openai/gpt-5.2");
    expect(config?.temperature).toBe(0.1);
  });

  test("returns undefined for unknown category", () => {
    const config = resolveCategoryConfig("nonexistent-category");
    expect(config).toBeUndefined();
  });
});
