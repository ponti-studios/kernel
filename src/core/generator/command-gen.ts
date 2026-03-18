/**
 * Command generator
 *
 * Generates command files for all configured tools.
 */

import type { ToolCommandAdapter, CommandContent, GeneratedFile } from '../adapters/types.js';
import type { CommandTemplate } from '../templates/types.js';

export function generateCommandsForTool(
  template: CommandTemplate,
  commandId: string,
  adapter: ToolCommandAdapter,
  _version: string
): GeneratedFile {
  const content: CommandContent = {
    id: commandId,
    fullId: `jinn:${commandId}`,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  };

  const filePath = adapter.getCommandPath(commandId);
  const fileContent = adapter.formatCommand(content);

  return {
    path: filePath,
    content: fileContent,
  };
}

export function generateCommandsForAllTools(
  template: CommandTemplate,
  commandId: string,
  adapters: ToolCommandAdapter[],
  version: string
): GeneratedFile[] {
  return adapters.map((adapter) =>
    generateCommandsForTool(template, commandId, adapter, version)
  );
}
