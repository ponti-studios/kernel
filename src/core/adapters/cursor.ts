/**
 * Cursor adapter
 *
 * Formats skills for Cursor.
 *
 * Directory conventions (open agent skills standard + Cursor-native):
 * - Skills:         .cursor/skills/<name>/SKILL.md
 *
 * Cursor discovers skills via description matching — no preloading or agents.
 *
 * Reference: https://docs.cursor.com/context/rules
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { CommandTemplate, SkillTemplate } from "../templates/types.js";
import {
  closeSkillFrontmatter,
  formatBaseSkillFrontmatter,
  formatCompatibilityCommand,
} from "./shared.js";

export const cursorAdapter: ToolCommandAdapter = {
  toolId: "cursor",
  toolName: "Cursor",
  skillsDir: ".cursor",

  getSkillPath(skillName: string): string {
    return path.join(".cursor", "skills", skillName, "SKILL.md");
  },

  getCommandPath(commandName: string): string {
    return path.join(".cursor", "commands", `${commandName}.md`);
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(formatBaseSkillFrontmatter(template, version), template.instructions);
  },

  formatCommand(template: CommandTemplate, version: string): string {
    return formatCompatibilityCommand(template, version, "Cursor");
  },
};
