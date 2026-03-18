/**
 * Configuration schema and types for jinn.
 *
 * Uses Zod for runtime validation and TypeScript type inference.
 */

import { z } from 'zod';

/**
 * Profile determines which commands/skills are installed
 * - core: Essential workflows only
 * - extended: All workflows
 * - custom: User-selected subset
 */
export const ProfileSchema = z.enum(['core', 'extended', 'custom']);
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Delivery mode: what gets installed
 * - skills: Skills only
 * - commands: Commands only
 * - both: Both skills and commands
 */
export const DeliverySchema = z.enum(['skills', 'commands', 'both']);
export type Delivery = z.infer<typeof DeliverySchema>;

/**
 * Supported AI tool identifiers
 * This list covers 25 popular AI coding assistants
 */
export const ToolIdSchema = z.enum([
  'opencode',
  'cursor',
  'claude',
  'codex',
  'github-copilot',
  'continue',
  'cline',
  'amazon-q',
  'windsurf',
  'augment',
  'supermaven',
  'tabnine',
  'codeium',
  'sourcegraph-cody',
  'gemini',
  'mistral',
  'ollama',
  'lm-studio',
  'text-generation-webui',
  'koboldcpp',
  'tabby',
  'gpt4all',
  'jan',
  'huggingface-chat',
  'phind',
]);
export type ToolId = z.infer<typeof ToolIdSchema>;

/**
 * Main configuration schema
 * This defines the structure of .jinn/config.yaml
 */
export const ConfigSchema = z.object({
  /** Configuration schema version */
  version: z.string().default('1.0.0'),

  /** Which AI tools to configure */
  tools: z.array(ToolIdSchema).min(1, 'At least one tool must be configured'),

  /** Which profile of commands/skills to install */
  profile: ProfileSchema.default('core'),

  /** Custom workflows (when profile is 'custom') */
  customWorkflows: z.array(z.string()).optional(),

  /** What to install: skills, commands, or both */
  delivery: DeliverySchema.default('both'),

  /** Feature flags for experimental features */
  featureFlags: z.record(z.string(), z.boolean()).optional(),

  /**
   * Path to the personal knowledge vault containing .codex/skills/.
   * Used by `jinn vault compile` when --vault is not passed explicitly.
   * Supports ~ for home directory.
   */
  vaultPath: z.string().optional(),

  /** Project-specific metadata */
  metadata: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Tool definition metadata
 * Used for tool discovery and adapter selection
 */
export interface ToolDefinition {
  /** Tool identifier */
  id: ToolId;

  /** Human-readable name */
  name: string;

  /** Tool's skill/commands directory name */
  skillsDir: string;

  /** Whether this tool is available/supported */
  available: boolean;

  /** Success message label */
  successLabel: string;

  /** Tool-specific notes */
  notes?: string;
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation error messages */
  errors: string[];
}

/**
 * Configuration file paths
 */
export const CONFIG_FILENAME = 'config.yaml';
