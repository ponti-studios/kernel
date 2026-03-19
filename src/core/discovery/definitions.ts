/**
 * Tool definitions
 *
 * Metadata for the 4 supported AI coding assistants.
 */

import type { ToolDefinition } from "../config/schema.js";

/**
 * All supported AI tools with their metadata
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "opencode",
    name: "OpenCode",
    skillsDir: ".opencode",
    available: true,
    successLabel: "OpenCode",
    notes: "Primary development platform with full jinn support",
  },
  {
    id: "claude",
    name: "Claude Code",
    skillsDir: ".claude",
    available: true,
    successLabel: "Claude Code",
    notes: "Anthropic CLI tool with superior reasoning capabilities",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    skillsDir: ".github",
    available: true,
    successLabel: "GitHub Copilot",
    notes: "GitHub AI assistant. Commands in .github/prompts/",
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    skillsDir: ".agents",
    available: true,
    successLabel: "OpenAI Codex",
    notes: "OpenAI CLI tool with native TOML agent format",
  },
  {
    id: "gemini",
    name: "Gemini",
    skillsDir: ".gemini",
    available: true,
    successLabel: "Gemini",
    notes: "Google Gemini CLI tool",
  },
  {
    id: "cursor",
    name: "Cursor",
    skillsDir: ".cursor",
    available: true,
    successLabel: "Cursor",
    notes: "VS Code-based AI editor with excellent IDE integration",
  },
];

/**
 * Get a tool definition by ID
 */
export function getToolDefinition(toolId: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((tool) => tool.id === toolId);
}

/**
 * Get all tool definitions
 */
export function getAllToolDefinitions(): ToolDefinition[] {
  return TOOL_DEFINITIONS;
}

/**
 * Get only available/supported tools
 */
export function getAvailableTools(): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((tool) => tool.available);
}
