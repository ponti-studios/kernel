/**
 * Core template types for skills, commands, and agents.
 *
 * These types define the structure of jinn's content templates,
 * which are tool-agnostic and get formatted for specific AI tools by adapters.
 */

/**
 * Skill template - defines reusable skill content
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

  /** Natural-language trigger conditions — when this skill should be invoked */
  when?: string[];

  /** Conditions under which this skill applies */
  applicability?: string[];

  /** Deterministic completion signals — when this skill's intent is fulfilled */
  termination?: string[];

  /** Artifacts or results this skill produces */
  outputs?: string[];

  /** Other skill names this skill orchestrates or depends on */
  dependencies?: string[];

  /** Template role category (e.g. 'Workflow', 'Specialist', 'Reviewer') */
  role?: string;

  /** What this template is capable of */
  capabilities?: string[];

  /** Skills this template can reference, preload, or delegate to depending on platform */
  availableSkills?: string[];

  /** Routing key for intent-based dispatch (e.g. 'plan', 'do', 'research') */
  route?: string;

  /** Additional reference files to emit alongside the main template */
  references?: TemplateReference[];

  /**
   * When true, prevents the platform from auto-invoking this skill based on context.
   * Use for action skills with side-effects (deploy, apply, sync) that should only
   * run when the user explicitly invokes them.
   * Claude Code: disable-model-invocation: true
   * Codex: allow_implicit_invocation: false in agents/openai.yaml
   */
  disableModelInvocation?: boolean;
}

/**
 * Additional markdown files emitted alongside a skill or agent template.
 */
export interface TemplateReference {
  /** Reference path relative to the generated template file, e.g. 'references/common/python.md' */
  relativePath: string;

  /** File content */
  content: string;
}

/**
 * Agent template - native agent persona with additional execution metadata
 */
export interface AgentTemplate extends SkillTemplate {
  /** Default tools available to agent */
  defaultTools?: string[];

  /** Acceptance criteria for agent completion */
  acceptanceChecks?: string[];

  /** Additional prompt content */
  promptAppend?: string;

  /**
   * Model override.
   * Claude Code: sonnet | opus | haiku | inherit | full model ID. Default: inherit.
   * Codex: model name string.
   */
  model?: string;

  /**
   * Claude Code permission mode.
   * default | acceptEdits | dontAsk | bypassPermissions | plan
   */
  permissionMode?: "default" | "acceptEdits" | "dontAsk" | "bypassPermissions" | "plan";

  /**
   * Codex sandbox mode.
   * read-only | workspace-write | danger-full-access
   */
  sandboxMode?: "read-only" | "workspace-write" | "danger-full-access";

  /**
   * Tools to deny access to (Claude Code disallowedTools).
   * Removed from the inherited or specified tool list.
   */
  disallowedTools?: string[];

  /**
   * Maximum agentic turns before the agent stops (Claude Code maxTurns).
   */
  maxTurns?: number;

  /**
   * Persistent memory scope (Claude Code memory field).
   * user | project | local
   */
  memory?: "user" | "project" | "local";
}
