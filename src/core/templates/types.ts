/**
 * Core template types for skills, commands, and agents.
 *
 * These types define the structure of jinn's content templates,
 * which are tool-agnostic and get formatted for specific AI tools by adapters.
 */

/**
 * Skill template - defines agent skill content
 * Skills are installed to <tool>/skills/<name>/SKILL.md
 */
export interface SkillTemplate {
  /** Unique skill identifier (e.g., 'jinn-git-master') */
  name: string;

  /** Human-readable description */
  description: string;

  /** Full instructions for the AI */
  instructions: string;

  /** License for the skill */
  license?: string;

  /** Compatibility notes */
  compatibility?: string;

  /** Additional metadata */
  metadata?: {
    author?: string;
    version?: string;
    category?: string;
    tags?: string[];
  };
}

/**
 * Command template - defines slash command content
 * Commands are installed to <tool>/commands/<name>.md (varies by tool)
 */
export interface CommandTemplate {
  /** Command display name */
  name: string;

  /** Brief description */
  description: string;

  /** Grouping category */
  category: string;

  /** Search tags */
  tags: string[];

  /** The command body/instructions */
  content: string;
}

/**
 * Agent template - special skill for reasoning entities that orchestrate workflows
 */
export interface AgentTemplate extends SkillTemplate {
  /** Agent capabilities */
  capabilities?: string[];

  /** Commands this agent can invoke */
  availableCommands?: string[];

  /** Skills this agent can reference */
  availableSkills?: string[];

  /** Agent role category */
  role?: string;

  /** Route for agent execution */
  route?: string;

  /** Default tools available to agent */
  defaultTools?: string[];

  /** Acceptance criteria for agent completion */
  acceptanceChecks?: string[];

  /** Default command to invoke */
  defaultCommand?: string;

  /** Additional prompt content */
  promptAppend?: string;
}
