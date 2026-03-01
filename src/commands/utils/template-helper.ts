/**
 * Template Helper Utilities
 *
 * Provides tagged template functions that validate agent/category/skill references
 * against constants.ts at build time, preventing drift between templates and sources of truth.
 */

import {
  VALID_AGENT_IDS,
  VALID_CATEGORIES,
  VALID_COMMAND_NAMES,
  VALID_SKILL_NAMES,
  isValidAgentId,
  isValidCommandName,
  isValidSkillName,
} from "../../../orchestration/agents/constants";

/**
 * Extract all agent/category references from a template string for validation
 */
function extractReferences(template: string): {
  subagentTypes: string[];
  categories: string[];
  commands: string[];
  skills: string[];
} {
  const subagentTypes: string[] = [];
  const categories: string[] = [];
  const commands: string[] = [];
  const skills: string[] = [];

  // Match subagent_type="value" or subagent_type='value'
  const subagentTypeRegex = /subagent_type\s*=\s*["']([^"']+)["']/g;
  let match;
  while ((match = subagentTypeRegex.exec(template)) !== null) {
    subagentTypes.push(match[1]);
  }

  // Match category: "value" or category: 'value' (YAML style) or category="value"
  const categoryRegex = /(?:category\s*:\s*|category\s*=\s*)["']([^"']+)["']/g;
  while ((match = categoryRegex.exec(template)) !== null) {
    categories.push(match[1]);
  }

  // Match command names (ghostwire:xxx)
  const commandRegex = /ghostwire:[a-z0-9:-]+/g;
  while ((match = commandRegex.exec(template)) !== null) {
    commands.push(match[0]);
  }

  // Match skill names in load_skills or skills array
  const skillRegex = /(?:load_skills|skills)\s*:\s*\[[^\]]*"([^"]+)"[^\]]*\]/g;
  while ((match = skillRegex.exec(template)) !== null) {
    skills.push(match[1]);
  }

  return { subagentTypes, categories, commands, skills };
}

/**
 * Validate all references in a template string
 * Throws descriptive error if any invalid reference found
 */
function validateTemplate(template: string, fileName: string): void {
  const { subagentTypes, categories, commands, skills } = extractReferences(template);

  const errors: string[] = [];

  // Validate agent IDs
  for (const agent of subagentTypes) {
    if (!isValidAgentId(agent)) {
      errors.push(
        `Invalid subagent_type="${agent}" in ${fileName}. Valid: ${VALID_AGENT_IDS.join(", ")}`,
      );
    }
  }

  // Validate categories
  for (const cat of categories) {
    if (!VALID_CATEGORIES.includes(cat as any)) {
      errors.push(
        `Invalid category="${cat}" in ${fileName}. Valid: ${VALID_CATEGORIES.join(", ")}`,
      );
    }
  }

  // Validate command names
  for (const cmd of commands) {
    if (!isValidCommandName(cmd)) {
      errors.push(
        `Invalid command="${cmd}" in ${fileName}. Valid: ${VALID_COMMAND_NAMES.join(", ")}`,
      );
    }
  }

  // Validate skill names
  for (const skill of skills) {
    if (!isValidSkillName(skill)) {
      errors.push(
        `Invalid skill="${skill}" in ${fileName}. Valid: ${VALID_SKILL_NAMES.join(", ")}`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Template validation failed:\n${errors.join("\n")}`);
  }
}

/**
 * Tagged template function for command templates
 *
 * Usage:
 * ```typescript
 * import { AGENT_PLANNER } from "../../../orchestration/agents/constants";
 * import { commandTemplate } from "../utils/template-helper";
 *
 * export const TEMPLATE = commandTemplate`
 *   Use subagent_type="${AGENT_PLANNER}" for planning
 * `;
 * ```
 *
 * This will:
 * 1. Validate all agent/category/skill references at build time
 * 2. Throw descriptive errors if invalid references found
 * 3. Return the interpolated string
 */
export function commandTemplate(
  strings: TemplateStringsArray,
  ...args: (string | number)[]
): string {
  // Build the template string
  let result = strings[0];
  for (let i = 0; i < args.length; i++) {
    result += String(args[i]) + strings[i + 1];
  }

  // Validate at build time (only in development)
  if (process.env.NODE_ENV !== "production") {
    // We can't easily get the file name here, so we just validate the content
    const { subagentTypes, categories, commands, skills } = extractReferences(result);

    const errors: string[] = [];

    for (const agent of subagentTypes) {
      if (!isValidAgentId(agent)) {
        errors.push(`Invalid subagent_type="${agent}"`);
      }
    }

    for (const cat of categories) {
      if (!VALID_CATEGORIES.includes(cat as any)) {
        errors.push(`Invalid category="${cat}"`);
      }
    }

    for (const cmd of commands) {
      if (!isValidCommandName(cmd)) {
        errors.push(`Invalid command="${cmd}"`);
      }
    }

    for (const skill of skills) {
      if (!isValidSkillName(skill)) {
        errors.push(`Invalid skill="${skill}"`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Template validation failed:\n${errors.join("\n")}`);
    }
  }

  return result;
}

/**
 * Validate a template string directly (for build-time scripts)
 */
export function validateTemplateString(template: string, fileName: string): void {
  validateTemplate(template, fileName);
}
