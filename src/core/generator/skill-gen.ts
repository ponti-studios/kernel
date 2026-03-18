/**
 * Skill generator
 *
 * Generates skill files for all configured tools.
 */

import type { ToolCommandAdapter, GeneratedFile } from '../adapters/types.js';
import type { SkillTemplate } from '../templates/types.js';

export function generateSkillForTool(
  template: SkillTemplate,
  adapter: ToolCommandAdapter,
  version: string
): GeneratedFile {
  const filePath = adapter.getSkillPath(template.name);
  const fileContent = adapter.formatSkill(template, version);

  return {
    path: filePath,
    content: fileContent,
  };
}

export function generateSkillsForTool(
  templates: SkillTemplate[],
  adapter: ToolCommandAdapter,
  version: string
): GeneratedFile[] {
  return templates.map((template) =>
    generateSkillForTool(template, adapter, version)
  );
}

export function generateSkillsForAllTools(
  templates: SkillTemplate[],
  adapters: ToolCommandAdapter[],
  version: string
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const adapterResults = generateSkillsForTool(templates, adapter, version);
    results.push(...adapterResults);
  }

  return results;
}
