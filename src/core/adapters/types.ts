/**
 * Adapter types for tool-specific formatting.
 *
 * The adapter pattern is the core of spec's harness-agnostic architecture.
 * Each AI tool implements ToolCommandAdapter to format content for its specific
 * requirements while the core templates remain tool-agnostic.
 */

import type { AgentTemplate, SkillTemplate } from "../templates/types.js";

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
   * Returns the skill directory path.
   * @param skillName - The skill name (e.g., 'spec-planner')
   * @returns Path from project root (e.g., '.opencode/skills/spec-planner/SKILL.md')
   */
  getSkillPath(skillName: string): string;

  /**
   * Formats skill file content including frontmatter.
   * @param template - The skill template
   * @param version - Spec version
   * @returns Complete file content ready to write
   */
  formatSkill(template: SkillTemplate, version: string): string;

  /**
   * Optional: Returns the file path for an agent.
    * If omitted, this tool does not support native agent generation.
   * @param agentName - The agent name (e.g., 'spec-plan')
   * @returns Path from project root (e.g., '.claude/agents/spec-plan.md')
   */
  getAgentPath?(agentName: string): string;

  /**
   * Optional: Formats agent file content with tool-native agent frontmatter.
    * If omitted, this tool does not support native agent generation.
   * @param template - The agent template
   * @param version - Spec version
   * @returns Complete file content ready to write
   */
  formatAgent?(template: AgentTemplate, version: string): string;

  /**
   * Optional: Returns the file path for the skills discovery manifest.
   * @returns Path from project root (e.g., '.claude/skills-index.md')
   */
  getManifestPath?(): string;

  /**
   * Optional: Formats the skills discovery manifest content.
   * @param skills - All skill templates to index
   * @param version - Spec version
   * @returns Complete manifest file content
   */
  formatManifest?(skills: SkillTemplate[], version: string): string;
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
