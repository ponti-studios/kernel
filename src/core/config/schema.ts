/**
 * Configuration schema and types for the project.
 *
 * Uses Zod for runtime validation and TypeScript type inference.
 */

import { z } from "zod";

/**
 * Supported AI tool identifiers
 * This list covers the AI coding tools currently supported by the project.
 */
export const ToolIdSchema = z.enum(["claude", "codex", "copilot", "opencode", "pi"]);
export type ToolId = z.infer<typeof ToolIdSchema>;

/**
 * Main configuration schema
 * This defines the kernel configuration file structure.
 */
export const ConfigSchema = z.object({
  /** Configuration schema version */
  version: z.string().default("1.0.0"),

  /** Which AI tools to configure */
  tools: z.array(ToolIdSchema).min(1, "At least one tool must be configured"),

  /**
   * Path to the personal knowledge vault containing .codex/skills/.
   * Used by the vault compile command when --vault is not passed explicitly.
   * Supports ~ for home directory.
   */
  vaultPath: z.string().optional(),

  /** Project-specific metadata */
  metadata: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      version: z.string().optional(),
    })
    .optional(),
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
export const CONFIG_FILENAME = "config.yaml";
