/**
 * Command generator
 *
 * Generates command files for all configured tools.
 */

import * as path from "path";
import type { ToolCommandAdapter, GeneratedFile } from "../adapters/types.js";
import type { CommandTemplate } from "../templates/types.js";
import { collectReferenceFiles } from "./shared.js";

export function generateCommandForTool(
  template: CommandTemplate,
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  if (!adapter.getCommandPath || !adapter.formatCommand) {
    return [];
  }
  if (template.nativeOnly && adapter.toolId !== "claude") {
    return [];
  }

  const filePath = adapter.getCommandPath(template.name);
  return [
    { path: filePath, content: adapter.formatCommand(template, version) },
    ...collectReferenceFiles(path.dirname(filePath), template),
  ];
}

export function generateCommandsForTool(
  templates: CommandTemplate[],
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  return templates.flatMap((template) => generateCommandForTool(template, adapter, version));
}

export function generateCommandsForAllTools(
  templates: CommandTemplate[],
  adapters: ToolCommandAdapter[],
  version: string,
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    results.push(...generateCommandsForTool(templates, adapter, version));
  }

  return results;
}
