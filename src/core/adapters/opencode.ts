/**
 * OpenCode adapter
 *
 * Formats skills and agents for OpenCode.
 *
 * Directory conventions (open agent skills standard + OpenCode-native):
 * - Skills:         .opencode/skills/<name>/SKILL.md
 * - Commands:       .opencode/commands/jinn-<id>.md
 * - Agents:         .opencode/agents/<name>.md  (YAML frontmatter + markdown body)
 *
 * OpenCode also discovers skills from cross-compatible roots for ergonomics:
 * - .claude/skills/<name>/SKILL.md
 * - .agents/skills/<name>/SKILL.md
 * Project-local paths are checked first, then global (~/.config/opencode/).
 *
 * Agent frontmatter fields:
 * - description    required; explains what the agent does
 * - mode          primary | subagent | all  (default: all)
 * - prompt        path to prompt file or inline markdown
 * - model          model override
 * - tools         deprecated; prefer permission field
 * - permission    fine-grained: { edit, bash, webfetch, skill, task } perms
 * - hidden         hide from @ autocomplete
 * - temperature    randomness 0.0–1.0
 * - color          hex or theme color for UI
 *
 * Agent body:
 * - Markdown instructions (system prompt; overrides prompt: field)
 * - ## Available commands  (informational; no YAML field exists)
 * - ## Related skills     (informational; OpenCode discovers skills via skill tool)
 *
 * Skills are NOT preloaded at agent startup — they are discovered and invoked
 * via the native `skill` tool based on description matching.
 * No `skills:` frontmatter field exists in OpenCode agents.
 *
 * Reference: https://opencode.ai/docs/agents
 * Reference: https://opencode.ai/docs/skills
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

export const opencodeAdapter: ToolCommandAdapter = {
  toolId: 'opencode',
  toolName: 'OpenCode',
  skillsDir: '.opencode',

  getCommandPath(commandId: string): string {
    return path.join('.opencode', 'commands', `jinn-${commandId}.md`);
  },

  getAgentPath(agentName: string): string {
    return path.join('.opencode', 'agents', `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.opencode', 'skills', skillName, 'SKILL.md');
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

    return `---\ndescription: ${escapeYamlValue(template.description)}\n---\n\n${bodySections.join('\n\n')}`;
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
