import { describe, it, expect } from "bun:test";
import {
  opencodeAdapter,
  claudeAdapter,
  codexAdapter,
  githubCopilotAdapter,
  geminiAdapter,
  cursorAdapter,
  type ToolCommandAdapter,
} from "../index.js";
import type { AgentTemplate } from "../../templates/types.js";

const allAdapters: ToolCommandAdapter[] = [
  opencodeAdapter,
  claudeAdapter,
  codexAdapter,
  githubCopilotAdapter,
  geminiAdapter,
  cursorAdapter,
];

const testSkillTemplate = {
  name: "spec-planner",
  description: "Planning agent",
  instructions: "You are a planner agent.",
  license: "MIT",
  compatibility: "Works with spec CLI",
  metadata: {
    author: "spec",
    version: "1.0.0",
    category: "Orchestration",
    tags: ["planning"],
  },
};

const testAgentTemplate: AgentTemplate = {
  name: "plan",
  description: "Pre-implementation planning agent",
  instructions: "You are a planning agent.",
  license: "MIT",
  compatibility: "Works with all spec workflows",
  metadata: { author: "spec", version: "1.0", category: "Orchestration", tags: ["planning"] },
  defaultTools: ["read", "search"],
  availableSkills: ["spec-git-master", "spec-design"],
};

const nativeAgentSupport: Record<string, boolean> = {
  opencode: true,
  claude: true,
  codex: true,
  "github-copilot": true,
  gemini: true,
  cursor: false,
};

describe("Adapter Registry", () => {
  it("has all 6 adapters", () => {
    expect(allAdapters).toHaveLength(6);
  });

  it("each adapter has unique toolId", () => {
    const toolIds = allAdapters.map((a) => a.toolId);
    const uniqueIds = new Set(toolIds);
    expect(uniqueIds.size).toBe(6);
  });

  it("native agent support is explicit and consistent", () => {
    for (const adapter of allAdapters) {
      const supportsAgents = Boolean(adapter.getAgentPath && adapter.formatAgent);
      expect(supportsAgents).toBe(nativeAgentSupport[adapter.toolId]);
    }
  });

  it("never exposes only one half of native agent support", () => {
    for (const adapter of allAdapters) {
      expect(Boolean(adapter.getAgentPath)).toBe(Boolean(adapter.formatAgent));
    }
  });
});

describe("OpenCode Adapter", () => {
  it("uses .opencode directory", () => {
    expect(opencodeAdapter.skillsDir).toBe(".opencode");
  });

  it("generates correct skill path", () => {
    const path = opencodeAdapter.getSkillPath("spec-planner");
    expect(path).toBe(".opencode/skills/spec-planner/SKILL.md");
  });

  it("formats skill with frontmatter", () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, "1.0.0");
    expect(result).toContain("---");
    expect(result).toContain("name: spec-planner");
    expect(result).toContain('generatedBy: "1.0.0"');
  });

  it("uses .opencode/agents/<name>.md path for agents", () => {
    expect(opencodeAdapter.getAgentPath!("plan")).toBe(".opencode/agents/plan.md");
  });

  it("generates YAML frontmatter with description for agents", () => {
    const result = opencodeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    const frontmatter = result.split("---")[1];
    expect(frontmatter).toContain("description:");
    expect(frontmatter).toContain("Pre-implementation planning agent");
  });

  it("maps availableSkills to ## Available skills in body", () => {
    const result = opencodeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    const body = result.split("---")[2];
    expect(body).toContain("## Available skills");
    expect(body).toContain("- spec-git-master");
    expect(body).toContain("- spec-design");
  });

  it("omits ## sections when fields are empty", () => {
    const result = opencodeAdapter.formatAgent!(
      { ...testAgentTemplate, availableSkills: [] },
      "1.0.0",
    );
    const body = result.split("---")[2];
    expect(body).not.toContain("## Available commands");
    expect(body).not.toContain("## Available skills");
  });
});

describe("Claude Adapter", () => {
  it("uses .claude directory", () => {
    expect(claudeAdapter.skillsDir).toBe(".claude");
  });

  it("generates correct skill path", () => {
    const path = claudeAdapter.getSkillPath("spec-planner");
    expect(path).toBe(".claude/skills/spec-planner/SKILL.md");
  });
});

describe("GitHub Copilot Adapter", () => {
  it("uses .github directory", () => {
    expect(githubCopilotAdapter.skillsDir).toBe(".github");
  });

  it("generates correct skill path", () => {
    const path = githubCopilotAdapter.getSkillPath("spec-planner");
    expect(path).toBe(".github/skills/spec-planner/SKILL.md");
  });
});

describe("Cursor Adapter", () => {
  it("uses .cursor directory", () => {
    expect(cursorAdapter.skillsDir).toBe(".cursor");
  });

  it("generates correct skill path", () => {
    expect(cursorAdapter.getSkillPath("spec-planner")).toBe(".cursor/skills/spec-planner/SKILL.md");
  });
});

describe("Gemini Adapter", () => {
  it("uses .gemini directory", () => {
    expect(geminiAdapter.skillsDir).toBe(".gemini");
  });

  it("generates correct skill path", () => {
    expect(geminiAdapter.getSkillPath("spec-planner")).toBe(".gemini/skills/spec-planner/SKILL.md");
  });

  it("generates correct agent path", () => {
    expect(geminiAdapter.getAgentPath!("plan")).toBe(".gemini/agents/plan.md");
  });
});

// ============================================================================
// Claude adapter — detailed formatting
// ============================================================================

describe("Claude formatAgent", () => {
  it("includes name, description, and tools fields", () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    expect(result).toContain("name:");
    expect(result).toContain("description:");
    expect(result).toContain("tools:");
    // model defaults to inherit — not emitted unless template sets it
    expect(result).not.toContain("model: sonnet");
  });

  it("emits model field only when template specifies one", () => {
    const withModel = claudeAdapter.formatAgent!({ ...testAgentTemplate, model: "sonnet" }, "1.0.0");
    expect(withModel).toContain("model: sonnet");
    const withoutModel = claudeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    expect(withoutModel).not.toContain("model:");
  });

  it("maps read → Read", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, defaultTools: ["read"] },
      "1.0.0",
    );
    expect(result).toContain("Read");
  });

  it("maps search → Grep, Glob", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, defaultTools: ["search"] },
      "1.0.0",
    );
    expect(result).toContain("Grep");
    expect(result).toContain("Glob");
  });

  it("maps edit → Edit, Write", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, defaultTools: ["edit"] },
      "1.0.0",
    );
    expect(result).toContain("Edit");
    expect(result).toContain("Write");
  });

  it("maps web → WebSearch, WebFetch", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, defaultTools: ["web"] },
      "1.0.0",
    );
    expect(result).toContain("WebSearch");
    expect(result).toContain("WebFetch");
  });

  it("maps task → Bash", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, defaultTools: ["task"] },
      "1.0.0",
    );
    expect(result).toContain("Bash");
  });

  it("falls back to Read, Grep, Glob when defaultTools is empty", () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: [] }, "1.0.0");
    expect(result).toContain("Read, Grep, Glob");
  });

  it("falls back to Read, Grep, Glob when defaultTools is undefined", () => {
    const { defaultTools: _, ...rest } = testAgentTemplate;
    const result = claudeAdapter.formatAgent!(rest, "1.0.0");
    expect(result).toContain("Read, Grep, Glob");
  });

  it("includes instructions in body", () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    expect(result).toContain("You are a planning agent.");
  });

  it("maps availableSkills to skills: YAML frontmatter", () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    const frontmatter = result.split("---")[1];
    expect(frontmatter).toContain("skills:");
    expect(frontmatter).toContain("spec-git-master");
    expect(frontmatter).toContain("spec-design");
  });

  it("does not add ## Available skills section to agent body", () => {
    // skills are preloaded via skills: frontmatter; a body section is redundant
    const result = claudeAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    const body = result.split("---")[2];
    expect(body).not.toContain("## Available skills");
  });

  it("omits skills: frontmatter when availableSkills is empty", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, availableSkills: [] },
      "1.0.0",
    );
    const frontmatter = result.split("---")[1];
    expect(frontmatter).not.toContain("skills:");
  });

  it("emits permissionMode when set", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, permissionMode: "acceptEdits" },
      "1.0.0",
    );
    expect(result).toContain("permissionMode: acceptEdits");
  });

  it("emits disallowedTools when set", () => {
    const result = claudeAdapter.formatAgent!(
      { ...testAgentTemplate, disallowedTools: ["Write", "Edit"] },
      "1.0.0",
    );
    expect(result).toContain("disallowedTools: Write, Edit");
  });
});

describe("Claude getAgentPath", () => {
  it("returns .claude/agents/<name>.md", () => {
    expect(claudeAdapter.getAgentPath!("plan")).toBe(".claude/agents/plan.md");
    expect(claudeAdapter.getAgentPath!("review")).toBe(".claude/agents/review.md");
  });
});

// ============================================================================
// Codex adapter — TOML agent format
// ============================================================================

describe("Codex formatAgent", () => {
  it("uses .codex/agents/<name>.toml path", () => {
    expect(codexAdapter.getAgentPath!("plan")).toBe(".codex/agents/plan.toml");
    expect(codexAdapter.getAgentPath!("review")).toBe(".codex/agents/review.toml");
  });

  it("generates TOML with name and description", () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    expect(result).toContain('name = "plan"');
    expect(result).toContain('description = "Pre-implementation planning agent"');
  });

  it("outputs instructions as TOML developer_instructions multiline string", () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    // Must be valid TOML — no backtick fences
    expect(result).not.toContain("```");
    expect(result).toContain('developer_instructions = """');
    expect(result).toContain("You are a planning agent.");
  });

  it("maps availableSkills to [[skills.config]] entries", () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    expect(result).toContain("[[skills.config]]");
    expect(result).toContain(".codex/skills/spec-git-master/SKILL.md");
    expect(result).toContain(".codex/skills/spec-design/SKILL.md");
  });

  it("omits [[skills.config]] when availableSkills is empty", () => {
    const result = codexAdapter.formatAgent!(
      { ...testAgentTemplate, availableSkills: [] },
      "1.0.0",
    );
    expect(result).not.toContain("[[skills.config]]");
  });
});

describe("Codex formatSkill", () => {
  it("uses .codex/skills/<name>/SKILL.md path", () => {
    expect(codexAdapter.getSkillPath("spec-git-master")).toBe(
      ".codex/skills/spec-git-master/SKILL.md",
    );
  });

  it("includes name and description in frontmatter", () => {
    const result = codexAdapter.formatSkill(testSkillTemplate as any, "1.0.0");
    expect(result).toContain("name: spec-planner");
    expect(result).toContain("description: Planning agent");
  });

  it("includes generatedBy version", () => {
    const result = codexAdapter.formatSkill(testSkillTemplate as any, "1.0.0");
    expect(result).toContain('generatedBy: "1.0.0"');
  });
});

// ============================================================================
// GitHub Copilot adapter — .agent.md format
// ============================================================================

describe("GitHub Copilot formatAgent", () => {
  it("uses .github/agents/<name>.agent.md path", () => {
    expect(githubCopilotAdapter.getAgentPath!("plan")).toBe(".github/agents/plan.agent.md");
    expect(githubCopilotAdapter.getAgentPath!("review")).toBe(".github/agents/review.agent.md");
  });

  it("generates YAML frontmatter with name and description", () => {
    const result = githubCopilotAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    const frontmatter = result.split("---")[1];
    expect(frontmatter).toContain("name: plan");
    expect(frontmatter).toContain("description:");
  });

  it("maps availableSkills to ## Available skills in body", () => {
    const result = githubCopilotAdapter.formatAgent!(testAgentTemplate, "1.0.0");
    const body = result.split("---")[2];
    expect(body).toContain("## Available skills");
    expect(body).toContain("- spec-git-master");
    expect(body).toContain("- spec-design");
  });

  it("omits ## Available skills when availableSkills is empty", () => {
    const result = githubCopilotAdapter.formatAgent!(
      { ...testAgentTemplate, availableSkills: [] },
      "1.0.0",
    );
    const body = result.split("---")[2];
    expect(body).not.toContain("## Available skills");
  });
});
