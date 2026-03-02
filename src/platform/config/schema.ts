import { z } from "zod";
import { AnyMcpNameSchema, McpNameSchema } from "../../integration/mcp/types";

import {
  PermissionValue,
  BashPermission,
  AgentPermissionSchema,
} from "./permissions.schema";
import {
  AgentNameSchema,
  SkillNameSchema,
  type SkillName,
  OverridableAgentNameSchema,
  HookNameSchema,
  CommandNameSchema,
  CategoryNameSchema,
  BrowserAutomationProviderSchema,
  TmuxLayoutSchema,
} from "./names.schema";
import {
  AgentOverrideConfigSchema,
  AgentOverridesSchema,
} from "./agent.schema";
import {
  CategoryConfigSchema,
  CategoriesConfigSchema,
} from "./category.schema";
import {
  OperatorConfigSchema,
  OperatorConfigSchemaWrapper,
} from "./operator.schema";
import {
  SkillSourceSchema,
  SkillDefinitionSchema,
  SkillEntrySchema,
  SkillsConfigSchema,
} from "./skill.schema";
import {
  DynamicContextPruningConfigSchema,
  ExperimentalConfigSchema,
} from "./pruning.schema";
import {
  ClaudeCodeConfigSchema,
  ClaudeImportConfigSchema,
  ImportsConfigSchema,
  FeaturesConfigSchema,
} from "./system.schema";
import {
  UltraworkLoopConfigSchema,
  BackgroundTaskConfigSchema,
  NotificationConfigSchema,
  GitMasterConfigSchema,
  BrowserAutomationConfigSchema,
  TmuxConfigSchema,
  TaskQueueConfigSchema,
  AgentSwarmConfigSchema,
} from "./runtime.schema";

// root configuration schema that aggregates all pieces
export const GhostwireConfigSchema = z.object({
  $schema: z.string().optional(),
  disabled_mcps: z.array(AnyMcpNameSchema).optional(),
  disabled_agents: z.array(AgentNameSchema).optional(),
  disabled_skills: z.array(SkillNameSchema).optional(),
  disabled_hooks: z.array(HookNameSchema).optional(),
  disabled_commands: z.array(CommandNameSchema).optional(),
  agents: AgentOverridesSchema.optional(),
  categories: CategoriesConfigSchema.optional(),
  claude_code: ClaudeCodeConfigSchema.optional(),
  imports: ImportsConfigSchema.optional(),
  features: FeaturesConfigSchema.optional(),
  operator: OperatorConfigSchemaWrapper.optional(),
  comment_checker: z.object({ custom_prompt: z.string().optional() }).optional(),
  experimental: ExperimentalConfigSchema.optional(),
  auto_update: z.boolean().optional(),
  skills: SkillsConfigSchema.optional(),
  ultrawork_loop: UltraworkLoopConfigSchema.optional(),
  background_task: BackgroundTaskConfigSchema.optional(),
  notification: NotificationConfigSchema.optional(),
  git_master: GitMasterConfigSchema.optional(),
  browser_automation_engine: BrowserAutomationConfigSchema.optional(),
  tmux: TmuxConfigSchema.optional(),
  default_model: z.string().optional(),
  inject_agents_globally: z.boolean().optional(),
});

// export types for convenience (pick from imported schemas)
export type GhostwireConfig = z.infer<typeof GhostwireConfigSchema>;
export type AgentOverrideConfig = z.infer<typeof AgentOverrideConfigSchema>;
export type AgentOverrides = z.infer<typeof AgentOverridesSchema>;
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type CategoriesConfig = z.infer<typeof CategoriesConfigSchema>;
export type OperatorConfig = z.infer<typeof OperatorConfigSchema>;
export type CommentCheckerConfig = z.infer<
  z.infer<typeof GhostwireConfigSchema> extends { comment_checker?: infer C }
    ? z.ZodType<C>
    : never
>;
export type ExperimentalConfig = z.infer<typeof ExperimentalConfigSchema>;
export type DynamicContextPruningConfig = z.infer<
  typeof DynamicContextPruningConfigSchema
>;
export type SkillsConfig = z.infer<typeof SkillsConfigSchema>;
export type SkillDefinition = z.infer<typeof SkillDefinitionSchema>;
export type UltraworkLoopConfig = z.infer<typeof UltraworkLoopConfigSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type GitMasterConfig = z.infer<typeof GitMasterConfigSchema>;
export type BrowserAutomationProvider = z.infer<typeof BrowserAutomationProviderSchema>;
export type BrowserAutomationConfig = z.infer<typeof BrowserAutomationConfigSchema>;
export type TmuxConfig = z.infer<typeof TmuxConfigSchema>;
export type TmuxLayout = z.infer<typeof TmuxLayoutSchema>;
export type TaskQueueConfig = z.infer<typeof TaskQueueConfigSchema>;
export type AgentSwarmConfig = z.infer<typeof AgentSwarmConfigSchema>;

export {
  AnyMcpNameSchema,
  type AnyMcpName,
  McpNameSchema,
  type McpName,
} from "../../integration/mcp/types";
