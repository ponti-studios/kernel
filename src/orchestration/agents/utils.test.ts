import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createAgents, buildAgent, createAgentToolRestrictions } from "./utils";
import type { AgentConfig } from "@opencode-ai/sdk";
import { clearSkillCache } from "../../execution/features/opencode-skill-loader/skill-content";
import * as connectedProvidersCache from "../../platform/opencode/connected-providers-cache";

const TEST_DEFAULT_MODEL = "anthropic/claude-opus-4-5";

describe("createAgents two-agent runtime", () => {
  let cacheSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    clearSkillCache();
    cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null);
  });

  afterEach(() => {
    cacheSpy.mockRestore?.();
  });

  test("creates only do and research with system default model", async () => {
    const agents = await createAgents({ systemDefaultModel: TEST_DEFAULT_MODEL });

    expect(Object.keys(agents).sort()).toEqual(["do", "research"]);
    expect(agents.do.model).toBe(TEST_DEFAULT_MODEL);
    expect(agents.research.model).toBe(TEST_DEFAULT_MODEL);
  });

  test("applies GPT override behavior for do", async () => {
    const agents = await createAgents({
      systemDefaultModel: TEST_DEFAULT_MODEL,
      agentOverrides: {
        do: { model: "github-copilot/gpt-5.2" },
      },
    });

    expect(agents.do.model).toBe("github-copilot/gpt-5.2");
    expect(agents.do.reasoningEffort).toBe("medium");
    expect(agents.do.thinking).toBeUndefined();
  });

  test("applies category override for research", async () => {
    const agents = await createAgents({
      systemDefaultModel: TEST_DEFAULT_MODEL,
      agentOverrides: {
        research: { category: "ultrabrain" },
      },
    });

    expect(agents.research.model).toBeDefined();
    expect(typeof agents.research.model).toBe("string");
  });

  test("respects disabledAgents", async () => {
    const agents = await createAgents({
      systemDefaultModel: TEST_DEFAULT_MODEL,
      disabledAgents: ["research"],
    });

    expect(agents.do).toBeDefined();
    expect(agents.research).toBeUndefined();
  });

  test("returns empty config when no default model and no provider cache", async () => {
    const agents = await createAgents({});

    expect(agents).toEqual({});
  });
});

describe("buildAgent", () => {
  const TEST_MODEL = "anthropic/claude-opus-4-5";

  beforeEach(() => {
    clearSkillCache();
  });

  test("applies category model when base model is absent", () => {
    const source =
      () =>
        ({
          description: "test",
          category: "visual-engineering",
          prompt: "Base prompt",
        }) as AgentConfig;

    const built = buildAgent(source, TEST_MODEL);

    expect(built.model).toBeDefined();
    expect(typeof built.model).toBe("string");
    expect(built.prompt).toContain("Base prompt");
  });

  test("prepends skill content", () => {
    const source =
      () =>
        ({
          description: "test",
          skills: ["frontend-ui-ux"],
          prompt: "Agent prompt",
        }) as AgentConfig;

    const built = buildAgent(source, TEST_MODEL);

    expect(built.prompt).toContain("Role: Designer-Turned-Developer");
    expect(built.prompt).toContain("Agent prompt");
  });

  test("falls back to provided model when category is unknown", () => {
    const source =
      () =>
        ({
          description: "test",
          category: "unknown-category",
          prompt: "Base prompt",
        }) as AgentConfig;

    const built = buildAgent(source, TEST_MODEL);

    expect(built.model).toBe(TEST_MODEL);
  });
});

describe("createAgentToolRestrictions", () => {
  test("denies specified tools", () => {
    const restrictions = createAgentToolRestrictions(["task", "delegate_task"]);

    expect(restrictions.permission).toEqual({ task: "deny", delegate_task: "deny" });
  });
});
