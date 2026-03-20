import { describe, it, expect } from "bun:test";
import {
  generateSkillForTool,
  generateSkillsForTool,
  generateSkillsForAllTools,
} from "../skill-gen.js";
import { opencodeAdapter, claudeAdapter, cursorAdapter } from "../../adapters/index.js";
import type { SkillTemplate } from "../../templates/types.js";

const testSkill: SkillTemplate = {
  name: "spec-test-skill",
  description: "A test skill for unit testing",
  instructions: "You are a test skill.",
  license: "MIT",
  compatibility: "Requires spec CLI.",
  metadata: {
    author: "spec",
    version: "1.0",
    category: "Testing",
    tags: ["test"],
  },
};

const testSkill2: SkillTemplate = {
  name: "spec-second-skill",
  description: "Another test skill",
  instructions: "You are another skill.",
  license: "MIT",
  compatibility: "Requires spec CLI.",
  references: [{ relativePath: "references/guides/guide.md", content: "# Guide\n" }],
};

describe("generateSkillForTool", () => {
  it("path comes from adapter.getSkillPath(template.name)", () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, "1.0.0");
    expect(result[0].path).toBe(opencodeAdapter.getSkillPath(testSkill.name));
  });

  it("content comes from adapter.formatSkill(template, version)", () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, "1.0.0");
    expect(result[0].content).toBe(opencodeAdapter.formatSkill(testSkill, "1.0.0"));
  });

  it("version string appears as generatedBy in output", () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, "2.3.4");
    expect(result[0].content).toContain('generatedBy: "2.3.4"');
  });

  it("returns a GeneratedFile with path and content", () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, "1.0.0");
    expect(result[0]).toHaveProperty("path");
    expect(result[0]).toHaveProperty("content");
  });

  it("works with claude adapter", () => {
    const result = generateSkillForTool(testSkill, claudeAdapter, "1.0.0");
    expect(result[0].path).toBe(".claude/skills/spec-test-skill/SKILL.md");
  });

  it("emits reference files next to the main skill file", () => {
    const result = generateSkillForTool(testSkill2, opencodeAdapter, "1.0.0");
    expect(result).toHaveLength(2);
    expect(result[1].path).toBe(".opencode/skills/spec-second-skill/references/guides/guide.md");
    expect(result[1].content).toBe("# Guide\n");
  });
});

describe("generateSkillsForTool", () => {
  const templates = [testSkill, testSkill2];

  it("returns one file per template", () => {
    const results = generateSkillsForTool(templates, opencodeAdapter, "1.0.0");
    expect(results).toHaveLength(templates.length + 1);
  });

  it("each file uses the correct skill path", () => {
    const results = generateSkillsForTool(templates, opencodeAdapter, "1.0.0");
    expect(results[0].path).toBe(opencodeAdapter.getSkillPath(testSkill.name));
    expect(results[1].path).toBe(opencodeAdapter.getSkillPath(testSkill2.name));
    expect(results[2].path).toBe(".opencode/skills/spec-second-skill/references/guides/guide.md");
  });

  it("returns empty array for empty templates list", () => {
    const results = generateSkillsForTool([], opencodeAdapter, "1.0.0");
    expect(results).toHaveLength(0);
  });
});

describe("generateSkillsForAllTools", () => {
  const templates = [testSkill, testSkill2];
  const adapters = [opencodeAdapter, claudeAdapter, cursorAdapter];

  it("returns templates.length × adapters.length files", () => {
    const results = generateSkillsForAllTools(templates, adapters, "1.0.0");
    expect(results).toHaveLength(9);
  });

  it("returns empty array when adapters is empty", () => {
    const results = generateSkillsForAllTools(templates, [], "1.0.0");
    expect(results).toHaveLength(0);
  });

  it("returns empty array when templates is empty", () => {
    const results = generateSkillsForAllTools([], adapters, "1.0.0");
    expect(results).toHaveLength(0);
  });

  it("each file has a non-empty path and content", () => {
    const results = generateSkillsForAllTools(templates, adapters, "1.0.0");
    for (const file of results) {
      expect(file.path.length).toBeGreaterThan(0);
      expect(file.content.length).toBeGreaterThan(0);
    }
  });
});
