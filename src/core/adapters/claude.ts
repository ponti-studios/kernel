/**
 * Claude Code adapter
 *
 * Formats commands, skills, and agents for Claude Code.
 * Claude Code uses:
 * - Skills: .claude/skills/<name>/SKILL.md
 * - Commands: .claude/commands/jinn/<id>.md (nested directory)
 * - Agents: .claude/agents/<name>.md (YAML frontmatter with name, description, tools, model)
 * - Format: YAML frontmatter with name, description, category, tags
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { AgentTemplate, SkillTemplate } from '../templates/types.js';

/** Maps AgentTemplate.defaultTools values to Claude Code tool names */
function resolveClaudeTools(defaultTools: string[] = []): string {
  const toolMap: Record<string, string[]> = {
    read: ['Read'],
    search: ['Grep', 'Glob'],
    edit: ['Edit', 'Write'],
    web: ['WebSearch', 'WebFetch'],
    task: ['Bash'],
    look_at: ['Read'],
    delegate_task: ['Bash'],
  };
  const resolved = new Set<string>();
  for (const tool of defaultTools) {
    for (const mapped of toolMap[tool] ?? []) {
      resolved.add(mapped);
    }
  }
  return [...resolved].join(', ') || 'Read, Grep, Glob';
}

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

function formatTagsArray(tags: string[]): string {
  if (tags.length === 0) return '[]';
  const escapedTags = tags.map((tag) => escapeYamlValue(tag));
  return `[${escapedTags.join(', ')}]`;
}

export const claudeAdapter: ToolCommandAdapter = {
  toolId: 'claude',
  toolName: 'Claude Code',
  skillsDir: '.claude',

  getCommandPath(commandId: string): string {
    return path.join('.claude', 'commands', 'jinn', `${commandId}.md`);
  },

  getAgentPath(agentName: string): string {
    return path.join('.claude', 'agents', `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.claude', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
name: ${escapeYamlValue(content.name)}
description: ${escapeYamlValue(content.description)}
category: ${escapeYamlValue(content.category)}
tags: ${formatTagsArray(content.tags)}
---

${content.body}`;
  },

  formatAgent(template: AgentTemplate, version: string): string {
    const tools = resolveClaudeTools(template.defaultTools);
    return `---
name: ${template.name}
description: ${escapeYamlValue(template.description)}
tools: ${tools}
model: sonnet
---

${template.instructions}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    const metadataLines = [
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
      metadataLines.push(`  category: ${template.metadata.category}`);
    }

    if (template.metadata?.tags && template.metadata.tags.length > 0) {
      metadataLines.push(`  tags: [${template.metadata.tags.join(', ')}]`);
    }

    return `---\n${metadataLines.join('\n')}\n---\n\n${template.instructions}`;
  },
};
