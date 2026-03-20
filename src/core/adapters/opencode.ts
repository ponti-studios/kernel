/**
 * OpenCode adapter
 *
 * Formats skills and agents for OpenCode.
 *
 * Directory conventions (open agent skills standard + OpenCode-native):
 * - Skills:         .opencode/skills/<name>/SKILL.md
 * - Agents:         .opencode/agents/<name>.md  (YAML frontmatter + markdown body)
 *
 * OpenCode also discovers skills from cross-compatible roots:
 * - .claude/skills/<name>/SKILL.md
 * - .agents/skills/<name>/SKILL.md
 *
 * Skills are NOT preloaded at agent startup — discovered and invoked via the
 * native skill tool based on description matching.
 *
 * Reference: https://opencode.ai/docs/agents
 * Reference: https://opencode.ai/docs/skills
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { AgentTemplate, SkillTemplate } from "../templates/types.js";
import {
  escapeYamlValue,
  formatFullSkillFrontmatter,
  closeSkillFrontmatter,
  formatAgentBody,
  formatManifestContent,
} from "./shared.js";

export const opencodeAdapter: ToolCommandAdapter = {
  toolId: "opencode",
  toolName: "OpenCode",
  skillsDir: ".opencode",

  getAgentPath(agentName: string): string {
    return path.join(".opencode", "agents", `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".opencode", "skills", skillName, "SKILL.md");
  },

  formatAgent(template: AgentTemplate, _version: string): string {
    return `---\ndescription: ${escapeYamlValue(template.description)}\n---\n\n${formatAgentBody(template)}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(formatFullSkillFrontmatter(template, version), template.instructions);
  },

  getManifestPath(): string {
    return path.join(".opencode", "skills-index.md");
  },

  formatManifest(skills: SkillTemplate[], version: string): string {
    return formatManifestContent(skills, version);
  },
};
