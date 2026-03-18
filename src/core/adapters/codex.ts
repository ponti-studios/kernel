/**
 * Codex (OpenAI) adapter
 *
 * Formats skills and agents for OpenAI Codex.
 *
 * Directory conventions (open agent skills standard + Codex-native):
 * - Skills:         .agents/skills/<name>/SKILL.md
 * - Commands:       .agents/commands/jinn-<id>.md
 * - Agents:         .codex/agents/<name>.toml  (TOML, not Markdown)
 *
 * Agent TOML fields:
 * - name                   agent identifier (source of truth; filename is convention)
 * - description            when/why to use this agent
 * - developer_instructions markdown instructions (wrapped in ``` code fence)
 * - nickname_candidates    optional display name pool
 * - model                 model override
 * - sandbox_mode          read-only | workspace-write | danger-full-access
 * - [[skills.config]]      TOML array of skill path references
 *
 * Codex resolves [[skills.config]] paths as .agents/skills/<name>/SKILL.md.
 * Skills are NOT preloaded at startup — agents invoke them via the skill tool.
 *
 * Reference: https://developers.openai.com/codex/subagents
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { AgentTemplate, SkillTemplate } from '../templates/types.js';

function escapeTomlString(value: string): string {
  if (/[\\"]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return `"${value}"`;
}

export const codexAdapter: ToolCommandAdapter = {
  toolId: 'codex',
  toolName: 'OpenAI Codex',
  skillsDir: '.agents',

  getCommandPath(commandId: string): string {
    return path.join('.agents', 'commands', `jinn-${commandId}.md`);
  },

  getAgentPath(agentName: string): string {
    return path.join('.codex', 'agents', `${agentName}.toml`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.agents', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
description: ${content.description}
---

${content.body}`;
  },

  formatAgent(template: AgentTemplate, version: string): string {
    const lines: string[] = [
      `name = ${escapeTomlString(template.name)}`,
      `description = ${escapeTomlString(template.description)}`,
      '',
      '```',
      template.instructions.trim(),
      '```',
    ];

    if (template.availableCommands && template.availableCommands.length > 0) {
      lines.push('');
      lines.push('## Available commands');
      for (const command of template.availableCommands) {
        lines.push(`- ${command}`);
      }
    }

    if (template.availableSkills && template.availableSkills.length > 0) {
      for (const skill of template.availableSkills) {
        lines.push('');
        lines.push(`[[skills.config]]`);
        lines.push(`path = ${escapeTomlString(path.join('.agents', 'skills', skill, 'SKILL.md'))}`);
      }
    }

    return lines.join('\n');
  },

  formatSkill(template: SkillTemplate, version: string): string {
    const lines: string[] = [
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
