import { z } from "zod";

export const ClaudeCodeConfigSchema = z.object({
  mcp: z.boolean().optional(),
  commands: z.boolean().optional(),
  skills: z.boolean().optional(),
  agents: z.boolean().optional(),
  hooks: z.boolean().optional(),
  plugins: z.boolean().optional(),
  plugins_override: z.record(z.string(), z.boolean()).optional(),
});

export const ClaudeImportConfigSchema = z.object({
  enabled: z.boolean().optional(),
  strict: z.boolean().optional(),
  warnings: z.boolean().optional(),
  atomic: z.boolean().optional(),
  dry_run: z.boolean().optional(),
  path: z.string().optional(),
  namespace_prefix: z.string().optional(),
  namespace_overrides: z.record(z.string(), z.string()).optional(),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

export const ImportsConfigSchema = z.object({
  claude: ClaudeImportConfigSchema.optional(),
});

export const FeaturesConfigSchema = z.object({});

export type ClaudeCodeConfig = z.infer<typeof ClaudeCodeConfigSchema>;
export type ClaudeImportConfig = z.infer<typeof ClaudeImportConfigSchema>;
export type ImportsConfig = z.infer<typeof ImportsConfigSchema>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
