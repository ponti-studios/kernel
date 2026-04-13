import { describe, expect, it } from "bun:test";
import { AGENT_NAMES } from "../../../templates/constants.js";
import { claudeAdapter, githubCopilotAdapter, opencodeAdapter } from "../../adapters/index.js";
import type { AgentTemplate } from "../../templates/types.js";
import {
    generateAgentForTool,
    generateAgentsForAllTools,
    generateAgentsForTool,
} from "../agent-gen.js";

const testAgent: AgentTemplate = {
  name: AGENT_NAMES.PLAN,
  description: "Pre-implementation planning agent",
  instructions: "You are a planning agent.",
  license: "MIT",
  compatibility: "Works with all workflows",
  metadata: { author: "project", version: "1.0", category: "Orchestration", tags: ["planning"] },
  defaultTools: ["read", "search"],
};

const testAgent2: AgentTemplate = {
  name: AGENT_NAMES.REVIEW,
  description: "Quality review agent",
  instructions: "You are a review agent.",
  license: "MIT",
  compatibility: "Works with all projects",
  metadata: { author: "project", version: "1.0", category: "Orchestration", tags: ["review"] },
  defaultTools: ["read"],
  references: [{ relativePath: "references/common/example.md", content: "# Example Review\n" }],
};

describe("generateAgentForTool — claude (has getAgentPath + formatAgent)", () => {
  it("uses getAgentPath for the file path", () => {
    const result = generateAgentForTool(testAgent, claudeAdapter, "1.0.0");
    expect(result[0].path).toBe(claudeAdapter.getAgentPath!(testAgent.name));
  });

  it("claude agents land at .claude/agents/<name>.md", () => {
    const result = generateAgentForTool(testAgent, claudeAdapter, "1.0.0");
    expect(result[0].path).toBe(".claude/agents/kernel-plan.md");
  });

  it("uses formatAgent for the file content", () => {
    const result = generateAgentForTool(testAgent, claudeAdapter, "1.0.0");
    expect(result[0].content).toBe(claudeAdapter.formatAgent!(testAgent, "1.0.0"));
  });

  it("claude agent content contains tools: field (model defaults to inherit, not emitted)", () => {
    const result = generateAgentForTool(testAgent, claudeAdapter, "1.0.0");
    expect(result[0].content).toContain("tools:");
    expect(result[0].content).not.toContain("model: sonnet");
  });
});

describe("generateAgentForTool — OpenCode (has getAgentPath and formatAgent)", () => {
  it("uses getAgentPath for OpenCode agents", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].path).toBe(opencodeAdapter.getAgentPath!(testAgent.name));
  });

  it("uses formatAgent for OpenCode agents", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].content).toBe(opencodeAdapter.formatAgent!(testAgent, "1.0.0"));
  });

  it("OpenCode agent path is in .config/opencode/agents/", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].path).toBe(".config/opencode/agents/kernel-plan.md");
  });

  it("OpenCode agent content includes description frontmatter", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].content).toContain("description:");
    expect(result[0].content).toContain("mode: subagent");
  });

  it("emits reference files next to the main agent file", () => {
    const result = generateAgentForTool(testAgent2, opencodeAdapter, "1.0.0");
    expect(result).toHaveLength(2);
    expect(result[1].path).toBe(".config/opencode/agents/references/common/example.md");
    expect(result[1].content).toBe("# Example Review\n");
  });
});

describe("generateAgentsForTool", () => {
  const templates = [testAgent, testAgent2];

  it("returns one file per template", () => {
    const results = generateAgentsForTool(templates, claudeAdapter, "1.0.0");
    expect(results).toHaveLength(3);
  });

  it("each claude agent file has correct path", () => {
    const results = generateAgentsForTool(templates, claudeAdapter, "1.0.0");
    expect(results[0].path).toBe(".claude/agents/kernel-plan.md");
    expect(results[1].path).toBe(".claude/agents/kernel-review.md");
    expect(results[2].path).toBe(".claude/agents/references/common/example.md");
  });

  it("returns empty array for empty templates", () => {
    const results = generateAgentsForTool([], claudeAdapter, "1.0.0");
    expect(results).toHaveLength(0);
  });
});

describe("generateAgentsForAllTools", () => {
  const templates = [testAgent, testAgent2];
  const adapters = [opencodeAdapter, claudeAdapter, githubCopilotAdapter];

  it("returns results for all native agent tools", () => {
    const results = generateAgentsForAllTools(templates, adapters, "1.0.0");
    expect(results).toHaveLength(9);
  });

  it("returns empty array when adapters is empty", () => {
    const results = generateAgentsForAllTools(templates, [], "1.0.0");
    expect(results).toHaveLength(0);
  });

  it("returns empty array when templates is empty", () => {
    const results = generateAgentsForAllTools([], adapters, "1.0.0");
    expect(results).toHaveLength(0);
  });
});
