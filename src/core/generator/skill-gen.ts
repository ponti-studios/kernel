/**
 * Skill generator
 *
 * Generates skill files for all configured tools.
 */

import * as path from "path";
import type { ToolCommandAdapter, GeneratedFile } from "../adapters/types.js";
import type { SkillTemplate } from "../templates/types.js";
import { collectReferenceFiles } from "./shared.js";

export function generateSkillForTool(
  template: SkillTemplate,
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  const filePath = adapter.getSkillPath(template.name);
  return [
    { path: filePath, content: adapter.formatSkill(template, version) },
    ...collectReferenceFiles(path.dirname(filePath), template),
  ];
}

export function generateSkillsForTool(
  templates: SkillTemplate[],
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  return templates.flatMap((template) => generateSkillForTool(template, adapter, version));
}

export function generateSkillsForAllTools(
  templates: SkillTemplate[],
  adapters: ToolCommandAdapter[],
  version: string,
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const adapterResults = generateSkillsForTool(templates, adapter, version);
    results.push(...adapterResults);
  }

  return results;
}
