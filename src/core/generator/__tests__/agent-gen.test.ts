import { describe, it, expect } from "bun:test";
import {
  generateAgentForTool,
  generateAgentsForTool,
  generateAgentsForAllTools,
} from "../agent-gen.js";
import { opencodeAdapter, claudeAdapter, cursorAdapter } from "../../adapters/index.js";
import type { AgentTemplate } from "../../templates/types.js";

const testAgent: AgentTemplate = {
  name: "plan",
  description: "Pre-implementation planning agent",
  instructions: "You are a planning agent.",
  license: "MIT",
  compatibility: "Works with all spec workflows",
  metadata: { author: "spec", version: "1.0", category: "Orchestration", tags: ["planning"] },
  defaultTools: ["read", "search"],
};

const testAgent2: AgentTemplate = {
  name: "review",
  description: "Quality review agent",
  instructions: "You are a review agent.",
  license: "MIT",
  compatibility: "Works with all projects",
  metadata: { author: "spec", version: "1.0", category: "Orchestration", tags: ["review"] },
  defaultTools: ["read"],
  references: [{ relativePath: "references/common/python.md", content: "# Python Review\n" }],
};

describe("generateAgentForTool — claude (has getAgentPath + formatAgent)", () => {
  it("uses getAgentPath for the file path", () => {
    const result = generateAgentForTool(testAgent, claudeAdapter, "1.0.0");
    expect(result[0].path).toBe(claudeAdapter.getAgentPath!(testAgent.name));
  });

  it("claude agents land at .claude/agents/<name>.md", () => {
    const result = generateAgentForTool(testAgent, claudeAdapter, "1.0.0");
    expect(result[0].path).toBe(".claude/agents/plan.md");
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

describe("generateAgentForTool — opencode (has getAgentPath and formatAgent)", () => {
  it("uses getAgentPath for opencode agents", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].path).toBe(opencodeAdapter.getAgentPath!(testAgent.name));
  });

  it("uses formatAgent for opencode agents", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].content).toBe(opencodeAdapter.formatAgent!(testAgent, "1.0.0"));
  });

  it("opencode agent path is in .opencode/agents/", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].path).toBe(".opencode/agents/plan.md");
  });

  it("opencode agent content includes description frontmatter", () => {
    const result = generateAgentForTool(testAgent, opencodeAdapter, "1.0.0");
    expect(result[0].content).toContain("description:");
    expect(result[0].content).toContain("Pre-implementation planning agent");
  });

  it("emits reference files next to the main agent file", () => {
    const result = generateAgentForTool(testAgent2, opencodeAdapter, "1.0.0");
    expect(result).toHaveLength(2);
    expect(result[1].path).toBe(".opencode/agents/references/common/python.md");
    expect(result[1].content).toBe("# Python Review\n");
  });
});

describe("generateAgentForTool — cursor (no native agent support)", () => {
  it("returns no files for tools without agent support", () => {
    const result = generateAgentForTool(testAgent, cursorAdapter, "1.0.0");
    expect(result).toHaveLength(0);
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
    expect(results[0].path).toBe(".claude/agents/plan.md");
    expect(results[1].path).toBe(".claude/agents/review.md");
    expect(results[2].path).toBe(".claude/agents/references/common/python.md");
  });

  it("returns empty array for empty templates", () => {
    const results = generateAgentsForTool([], claudeAdapter, "1.0.0");
    expect(results).toHaveLength(0);
  });
});

describe("generateAgentsForAllTools", () => {
  const templates = [testAgent, testAgent2];
  const adapters = [opencodeAdapter, claudeAdapter, cursorAdapter];

  it("skips tools without native agent support", () => {
    const results = generateAgentsForAllTools(templates, adapters, "1.0.0");
    expect(results).toHaveLength(6);
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
