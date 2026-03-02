import { readdir, readFile } from "fs/promises";
import { join } from "path";
import * as AGENT_CONSTANTS from "../execution/agents/constants";

const EXPORTED_CONSTANTS = AGENT_CONSTANTS as Record<string, string | readonly string[] | ((value: string) => boolean)>;

type Reference = { value: string; line: number };

/**
 * Resolve a constant reference like ${AGENT_PLANNER} to its actual value
 */
export function resolveConstant(value: string): string {
  const constantMatch = value.match(/^\$\{([^}]+)\}$/);
  if (constantMatch) {
    const constantName = constantMatch[1];
    const constantValue = EXPORTED_CONSTANTS[constantName];
    if (typeof constantValue === "string") {
      return constantValue;
    }
  }
  return value;
}

export function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim();
  return (
    normalized.length === 0 ||
    normalized.includes("${") ||
    normalized.includes("...") ||
    normalized.includes("[") ||
    normalized.includes("]")
  );
}

/**
 * Extract all agent, category, command, and skill references from a file
 */
export function extractReferences(content: string): {
  subagentTypes: Reference[];
  categories: Reference[];
  commands: Reference[];
  skills: Reference[];
} {
  const subagentTypes: Reference[] = [];
  const categories: Reference[] = [];
  const commands: Reference[] = [];
  const skills: Reference[] = [];

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Match agent references in command strings and object literals
    const subagentTypeRegex =
      /(?:subagent_type\s*=\s*|subagent_type\s*:\s*|subagentType\s*:\s*|defaultSubagent\s*:\s*)["']([^"']+)["']/g;
    let match;
    while ((match = subagentTypeRegex.exec(line)) !== null) {
      const resolvedValue = resolveConstant(match[1]);
      subagentTypes.push({ value: resolvedValue, line: lineNum });
    }

    // Match category: "value" or category: 'value' (YAML style) or category="value"
    const categoryRegex = /(?:category\s*:\s*|category\s*=\s*)["']([^"']+)["']/g;
    while ((match = categoryRegex.exec(line)) !== null) {
      const resolvedValue = resolveConstant(match[1]);
      categories.push({ value: resolvedValue, line: lineNum });
    }

    // Match command names (ghostwire:xxx)
    const commandRegex = /ghostwire:[a-z0-9:-]+/g;
    while ((match = commandRegex.exec(line)) !== null) {
      commands.push({ value: match[0], line: lineNum });
    }

    // Match skill names in load_skills: ["..."] or skills: ["..."]
    const skillRegex = /(?:load_skills|skills)\s*:\s*\[[^\]]*"([^"]+)"[^\]]*\]/g;
    while ((match = skillRegex.exec(line)) !== null) {
      skills.push({ value: match[1], line: lineNum });
    }
  });

  return { subagentTypes, categories, commands, skills };
}

/**
 * Get all TypeScript files in a directory recursively
 */
export async function getTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getTsFiles(fullPath)));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function validateFile(filePath: string): Promise<string[]> {
  const errors: string[] = [];
  const content = await readFile(filePath, "utf-8");
  const { subagentTypes, categories, commands, skills } = extractReferences(content);

  for (const { value, line } of subagentTypes) {
    const resolved = resolveConstant(value);
    if (isPlaceholderValue(resolved)) continue;
    if (!isValidAgentId(resolved)) {
      errors.push(`${filePath}:${line}: Invalid subagent_type=\"${value}\"`);
    }
  }

  for (const { value, line } of categories) {
    const resolved = resolveConstant(value);
    if (isPlaceholderValue(resolved)) continue;
    if (!isValidCategory(resolved)) {
      errors.push(`${filePath}:${line}: Invalid category=\"${value}\"`);
    }
  }

  for (const { value, line } of commands) {
    if (isPlaceholderValue(value)) continue;
    if (!isValidCommandName(value)) {
      errors.push(`${filePath}:${line}: Invalid command=\"${value}\"`);
    }
  }

  for (const { value, line } of skills) {
    if (isPlaceholderValue(value)) continue;
    if (!isValidSkillName(value)) {
      errors.push(`${filePath}:${line}: Invalid skill=\"${value}\"`);
    }
  }

  return errors;
}

export async function validateDirectories(directories: string[]): Promise<string[]> {
  const errors: string[] = [];

  for (const directory of directories) {
    const files = await getTsFiles(directory);
    for (const filePath of files) {
      errors.push(...(await validateFile(filePath)));
    }
  }

  return errors;
}

export async function validateMarkdownFiles(files: string[]): Promise<string[]> {
  const errors: string[] = [];
  for (const filePath of files) {
    errors.push(...(await validateFile(filePath)));
  }
  return errors;
}

// (No exports for constants here – callers should import directly from the
// modules where those values are defined.)
