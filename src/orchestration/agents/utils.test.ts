import { describe, test, expect, beforeEach, spyOn, afterEach } from "bun:test";
import { createBuiltinAgents, createAgentToolRestrictions } from "./utils";
import type { AgentConfig } from "@opencode-ai/sdk";
import { clearSkillCache } from "../../execution/features/opencode-skill-loader/skill-content";
import * as connectedProvidersCache from "../../platform/opencode/connected-providers-cache";
import * as modelAvailability from "../../platform/opencode/model-availability";

const TEST_DEFAULT_MODEL = "anthropic/claude-opus-4-5";

describe("createBuiltinAgents with model overrides", () => {
  test("operator with default model has thinking config", async () => {
    // #given - no overrides, using systemDefaultModel

    // #when
    const agents = await createBuiltinAgents({ systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then
    expect(agents["operator"].model).toBe("anthropic/claude-opus-4-5");
    expect(agents["operator"].thinking).toEqual({ type: "enabled", budgetTokens: 32000 });
    expect(agents["operator"].reasoningEffort).toBeUndefined();
  });

  test("operator with GPT model override has reasoningEffort, no thinking", async () => {
    // #given
    const overrides = {
      "operator": { model: "github-copilot/gpt-5.2" },
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then
    expect(agents["operator"].model).toBe("github-copilot/gpt-5.2");
    expect(agents["operator"].reasoningEffort).toBe("medium");
    expect(agents["operator"].thinking).toBeUndefined();
  });

  test("operator uses system default when no availableModels provided", async () => {
    // #given
    const systemDefaultModel = "anthropic/claude-opus-4-5";

    // #when
    const agents = await createBuiltinAgents({ systemDefaultModel });

    // #then - falls back to system default when no availability match
    expect(agents["operator"].model).toBe("anthropic/claude-opus-4-5");
    expect(agents["operator"].thinking).toEqual({ type: "enabled", budgetTokens: 32000 });
    expect(agents["operator"].reasoningEffort).toBeUndefined();
  });

  test("Seer Advisor uses connected provider fallback when availableModels is empty and cache exists", async () => {
    // #given - connected providers cache has "openai", which matches advisor-plan's first fallback entry
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue([
      "openai",
    ]);

    // #when
    const agents = await createBuiltinAgents({ systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - seerAdvisor resolves via connected cache fallback to openai/gpt-5.2 (not system default)
    expect(agents["advisor-plan"].model).toBe("openai/gpt-5.2");
    expect(agents["advisor-plan"].reasoningEffort).toBe("medium");
    expect(agents["advisor-plan"].thinking).toBeUndefined();
    cacheSpy.mockRestore?.();
  });

  test("Seer Advisor created without model field when no cache exists (first run scenario)", async () => {
    // #given - no cache at all (first run)
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(
      null,
    );

    // #when
    const agents = await createBuiltinAgents({ systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - seerAdvisor should be created with system default model (fallback to systemDefaultModel)
    expect(agents["advisor-plan"]).toBeDefined();
    expect(agents["advisor-plan"].model).toBe(TEST_DEFAULT_MODEL);
    cacheSpy.mockRestore?.();
  });

  test("Seer Advisor with GPT model override has reasoningEffort, no thinking", async () => {
    // #given
    const overrides = {
      "advisor-plan": { model: "openai/gpt-5.2" },
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then
    expect(agents["advisor-plan"].model).toBe("openai/gpt-5.2");
    expect(agents["advisor-plan"].reasoningEffort).toBe("medium");
    expect(agents["advisor-plan"].textVerbosity).toBeUndefined();
    expect(agents["advisor-plan"].thinking).toBeUndefined();
  });

  test("Seer Advisor with Claude model override has thinking, no reasoningEffort", async () => {
    // #given
    const overrides = {
      "advisor-plan": { model: "anthropic/claude-sonnet-4" },
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then
    expect(agents["advisor-plan"].model).toBe("anthropic/claude-sonnet-4");
    expect(agents["advisor-plan"].thinking).toEqual({ type: "enabled", budgetTokens: 32000 });
    expect(agents["advisor-plan"].reasoningEffort).toBeUndefined();
    expect(agents["advisor-plan"].textVerbosity).toBeUndefined();
  });

  test("non-model overrides are still applied after factory rebuild", async () => {
    // #given
    const overrides = {
      "operator": { model: "github-copilot/gpt-5.2", temperature: 0.5 },
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then
    expect(agents["operator"].model).toBe("github-copilot/gpt-5.2");
    expect(agents["operator"].temperature).toBe(0.5);
  });
});

describe("createBuiltinAgents without systemDefaultModel", () => {
  test("agents created via connected cache fallback even without systemDefaultModel", async () => {
    // #given - connected cache has "openai", which matches advisor-plan's fallback chain
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue([
      "openai",
    ]);

    // #when
    const agents = await createBuiltinAgents({});

    // #then - connected cache enables model resolution despite no systemDefaultModel
    expect(agents["advisor-plan"]).toBeDefined();
    expect(agents["advisor-plan"].model).toBe("openai/gpt-5.2");
    cacheSpy.mockRestore?.();
  });

  test("agents NOT created when no cache and no systemDefaultModel (first run without defaults)", async () => {
    // #given
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(
      null,
    );

    // #when
    const agents = await createBuiltinAgents({});

    // #then
    expect(agents["advisor-plan"]).toBeUndefined();
    cacheSpy.mockRestore?.();
  });

  test("operator created via connected cache fallback even without systemDefaultModel", async () => {
    // #given - connected cache has "anthropic", which matches operator's first fallback entry
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue([
      "anthropic",
    ]);

    // #when
    const agents = await createBuiltinAgents({});

    // #then - connected cache enables model resolution despite no systemDefaultModel
    expect(agents["operator"]).toBeDefined();
    expect(agents["operator"].model).toBe("anthropic/claude-opus-4-5");
    cacheSpy.mockRestore?.();
  });
});

describe("buildAgent with category and skills", () => {
  const { buildAgent } = require("./utils");
  const TEST_MODEL = "anthropic/claude-opus-4-5";

  beforeEach(() => {
    clearSkillCache();
  });

  test("agent with category inherits category settings", () => {
    // #given - agent factory that sets category but no model
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "visual-engineering",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then - category's built-in model is applied
    expect(agent.model).toBe("google/gemini-3-pro");
  });

  test("agent with category and existing model keeps existing model", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "visual-engineering",
          model: "custom/model",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then - explicit model takes precedence over category
    expect(agent.model).toBe("custom/model");
  });

  test("agent with category inherits variant", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "custom-category",
        }) as AgentConfig,
    };

    const categories = {
      "custom-category": {
        model: "openai/gpt-5.2",
        variant: "xhigh",
      },
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL, categories);

    // #then
    expect(agent.model).toBe("openai/gpt-5.2");
    expect(agent.variant).toBe("xhigh");
  });

  test("agent with skills has content prepended to prompt", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend-ui-ux"],
          prompt: "Original prompt content",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer");
    expect(agent.prompt).toContain("Original prompt content");
    expect(agent.prompt).toMatch(/Designer-Turned-Developer[\s\S]*Original prompt content/s);
  });

  test("agent with multiple skills has all content prepended", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend-ui-ux"],
          prompt: "Agent prompt",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer");
    expect(agent.prompt).toContain("Agent prompt");
  });

  test("agent without category or skills works as before", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          model: "custom/model",
          temperature: 0.5,
          prompt: "Base prompt",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then
    expect(agent.model).toBe("custom/model");
    expect(agent.temperature).toBe(0.5);
    expect(agent.prompt).toBe("Base prompt");
  });

  test("agent with category and skills applies both", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "ultrabrain",
          skills: ["frontend-ui-ux"],
          prompt: "Task description",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then - category's built-in model and skills are applied
    expect(agent.model).toBe("openai/gpt-5.2-codex");
    expect(agent.variant).toBe("xhigh");
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer");
    expect(agent.prompt).toContain("Task description");
  });

  test("agent with non-existent category has no effect", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "non-existent",
          prompt: "Base prompt",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then
    // Note: The factory receives model, but if category doesn't exist, it's not applied
    // The agent's model comes from the factory output (which doesn't set model)
    expect(agent.model).toBe(TEST_MODEL);
    expect(agent.prompt).toBe("Base prompt");
  });

  test("agent with non-existent skills only prepends found ones", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend-ui-ux", "non-existent-skill"],
          prompt: "Base prompt",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer");
    expect(agent.prompt).toContain("Base prompt");
  });

  test("agent with empty skills array keeps original prompt", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: [],
          prompt: "Base prompt",
        }) as AgentConfig,
    };

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then
    expect(agent.prompt).toBe("Base prompt");
  });

  test("agent with agent-browser skill resolves when browserProvider is set", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["agent-browser"],
          prompt: "Base prompt",
        }) as AgentConfig,
    };

    // #when - browserProvider is "agent-browser"
    const agent = buildAgent(
      source["test-agent"],
      TEST_MODEL,
      undefined,
      undefined,
      "agent-browser",
    );

    // #then - agent-browser skill content should be in prompt
    expect(agent.prompt).toContain("agent-browser");
    expect(agent.prompt).toContain("Base prompt");
  });

  test("agent with agent-browser skill NOT resolved when browserProvider not set", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["agent-browser"],
          prompt: "Base prompt",
        }) as AgentConfig,
    };

    // #when - no browserProvider (defaults to playwright)
    const agent = buildAgent(source["test-agent"], TEST_MODEL);

    // #then - agent-browser skill not found, only base prompt remains
    expect(agent.prompt).toBe("Base prompt");
    expect(agent.prompt).not.toContain("agent-browser open");
  });
});

describe("createAgentToolRestrictions", () => {
  test("returns permission denies for provided tools", () => {
    // #given
    const denyTools = ["task", "delegate_task"];

    // #when
    const restrictions = createAgentToolRestrictions(denyTools);

    // #then
    expect(restrictions.permission).toEqual({ task: "deny", delegate_task: "deny" });
  });
});

describe("override.category expansion in createBuiltinAgents", () => {
  test("standard agent override with category expands category properties", async () => {
    // #given
    const overrides = {
      "advisor-plan": { category: "ultrabrain" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - ultrabrain category: model=openai/gpt-5.2-codex, variant=xhigh
    expect(agents["advisor-plan"]).toBeDefined();
    expect(agents["advisor-plan"].model).toBe("openai/gpt-5.2-codex");
    expect(agents["advisor-plan"].variant).toBe("xhigh");
  });

  test("standard agent override with category AND direct variant - direct wins", async () => {
    // #given - ultrabrain has variant=xhigh, but direct override says "max"
    const overrides = {
      "advisor-plan": { category: "ultrabrain", variant: "max" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - direct variant overrides category variant
    expect(agents["advisor-plan"]).toBeDefined();
    expect(agents["advisor-plan"].variant).toBe("max");
  });

  test("standard agent override with category AND direct reasoningEffort - direct wins", async () => {
    // #given - custom category has reasoningEffort=xhigh, direct override says "low"
    const categories = {
      "test-cat": {
        model: "openai/gpt-5.2",
        reasoningEffort: "xhigh" as const,
      },
    };
    const overrides = {
      "advisor-plan": { category: "test-cat", reasoningEffort: "low" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({
      agentOverrides: overrides,
      systemDefaultModel: TEST_DEFAULT_MODEL,
      categories,
    });

    // #then - direct reasoningEffort wins over category
    expect(agents["advisor-plan"]).toBeDefined();
    expect(agents["advisor-plan"].reasoningEffort).toBe("low");
  });

  test("standard agent override with category applies reasoningEffort from category when no direct override", async () => {
    // #given - custom category has reasoningEffort, no direct reasoningEffort in override
    const categories = {
      "reasoning-cat": {
        model: "openai/gpt-5.2",
        reasoningEffort: "high" as const,
      },
    };
    const overrides = {
      "advisor-plan": { category: "reasoning-cat" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({
      agentOverrides: overrides,
      systemDefaultModel: TEST_DEFAULT_MODEL,
      categories,
    });

    // #then - category reasoningEffort is applied
    expect(agents["advisor-plan"]).toBeDefined();
    expect(agents["advisor-plan"].reasoningEffort).toBe("high");
  });

  test("operator override with category expands category properties", async () => {
    // #given
    const overrides = {
      "operator": { category: "ultrabrain" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - ultrabrain category: model=openai/gpt-5.2-codex, variant=xhigh
    expect(agents["operator"]).toBeDefined();
    expect(agents["operator"].model).toBe("openai/gpt-5.2-codex");
    expect(agents["operator"].variant).toBe("xhigh");
  });

  test("orchestrator override with category expands category properties", async () => {
    // #given
    const overrides = {
      "orchestrator": { category: "ultrabrain" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - ultrabrain category: model=openai/gpt-5.2-codex, variant=xhigh
    expect(agents["orchestrator"]).toBeDefined();
    expect(agents["orchestrator"].model).toBe("openai/gpt-5.2-codex");
    expect(agents["orchestrator"].variant).toBe("xhigh");
  });

  test("override with non-existent category has no effect on config", async () => {
    // #given
    const overrides = {
      "advisor-plan": { category: "non-existent-category" } as any,
    };

    // #when
    const agents = await createBuiltinAgents({ agentOverrides: overrides, systemDefaultModel: TEST_DEFAULT_MODEL });

    // #then - no category-specific variant/reasoningEffort applied from non-existent category
    expect(agents["advisor-plan"]).toBeDefined();
    const agentsWithoutOverride = await createBuiltinAgents({ systemDefaultModel: TEST_DEFAULT_MODEL });
    expect(agents["advisor-plan"].model).toBe(agentsWithoutOverride["advisor-plan"].model);
  });
});

describe("Deadlock prevention - fetchAvailableModels must not receive client", () => {
  test("createBuiltinAgents should call fetchAvailableModels with undefined client to prevent deadlock", async () => {
    // #given - This test ensures we don't regress on issue #1301
    // Passing client to fetchAvailableModels during createBuiltinAgents (called from config handler)
    // causes deadlock:
    // - Plugin init waits for server response (client.provider.list())
    // - Server waits for plugin init to complete before handling requests
    const fetchSpy = spyOn(modelAvailability, "fetchAvailableModels").mockResolvedValue(
      new Set<string>(),
    );
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(
      null,
    );

    const mockClient = {
      provider: { list: () => Promise.resolve({ data: { connected: [] } }) },
      model: { list: () => Promise.resolve({ data: [] }) },
    };

    // #when - Even when client is provided, fetchAvailableModels must be called with undefined
    await createBuiltinAgents({
      systemDefaultModel: TEST_DEFAULT_MODEL,
      client: mockClient, // client is passed but should NOT be forwarded to fetchAvailableModels
    });

    // #then - fetchAvailableModels must be called with undefined as first argument (no client)
    // This prevents the deadlock described in issue #1301
    expect(fetchSpy).toHaveBeenCalled();
    const firstCallArgs = fetchSpy.mock.calls[0];
    expect(firstCallArgs[0]).toBeUndefined();

    fetchSpy.mockRestore?.();
    cacheSpy.mockRestore?.();
  });
});
