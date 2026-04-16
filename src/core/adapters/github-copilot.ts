/**
 * GitHub Copilot adapter
 *
 * Formats skills and agents for GitHub Copilot.
 *
 * Directory conventions (open agent skills standard + Copilot-native):
 * - Skills:         .github/skills/<name>/SKILL.md
 * - Agents:         .github/agents/<name>.agent.md  (YAML frontmatter + markdown body)
 * - Manifest:       .github/skills-index.md
 *
 * Agent frontmatter fields (https://docs.github.com/en/copilot/reference/custom-agents-configuration):
 * - name                      display name (defaults to filename without .agent.md)
 * - description               required; explains what the agent does
 * - tools                     optional allowlist (string[]); omit or ["*"] for all
 * - model                     optional model override (string or string[])
 * - disable-model-invocation  true = agent won't be auto-selected
 * - user-invocable            false = hidden from user selection
 * - argument-hint             guidance text shown to user for input
 * - agents                    subagent names this agent can invoke
 * - mcp-servers               MCP server configs scoped to this agent
 * - target                    'vscode' | 'github-copilot' to scope visibility
 * - metadata                  arbitrary key-value string pairs
 *
 * Skill frontmatter fields (agentskills.io + VS Code extensions):
 * - name, description, license, compatibility, metadata  (agentskills.io standard)
 * - disable-model-invocation, user-invocable, argument-hint, allowed-tools  (VS Code/Copilot)
 * - when, applicability, termination, outputs, dependencies  (lifecycle — informational)
 *
 * Skills are NOT preloaded — discovered and invoked via the native skill tool
 * based on description matching.
 *
 * Reference: https://docs.github.com/en/copilot/reference/custom-agents-configuration
 * Reference: https://agentskills.io/specification
 */

import path from "path";
import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";
import {
  closeSkillFrontmatter,
  escapeYamlValue,
  formatAgentBody,
  formatCompatibilityCommand,
  formatFullSkillFrontmatter,
  formatManifestContent,
} from "./shared.js";
import type { ToolCommandAdapter } from "./types.js";

export const githubCopilotAdapter: ToolCommandAdapter = {
  toolId: "copilot",
  toolName: "GitHub Copilot",
  skillsDir: ".github",

  getAgentPath(agentName: string): string {
    return path.join(".github", "agents", `${agentName}.agent.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".github", "skills", skillName, "SKILL.md");
  },

  getCommandPath(commandName: string): string {
    return path.join(".github", "commands", `${commandName}.md`);
  },

  formatAgent(template: AgentTemplate, _version: string): string {
    const frontmatterLines = [
      `name: ${template.name}`,
      `description: ${escapeYamlValue(template.description)}`,
    ];

    if (template.model) {
      frontmatterLines.push(`model: ${template.model}`);
    }
    if (template.disableModelInvocation) {
      frontmatterLines.push(`disable-model-invocation: true`);
    }
    if (template.userInvocable === false) {
      frontmatterLines.push(`user-invocable: false`);
    }
    if (template.argumentHint) {
      frontmatterLines.push(`argument-hint: ${escapeYamlValue(template.argumentHint)}`);
    }
    if (template.allowedTools && template.allowedTools.length > 0) {
      frontmatterLines.push(`tools: [${template.allowedTools.join(", ")}]`);
    }
    if (template.handoffs && template.handoffs.length > 0) {
      const handoffLines = template.handoffs.map((h) => {
        const parts = [`  - label: ${escapeYamlValue(h.label)}`, `    agent: ${h.agent}`];
        if (h.prompt) parts.push(`    prompt: ${escapeYamlValue(h.prompt)}`);
        if (h.send !== undefined) parts.push(`    send: ${h.send}`);
        if (h.model) parts.push(`    model: ${escapeYamlValue(h.model)}`);
        return parts.join("\n");
      });
      frontmatterLines.push(`handoffs:\n${handoffLines.join("\n")}`);
    }

    return `---\n${frontmatterLines.join("\n")}\n---\n\n${formatAgentBody(template)}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(
      formatFullSkillFrontmatter(template, version),
      template.instructions,
    );
  },

  formatCommand(template: CommandTemplate, version: string): string {
    return formatCompatibilityCommand(template, version, "GitHub Copilot");
  },

  getManifestPath(): string {
    return path.join(".github", "skills-index.md");
  },

  formatManifest(skills: SkillTemplate[], version: string): string {
    return formatManifestContent(skills, version);
  },
};
