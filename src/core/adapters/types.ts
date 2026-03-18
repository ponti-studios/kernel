/**
 * Adapter types for tool-specific formatting.
 *
 * The adapter pattern is the core of jinn's harness-agnostic architecture.
 * Each AI tool implements ToolCommandAdapter to format content for its specific
 * requirements while the core templates remain tool-agnostic.
 */

import type { AgentTemplate, SkillTemplate } from '../templates/types.js';

/**
 * Tool-agnostic command content
 * Generated from CommandTemplate, fed to adapters for formatting
 */
export interface CommandContent {
  /** Command identifier (e.g., 'propose', 'code-format') */
  id: string;

  /** Full command name with namespace (e.g., 'jinn:propose') */
  fullId: string;

  /** Human-readable name */
  name: string;

  /** Brief description */
  description: string;

  /** Grouping category */
  category: string;

  /** Search tags */
  tags: string[];

  /** The instruction content (body text) */
  body: string;
}

/**
 * Per-tool formatting strategy.
 * Each AI tool implements this interface to handle its specific file path
 * and frontmatter format requirements.
 */
export interface ToolCommandAdapter {
  /** Tool identifier matching ToolId (e.g., 'opencode', 'cursor') */
  toolId: string;

  /** Human-readable tool name */
  toolName: string;

  /** Skill directory name (e.g., '.opencode', '.cursor') */
  skillsDir: string;

  /**
   * Returns the file path for a command.
   * @param commandId - The command identifier (e.g., 'propose')
   * @returns Path from project root (e.g., '.opencode/commands/jinn-propose.md')
   */
  getCommandPath(commandId: string): string;

  /**
   * Returns the skill directory path.
   * @param skillName - The skill name (e.g., 'jinn-planner')
   * @returns Path from project root (e.g., '.opencode/skills/jinn-planner/SKILL.md')
   */
  getSkillPath(skillName: string): string;

  /**
   * Formats command file content including frontmatter.
   * @param content - The tool-agnostic command content
   * @returns Complete file content ready to write
   */
  formatCommand(content: CommandContent): string;

  /**
   * Formats skill file content including frontmatter.
   * @param template - The skill template
   * @param version - Jinn version
   * @returns Complete file content ready to write
   */
  formatSkill(template: SkillTemplate, version: string): string;

  /**
   * Optional: Returns the file path for an agent.
   * Defaults to getSkillPath(agentName) if not implemented.
   * @param agentName - The agent name (e.g., 'jinn-plan')
   * @returns Path from project root (e.g., '.claude/agents/jinn-plan.md')
   */
  getAgentPath?(agentName: string): string;

  /**
   * Optional: Formats agent file content with tool-native agent frontmatter.
   * Defaults to formatSkill(template, version) if not implemented.
   * @param template - The agent template
   * @param version - Jinn version
   * @returns Complete file content ready to write
   */
  formatAgent?(template: AgentTemplate, version: string): string;

  /**
   * Optional: Transform command references for this tool.
   * E.g., OpenCode uses /jinn:propose, others might use different syntax.
   * @param text - The text to transform
   * @returns Transformed text with tool-appropriate command references
   */
  transformCommandReferences?(text: string): string;
}

/**
 * Result of generating a file
 */
export interface GeneratedFile {
  /** Absolute or relative file path */
  path: string;

  /** Complete file content */
  content: string;
}

/**
 * Adapter registry for managing tool adapters
 */
export interface AdapterRegistry {
  /** Register an adapter */
  register(adapter: ToolCommandAdapter): void;

  /** Get adapter by tool ID */
  get(toolId: string): ToolCommandAdapter;

  /** Check if adapter exists */
  has(toolId: string): boolean;

  /** Get all registered adapters */
  getAll(): ToolCommandAdapter[];

  /** Get all registered tool IDs */
  getRegisteredToolIds(): string[];
}
