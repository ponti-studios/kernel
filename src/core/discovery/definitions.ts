/**
 * Tool definitions
 *
 * Metadata for the supported AI coding assistants.
 */

import type { ToolDefinition } from "../config/schema.js";

/**
 * All supported AI tools with their metadata
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "claude",
    name: "Claude Code",
    skillsDir: ".claude",
    available: true,
    successLabel: "Claude Code",
    notes: "Anthropic CLI tool with superior reasoning capabilities",
  },
  {
    id: "copilot",
    name: "Copilot",
    skillsDir: ".github",
    available: true,
    successLabel: "Copilot",
    notes: "GitHub AI assistant. Commands in .github/prompts/",
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    skillsDir: ".codex",
    available: true,
    successLabel: "OpenAI Codex",
    notes: "OpenAI CLI tool with native TOML agent format",
  },
  {
    id: "opencode",
    name: "OpenCode",
    skillsDir: ".opencode",
    available: true,
    successLabel: "OpenCode",
    notes: "Open source terminal AI coding agent",
  },
  {
    id: "pi",
    name: "Pi",
    skillsDir: ".pi",
    available: true,
    successLabel: "Pi",
    notes: "Minimal terminal coding harness with Agent Skills support",
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
