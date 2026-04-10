/**
 * Gemini adapter
 *
 * Formats skills and agents for Google Gemini CLI.
 *
 * Directory conventions (open agent skills standard + Gemini-native):
 * - Skills:         .gemini/skills/<name>/SKILL.md
 * - Agents:         .gemini/agents/<name>.md  (YAML frontmatter + markdown body)
 *
 * Agent frontmatter fields:
 * - name           display name
 * - description    required; explains what the agent does
 * - tools          optional allowlist
 * - model          optional model override (e.g. gemini-2.5-pro)
 *
 * Skills are discovered and invoked via description matching — no preloading.
 *
 * Reference: https://developers.google.com/gemini/cli/docs/agents
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";
import {
  escapeYamlValue,
  formatBaseSkillFrontmatter,
  closeSkillFrontmatter,
  formatCompatibilityCommand,
  formatAgentBody,
} from "./shared.js";

export const geminiAdapter: ToolCommandAdapter = {
  toolId: "gemini",
  toolName: "Gemini",
  skillsDir: ".gemini",

  getAgentPath(agentName: string): string {
    return path.join(".gemini", "agents", `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".gemini", "skills", skillName, "SKILL.md");
  },

  getCommandPath(commandName: string): string {
    return path.join(".gemini", "commands", `${commandName}.md`);
  },

  formatAgent(template: AgentTemplate, _version: string): string {
    const frontmatterLines = [
      `name: ${template.name}`,
      `description: ${escapeYamlValue(template.description)}`,
    ];
    if (template.model) {
      frontmatterLines.push(`model: ${template.model}`);
    }
    return `---\n${frontmatterLines.join("\n")}\n---\n\n${formatAgentBody(template)}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(formatBaseSkillFrontmatter(template, version), template.instructions);
  },

  formatCommand(template: CommandTemplate, version: string): string {
    return formatCompatibilityCommand(template, version, "Gemini");
  },
};
