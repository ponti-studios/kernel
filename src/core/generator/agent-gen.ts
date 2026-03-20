/**
 * Agent generator
 *
 * Generates agent files for all configured tools.
 * Agents are distinct templates and are only emitted for tools with native
 * agent support.
 */

import * as path from "path";
import type { ToolCommandAdapter, GeneratedFile } from "../adapters/types.js";
import type { AgentTemplate } from "../templates/types.js";
import { collectReferenceFiles } from "./shared.js";

export function generateAgentForTool(
  template: AgentTemplate,
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  if (!adapter.getAgentPath || !adapter.formatAgent) {
    return [];
  }

  const filePath = adapter.getAgentPath(template.name);
  return [
    { path: filePath, content: adapter.formatAgent(template, version) },
    ...collectReferenceFiles(path.dirname(filePath), template),
  ];
}

export function generateAgentsForTool(
  templates: AgentTemplate[],
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  return templates.flatMap((template) => generateAgentForTool(template, adapter, version));
}

export function generateAgentsForAllTools(
  templates: AgentTemplate[],
  adapters: ToolCommandAdapter[],
  version: string,
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const adapterResults = generateAgentsForTool(templates, adapter, version);
    results.push(...adapterResults);
  }

  return results;
}
