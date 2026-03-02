import { z } from "zod";
import { AnyMcpNameSchema, McpNameSchema } from "../../integration/mcp/types";

import { PermissionValue, BashPermission, AgentPermissionSchema } from "./permissions.schema";
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
import { AgentOverrideConfigSchema, AgentOverridesSchema } from "./agent.schema";
import { CategoryConfigSchema, CategoriesConfigSchema } from "./category.schema";
import { OperatorConfigSchema, OperatorConfigSchemaWrapper } from "./operator.schema";
import {
  SkillSourceSchema,
  SkillDefinitionSchema,
  SkillEntrySchema,
  SkillsConfigSchema,
} from "./skill.schema";
import { DynamicContextPruningConfigSchema, ExperimentalConfigSchema } from "./pruning.schema";
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
import { CommentCheckerConfigSchema } from "./comment.schema";

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
  comment_checker: CommentCheckerConfigSchema.optional(),
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

// export only the root config type; other types live in their modules
export type GhostwireConfig = z.infer<typeof GhostwireConfigSchema>;
