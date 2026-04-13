/**
 * Pi (pi-coding-agent) adapter
 *
 * Formats skills for Pi — a minimal terminal coding harness.
 *
 * Directory conventions (Agent Skills standard):
 * - Skills:         .pi/skills/<name>/SKILL.md
 *
 * Pi implements the Agent Skills standard and scans directories to discover skills.
 * Skills are loaded on-demand based on description matching.
 *
 * References:
 * - https://github.com/badlogic/pi-coding-agent
 * - https://agentskills.io/specification
 * - https://pi.dev
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { CommandTemplate, SkillTemplate } from "../templates/types.js";
import {
  closeSkillFrontmatter,
  escapeYamlValue,
  formatBaseSkillFrontmatter,
  formatCompatibilityCommand,
  formatManifestContent,
} from "./shared.js";

export const piAdapter: ToolCommandAdapter = {
  toolId: "pi",
  toolName: "Pi",
  skillsDir: ".pi",

  getSkillPath(skillName: string): string {
    return path.join(".pi", "skills", skillName, "SKILL.md");
  },

  getCommandPath(commandName: string): string {
    return path.join(".pi", "commands", `${commandName}.md`);
  },

  formatSkill(template: SkillTemplate, version: string): string {
    // Pi uses the Agent Skills standard - keep frontmatter minimal
    // but include essential fields: name, description, license, compatibility, metadata
    return closeSkillFrontmatter(
      formatBaseSkillFrontmatter(template, version),
      template.instructions,
    );
  },

  formatCommand(template: CommandTemplate, version: string): string {
    return formatCompatibilityCommand(template, version, "Pi");
  },

  getManifestPath(): string {
    // Pi doesn't require a manifest to discover skills (scans directories),
    // but an index is useful for quick reference
    return path.join(".pi", "skills-index.md");
  },

  formatManifest(skills: SkillTemplate[], version: string): string {
    return formatManifestContent(skills, version);
  },
};
