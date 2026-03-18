/**
 * GitHub Copilot adapter
 *
 * Formats skills and agents for GitHub Copilot.
 *
 * Directory conventions (open agent skills standard + Copilot-native):
 * - Skills:         .github/skills/<name>/SKILL.md
 * - Commands:       .github/prompts/jinn-<id>.prompt.md
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
 * Agent body:
 * - Markdown instructions (system prompt)
 * - ## Available commands  (informational; no YAML field exists)
 * - ## Related skills     (informational; Copilot discovers skills via the skill tool)
 *
 * Skills are NOT preloaded in Copilot agents — they are discovered and invoked
 * via the native skill tool based on description matching. There is no skills:
 * frontmatter field in Copilot agents.
 *
 * Reference: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { AgentTemplate, SkillTemplate } from '../templates/types.js';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

export const githubCopilotAdapter: ToolCommandAdapter = {
  toolId: 'github-copilot',
  toolName: 'GitHub Copilot',
  skillsDir: '.github',

  getCommandPath(commandId: string): string {
    return path.join('.github', 'prompts', `jinn-${commandId}.prompt.md`);
  },

  getAgentPath(agentName: string): string {
    return path.join('.github', 'agents', `${agentName}.agent.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.github', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
description: ${escapeYamlValue(content.description)}
---

${content.body}`;
  },

  formatAgent(template: AgentTemplate, version: string): string {
    const bodySections: string[] = [template.instructions];

    if (template.availableCommands && template.availableCommands.length > 0) {
      bodySections.push(
        `## Available commands\n\n${template.availableCommands.map((c) => `- ${c}`).join('\n')}`,
      );
    }

    if (template.availableSkills && template.availableSkills.length > 0) {
      bodySections.push(
        `## Related skills\n\n${template.availableSkills.map((s) => `- ${s}`).join('\n')}`,
      );
    }

    return `---\nname: ${template.name}\ndescription: ${escapeYamlValue(template.description)}\n---\n\n${bodySections.join('\n\n')}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    const lines = [
      '---',
      `name: ${template.name}`,
      `description: ${template.description}`,
      `license: ${template.license || 'MIT'}`,
      `compatibility: ${template.compatibility || 'Requires jinn CLI.'}`,
      'metadata:',
      `  author: ${template.metadata?.author || 'jinn'}`,
      `  version: "${template.metadata?.version || '1.0'}"`,
      `  generatedBy: "${version}"`,
    ];

    if (template.metadata?.category) {
      lines.push(`  category: ${template.metadata.category}`);
    }

    if (template.metadata?.tags && template.metadata.tags.length > 0) {
      lines.push(`  tags: [${template.metadata.tags.join(', ')}]`);
    }

    lines.push('---');
    lines.push('');
    lines.push(template.instructions);

    return lines.join('\n');
  },
};
