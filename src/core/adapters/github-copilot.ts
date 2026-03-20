/**
 * GitHub Copilot adapter
 *
 * Formats skills and agents for GitHub Copilot.
 *
 * Directory conventions (open agent skills standard + Copilot-native):
 * - Skills:         .github/skills/<name>/SKILL.md
 * - Agents:         .github/agents/<name>.agent.md  (YAML frontmatter + markdown body)
 *
 * Agent frontmatter fields:
 * - name           display name (defaults to filename without .agent.md)
 * - description    required; explains what the agent does
 * - tools          optional allowlist (e.g. ['read', 'search', 'edit'])
 * - model          optional model override
 * - mcp-servers    optional MCP server config scoped to this agent
 * - target         optional: 'vscode' | 'github-copilot' to scope visibility
 *
 * Skills are NOT preloaded — discovered and invoked via the native skill tool.
 * No `skills:` frontmatter field exists in Copilot agents.
 *
 * Reference: https://docs.github.com/en/copilot/how-tos/use-copilot-agents
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { AgentTemplate, SkillTemplate } from "../templates/types.js";
import {
  escapeYamlValue,
  formatBaseSkillFrontmatter,
  closeSkillFrontmatter,
  formatAgentBody,
} from "./shared.js";

export const githubCopilotAdapter: ToolCommandAdapter = {
  toolId: "github-copilot",
  toolName: "GitHub Copilot",
  skillsDir: ".github",

  getAgentPath(agentName: string): string {
    return path.join(".github", "agents", `${agentName}.agent.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".github", "skills", skillName, "SKILL.md");
  },

  formatAgent(template: AgentTemplate, _version: string): string {
    return `---\nname: ${template.name}\ndescription: ${escapeYamlValue(template.description)}\n---\n\n${formatAgentBody(template)}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(formatBaseSkillFrontmatter(template, version), template.instructions);
  },
};
