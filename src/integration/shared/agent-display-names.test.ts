import { describe, it, expect } from "bun:test";
import { AGENT_DISPLAY_NAMES, getAgentDisplayName } from "./agent-display-names";

describe("getAgentDisplayName", () => {
  it("returns display name for operator", () => {
    // #given config key "operator"
    const configKey = "operator";

    // #when getAgentDisplayName called
    const result = getAgentDisplayName(configKey);

    // #then returns "operator"
    expect(result).toBe("operator");
  });

  it("returns original key for unknown agents (fallback)", () => {
    // #given config key "custom-agent"
    const configKey = "custom-agent";

    // #when getAgentDisplayName called
    const result = getAgentDisplayName(configKey);

    // #then returns "custom-agent" (original key unchanged)
    expect(result).toBe("custom-agent");
  });

  it("returns display name for researcher-codebase", () => {
    // #given config key "researcher-codebase"
    const configKey = "researcher-codebase";

    // #when getAgentDisplayName called
    const result = getAgentDisplayName(configKey);

    // #then returns "researcher-codebase"
    expect(result).toBe("researcher-codebase");
  });

  it("returns display name for researcher-world", () => {
    // #given config key "researcher-world"
    const configKey = "researcher-world";

    // #when getAgentDisplayName called
    const result = getAgentDisplayName(configKey);

    // #then returns "researcher-world"
    expect(result).toBe("researcher-world");
  });
});

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all 29 renamed agents", () => {
    // #given all agent names from Phases 1-6
    const expectedAgents = [
      // Phase 1
      "operator",
      "orchestrator",
      "planner",
      "executor",
      // Phase 2
      "reviewer-rails",
      "reviewer-python",
      "reviewer-typescript",
      "reviewer-rails-dh",
      "reviewer-simplicity",
      // Phase 3
      "researcher-docs",
      "researcher-learnings",
      "researcher-practices",
      "researcher-git",
      "analyzer-media",
      // Phase 4
      "designer-flow",
      "designer-sync",
      "designer-iterator",
      "analyzer-design",
      "designer-builder",
      // Phase 5
      "advisor-architecture",
      "advisor-strategy",
      "validator-audit",
      "validator-deployment",
      "writer-readme",
      "writer-gem",
      "editor-style",
      // Phase 6
      "researcher-codebase",
      "researcher-world",
    ];

    // #when checking the constant
    // #then contains all agents
    for (const agent of expectedAgents) {
      expect(AGENT_DISPLAY_NAMES[agent]).toBeDefined();
      expect(AGENT_DISPLAY_NAMES[agent]).toBe(agent);
    }
  });
});
