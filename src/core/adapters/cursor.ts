/**
 * Cursor adapter
 *
 * Formats skills for Cursor.
 *
 * Directory conventions (open agent skills standard + Cursor-native):
 * - Skills:         .cursor/skills/<name>/SKILL.md
 *
 * Cursor discovers skills via description matching — no preloading.
 *
 * Reference: https://docs.cursor.com/context/rules
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { SkillTemplate } from "../templates/types.js";

export const cursorAdapter: ToolCommandAdapter = {
  toolId: "cursor",
  toolName: "Cursor",
  skillsDir: ".cursor",

  getSkillPath(skillName: string): string {
    return path.join(".cursor", "skills", skillName, "SKILL.md");
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
