/**
 * Base adapter factory
 *
 * Creates ToolCommandAdapter instances from a config object.
 * Eliminates boilerplate across the 20+ adapters that share identical
 * formatSkill/formatCommand logic and differ only in paths and IDs.
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';
import type { ToolId } from '../config/schema.js';

export interface BaseAdapterConfig {
  toolId: ToolId;
  toolName: string;
  /** Root config directory, e.g. '.amazonq' */
  skillsDir: string;
  /** Subdirectory under skillsDir for commands. Default: 'commands' */
  commandDir?: string;
  /** File extension for command files. Default: '.md' */
  commandExt?: string;
  /** Override the default description-only formatCommand */
  formatCommand?: (content: CommandContent) => string;
}

function formatSkill(template: SkillTemplate, version: string): string {
  const lines = [
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

  return `---\n${lines.join('\n')}\n---\n\n${template.instructions}`;
}

function defaultFormatCommand(content: CommandContent): string {
  return `---\ndescription: ${content.description}\n---\n\n${content.body}`;
}

export function createAdapter(config: BaseAdapterConfig): ToolCommandAdapter {
  const {
    toolId,
    toolName,
    skillsDir,
    commandDir = 'commands',
    commandExt = '.md',
    formatCommand: customFormatCommand,
  } = config;

  return {
    toolId,
    toolName,
    skillsDir,

    getCommandPath(commandId: string): string {
      return path.join(skillsDir, commandDir, `jinn-${commandId}${commandExt}`);
    },

    getSkillPath(skillName: string): string {
      return path.join(skillsDir, 'skills', skillName, 'SKILL.md');
    },

    formatCommand(content: CommandContent): string {
      return customFormatCommand
        ? customFormatCommand(content)
        : defaultFormatCommand(content);
    },

    formatSkill(template: SkillTemplate, version: string): string {
      return formatSkill(template, version);
    },
  };
}
