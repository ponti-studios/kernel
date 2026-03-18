/**
 * Agent generator
 *
 * Generates agent files for all configured tools.
 * Agents are special skills with additional metadata.
 */

import type { ToolCommandAdapter, GeneratedFile } from '../adapters/types.js';
import type { AgentTemplate } from '../templates/types.js';

export function generateAgentForTool(
  template: AgentTemplate,
  agentId: string,
  adapter: ToolCommandAdapter,
  version: string
): GeneratedFile {
  const filePath = adapter.getAgentPath
    ? adapter.getAgentPath(template.name)
    : adapter.getSkillPath(template.name);

  const fileContent = adapter.formatAgent
    ? adapter.formatAgent(template, version)
    : adapter.formatSkill(template, version);

  return {
    path: filePath,
    content: fileContent,
  };
}

export function generateAgentsForTool(
  templates: AgentTemplate[],
  adapter: ToolCommandAdapter,
  version: string
): GeneratedFile[] {
  return templates.map((template) =>
    generateAgentForTool(template, template.name, adapter, version)
  );
}

export function generateAgentsForAllTools(
  templates: AgentTemplate[],
  adapters: ToolCommandAdapter[],
  version: string
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const adapterResults = generateAgentsForTool(templates, adapter, version);
    results.push(...adapterResults);
  }

  return results;
}
