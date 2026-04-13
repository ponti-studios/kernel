import path from "path";
import type { AgentTemplate, SkillTemplate } from "../templates/types.js";
import {
  closeSkillFrontmatter,
  formatBaseSkillFrontmatter,
  formatAgentBody,
  escapeYamlValue,
} from "./shared.js";
import type { ToolCommandAdapter } from "./types.js";

export const opencodeAdapter: ToolCommandAdapter = {
  toolId: "opencode",
  toolName: "OpenCode",
  skillsDir: ".opencode",

  getAgentPath(agentName: string): string {
    return path.join(".config", "opencode", "agents", `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".opencode", "skills", skillName, "SKILL.md");
  },

  formatAgent(template: AgentTemplate): string {
    const frontmatterLines = [`description: ${escapeYamlValue(template.description)}`, "mode: subagent"];

    if (template.model) {
      frontmatterLines.push(`model: ${template.model}`);
    }

    return `---\n${frontmatterLines.join("\n")}\n---\n\n${formatAgentBody(template)}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(
      formatBaseSkillFrontmatter(template, version),
      template.instructions,
    );
  },
};
