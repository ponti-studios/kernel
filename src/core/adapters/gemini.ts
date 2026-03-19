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
import type { AgentTemplate, SkillTemplate } from "../templates/types.js";

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  return value;
}

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

  formatAgent(template: AgentTemplate, version: string): string {
    const bodySections: string[] = [template.instructions];

    if (template.availableSkills && template.availableSkills.length > 0) {
      bodySections.push(
        `## Related skills\n\n${template.availableSkills.map((s) => `- ${s}`).join("\n")}`,
      );
    }

    const frontmatterLines = [
      `name: ${template.name}`,
      `description: ${escapeYamlValue(template.description)}`,
    ];

    if (template.model) {
      frontmatterLines.push(`model: ${template.model}`);
    }

    return `---\n${frontmatterLines.join("\n")}\n---\n\n${bodySections.join("\n\n")}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    const lines = [
      "---",
      `name: ${template.name}`,
      `description: ${template.description}`,
      `license: ${template.license || "MIT"}`,
      `compatibility: ${template.compatibility || "Requires jinn CLI."}`,
      "metadata:",
      `  author: ${template.metadata?.author || "jinn"}`,
      `  version: "${template.metadata?.version || "1.0"}"`,
      `  generatedBy: "${version}"`,
    ];

    if (template.metadata?.category) {
      lines.push(`  category: ${template.metadata.category}`);
    }

    if (template.metadata?.tags && template.metadata.tags.length > 0) {
      lines.push(`  tags: [${template.metadata.tags.join(", ")}]`);
    }

    lines.push("---");
    lines.push("");
    lines.push(template.instructions);

    return lines.join("\n");
  },
};
