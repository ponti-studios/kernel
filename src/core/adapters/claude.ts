/**
 * Claude Code adapter
 *
 * Formats skills and agents for Claude Code.
 *
 * Directory conventions (open agent skills standard + Claude-native):
 * - Skills:         .claude/skills/<name>/SKILL.md
 * - Commands:       .claude/commands/jinn/<id>.md  (also creates /jinn-<id> slash command)
 * - Agents:         .claude/agents/<name>.md  (YAML frontmatter + markdown body)
 *
 * Agent frontmatter fields:
 * - name           display name (used in @ mentions)
 * - description    when/why to use this agent
 * - tools          explicit allowlist (e.g. Read, Grep, Glob, Bash)
 * - model          model override (default: sonnet)
 * - skills         YAML list of skills to preload at agent startup
 *
 * Agent body:
 * - Markdown instructions (system prompt)
 * - ## Available commands  (informational; not a YAML field)
 * - ## Related skills     (informational; mirrors skills: frontmatter)
 *
 * Skills are referenced by their bare name (e.g. skills: [jinn-git-master]).
 * Claude Code resolves skill paths as .claude/skills/<name>/SKILL.md.
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
    const frontmatterLines = [
      `name: ${template.name}`,
      `description: ${escapeYamlValue(template.description)}`,
      `tools: ${tools}`,
      `model: sonnet`,
    ];
    if (template.availableSkills && template.availableSkills.length > 0) {
      frontmatterLines.push(`skills:\n  - ${template.availableSkills.join('\n  - ')}`);
    }
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
    return `---\n${frontmatterLines.join('\n')}\n---\n\n${bodySections.join('\n\n')}`;
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
