import { describe, it, expect } from "bun:test";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import {
  VALID_AGENT_IDS,
  VALID_COMMAND_NAMES,
  VALID_SKILL_NAMES,
  isValidAgentId,
  isValidCategory,
  isValidCommandName,
  isValidSkillName,
} from "../../orchestration/agents/constants";
import * as AGENT_CONSTANTS from "../../orchestration/agents/constants";

const COMMANDS_DIR = join(import.meta.dir, "commands");
const TEMPLATES_DIR = join(import.meta.dir, "templates");
const TASK_QUEUE_DIR = join(import.meta.dir, "..", "task-queue");
const SRC_ROOT = join(import.meta.dir, "..", "..");
const HOOKS_DIR = join(SRC_ROOT, "orchestration", "hooks");
const REPO_ROOT = join(SRC_ROOT, "..");
const DOC_FILES = [
  join(REPO_ROOT, "README.md"),
  join(REPO_ROOT, "system-prompt.md"),
  join(REPO_ROOT, "src", "plugin", "README.md"),
];

type ConstantExport = string | readonly string[] | ((value: string) => boolean);
const EXPORTED_CONSTANTS = AGENT_CONSTANTS as Record<string, ConstantExport>;

/**
 * Resolve a constant reference like ${AGENT_PLANNER} to its actual value
 */
function resolveConstant(value: string): string {
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

function isPlaceholderValue(value: string): boolean {
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
function extractReferences(content: string): {
  subagentTypes: { value: string; line: number }[];
  categories: { value: string; line: number }[];
  commands: { value: string; line: number }[];
  skills: { value: string; line: number }[];
} {
  const subagentTypes: { value: string; line: number }[] = [];
  const categories: { value: string; line: number }[] = [];
  const commands: { value: string; line: number }[] = [];
  const skills: { value: string; line: number }[] = [];

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Match agent references in command strings and object literals
    const subagentTypeRegex =
      /(?:subagent_type\s*=\s*|subagent_type\s*:\s*|subagentType\s*:\s*|defaultSubagent\s*:\s*)["']([^"']+)["']/g;
    let match;
    while ((match = subagentTypeRegex.exec(line)) !== null) {
      // Resolve constant references like ${AGENT_PLANNER}
      const resolvedValue = resolveConstant(match[1]);
      subagentTypes.push({ value: resolvedValue, line: lineNum });
    }

    // Match category: "value" or category: 'value' (YAML style) or category="value"
    const categoryRegex = /(?:category\s*:\s*|category\s*=\s*)["']([^"']+)["']/g;
    while ((match = categoryRegex.exec(line)) !== null) {
      // Resolve constant references like ${CATEGORY_ULTRABRAIN}
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
async function getTsFiles(dir: string): Promise<string[]> {
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

async function validateFile(filePath: string): Promise<string[]> {
  const errors: string[] = [];
  const content = await readFile(filePath, "utf-8");
  const { subagentTypes, categories, commands, skills } = extractReferences(content);

  for (const { value, line } of subagentTypes) {
    const resolved = resolveConstant(value);
    if (isPlaceholderValue(resolved)) continue;
    if (!isValidAgentId(resolved)) {
      errors.push(`${filePath}:${line}: Invalid subagent_type="${value}"`);
    }
  }

  for (const { value, line } of categories) {
    const resolved = resolveConstant(value);
    if (isPlaceholderValue(resolved)) continue;
    if (!isValidCategory(resolved)) {
      errors.push(`${filePath}:${line}: Invalid category="${value}"`);
    }
  }

  for (const { value, line } of commands) {
    if (isPlaceholderValue(value)) continue;
    if (!isValidCommandName(value)) {
      errors.push(`${filePath}:${line}: Invalid command="${value}"`);
    }
  }

  for (const { value, line } of skills) {
    if (isPlaceholderValue(value)) continue;
    if (!isValidSkillName(value)) {
      errors.push(`${filePath}:${line}: Invalid skill="${value}"`);
    }
  }

  return errors;
}

async function validateDirectories(directories: string[]): Promise<string[]> {
  const errors: string[] = [];

  for (const directory of directories) {
    const files = await getTsFiles(directory);
    for (const filePath of files) {
      errors.push(...(await validateFile(filePath)));
    }
  }

  return errors;
}

async function validateMarkdownFiles(files: string[]): Promise<string[]> {
  const errors: string[] = [];
  for (const filePath of files) {
    errors.push(...(await validateFile(filePath)));
  }
  return errors;
}

describe("Agent Reference Validation", () => {
  it("code and docs must only use valid agent/category/command/skill references", async () => {
    const codeErrors = await validateDirectories([
      COMMANDS_DIR,
      TEMPLATES_DIR,
      TASK_QUEUE_DIR,
      HOOKS_DIR,
    ]);

    const docErrors = await validateMarkdownFiles(DOC_FILES);

    const errors = [...codeErrors, ...docErrors];
    expect(errors).toEqual([]);
  });

  it("valid agent IDs are runtime routes only", () => {
    expect(VALID_AGENT_IDS).toEqual(["do", "research"]);
  });

  it("valid command and skill lists are non-empty", () => {
    expect(VALID_COMMAND_NAMES.length).toBeGreaterThan(0);
    expect(VALID_SKILL_NAMES.length).toBeGreaterThan(0);
  });
});
