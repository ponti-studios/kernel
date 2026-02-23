import { z } from "zod";
import { AnyMcpNameSchema, McpNameSchema } from "../../integration/mcp/types";
import { ModelsConfigSchema } from "./model-config";

const PermissionValue = z.enum(["ask", "allow", "deny"]);

const BashPermission = z.union([PermissionValue, z.record(z.string(), PermissionValue)]);

const AgentPermissionSchema = z.object({
  edit: PermissionValue.optional(),
  bash: BashPermission.optional(),
  webfetch: PermissionValue.optional(),
  doom_loop: PermissionValue.optional(),
  external_directory: PermissionValue.optional(),
});

export const AgentNameSchema = z.enum([
   "operator",
   "planner",
   "advisor-plan",
   "researcher-data",
   "researcher-codebase",
   "analyzer-media",
   "advisor-strategy",
   "validator-audit",
   "orchestrator",
  // Compound Agents (28 total)
  // Review Agents (5) - Phase 11
  "void.review-rails",
  "void.review-python",
  "void.review-ts",
  "zen.review-rails",
  "mono.review",
  // Research Agents (4) - Phase 12
  "docs.scan",
  "learnings.scan",
  "best-practices.scan",
  "git.scan",
  // Design Agents (4) - Phase 13
  "figma.sync",
  "design.check",
  "design.loop",
  "ui.build",
  // Workflow Agents (3) - Phase 14
  "flow.check",
  "agent.arch",
  "deploy.check",
  // Documentation Agents (12) - Phase 15
  "docs.write-readme",
  "docs.edit-style",
  "docs.write-gem",
  "grid:brainstorm",
  "grid:skill-make",
  "grid:todo-file",
  "grid:agent-browser",
  "grid:rclone-sync",
  "grid:git-work",
  "grid:agent-audit",
]);

export const SkillNameSchema = z.enum([
  // Built-in skills
  "playwright",
  "agent-browser",
  "frontend-ui-ux",
  "git-master",
  // Compound development skills
  "grid:typescript-expert",
  "grid:python-expert",
  "grid:ruby-expert",
  "grid:go-expert",
  "grid:rust-expert",
  "grid:react-expert",
  "grid:vue-expert",
  "grid:next-expert",
  "grid:node-expert",
  "grid:database-expert",
  "grid:api-design-expert",
  "grid:testing-expert",
  "grid:security-expert",
  "grid:performance-expert",
  "grid:refactoring-expert",
  "grid:documentation-code",
  "grid:dependency-management",
  "grid:architecture-design",
  "grid:code-review",
  "grid:cli-development",
  "grid:web-scraping",
  "grid:integration-expertise",
  "grid:monorepo-management",
  "grid:type-system-expert",
  "grid:algorithm-expert",
  // Compound design skills
  "grid:frontend-design",
  "grid:figma-expertise",
  "grid:design-system",
  "grid:accessibility-expert",
  "grid:responsive-design",
  "grid:animation-expertise",
  "grid:color-typography",
  "grid:interaction-design",
  "grid:visual-design",
  "grid:dark-mode-design",
  "grid:design-documentation",
  "grid:user-research",
  "grid:branding-expertise",
  "grid:icon-design",
  "grid:illustration-expertise",
  "grid:css-expertise",
  "grid:tailwind-mastery",
  "grid:component-design",
  // Compound devops skills
  "grid:docker-expertise",
  "grid:kubernetes-expert",
  "grid:ci-cd-expert",
  "grid:terraform-expertise",
  "grid:aws-expert",
  "grid:gcp-expertise",
  "grid:monitoring-expert",
  "grid:security-infrastructure",
  "grid:database-ops",
  "grid:networking-devops",
  "grid:scaling-expertise",
  "grid:disaster-recovery",
  // Compound documentation skills
  "grid:api-documentation",
  "grid:technical-writing",
  "grid:readme-expertise",
  "grid:tutorial-creation",
  "grid:changelog-expertise",
  "grid:documentation-site",
  "grid:architecture-documentation",
  "grid:video-documentation",
  "grid:contributing-guides",
  "grid:knowledge-base",
  // Compound analysis skills
  "grid:code-analysis",
  "grid:performance-analysis",
  "grid:security-analysis",
  "grid:git-analysis",
  "grid:dependency-analysis",
  "grid:data-analysis",
  "grid:trend-analysis",
  "grid:cost-analysis",
]);

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
   "operator",
   "executor",
   "OpenCode-Builder",
   "planner",
   "advisor-strategy",
   "validator-audit",
   "advisor-plan",
   "researcher-data",
   "researcher-codebase",
   "analyzer-media",
   "orchestrator",
]);

export const HookNameSchema = z.enum([
  "todo-continuation-enforcer",
  "context-window-monitor",
  "session-recovery",
  "session-notification",
  "comment-checker",
  "grep-output-truncator",
  "tool-output-truncator",
  "directory-agents-injector",
  "directory-readme-injector",
  "empty-task-response-detector",
  "think-mode",
  "anthropic-context-window-limit-recovery",
  "rules-injector",
  "background-notification",
  "auto-update-checker",
  "startup-toast",
  "keyword-detector",
  "agent-usage-reminder",
  "non-interactive-env",
  "interactive-bash-session",

  "thinking-block-validator",
  "ultrawork-loop",
  "category-skill-reminder",

  "compaction-context-injector",
  "claude-code-hooks",
  "auto-slash-command",
  "edit-error-recovery",
  "delegate-task-retry",
  "planner-md-only",
  "executor-notepad",
  "start-work",
  "stop-continuation-guard",
  "orchestrator",
]);

export const CommandNameSchema = z.enum([
  "ghostwire:init-deep",
  "ghostwire:jack-in-work",
  "ghostwire:ultrawork-loop",
  "ghostwire:cancel-ultrawork",
  "ghostwire:ulw-ultrawork",
  "ghostwire:refactor",
  "ghostwire:stop-continuation",
  // Ghostwire workflows commands
  "ghostwire:workflows:plan",
  "ghostwire:workflows:create",
  "ghostwire:workflows:status",
  "ghostwire:workflows:complete",
  // Ghostwire code commands
  "ghostwire:code:refactor",
  "ghostwire:code:review",
  "ghostwire:code:optimize",
  "ghostwire:code:format",
  // Ghostwire git commands
  "ghostwire:git:smart-commit",
  "ghostwire:git:branch",
  "ghostwire:git:merge",
  "ghostwire:git:cleanup",
  // Ghostwire project commands
  "ghostwire:project:init",
  "ghostwire:project:build",
  "ghostwire:project:deploy",
  "ghostwire:project:test",
  // Ghostwire utility commands
  "ghostwire:util:clean",
  "ghostwire:util:backup",
  "ghostwire:util:restore",
  "ghostwire:util:doctor",
  // Ghostwire documentation commands
  "ghostwire:docs:deploy-docs",
  "ghostwire:docs:release-docs",
  "ghostwire:docs:feature-video",
  "ghostwire:docs:test-browser",
  "ghostwire:lint:ruby",
  // Plugin commands (non-workflow)
  "ghostwire:plan-review",
  "ghostwire:changelog",
  "ghostwire:create-agent-skill",
  "ghostwire:deepen-plan",
  "ghostwire:deploy-docs",
  "ghostwire:feature-video",
  "ghostwire:generate-command",
  "ghostwire:heal-skill",
  "ghostwire:lfg",
  "ghostwire:quiz-me",
  "ghostwire:release-docs",
  "ghostwire:report-bug",
  "ghostwire:reproduce-bug",
  "ghostwire:resolve-parallel",
  "ghostwire:resolve-pr-parallel",
  "ghostwire:resolve-todo-parallel",
  "ghostwire:sync-tutorials",
  "ghostwire:teach-me",
  "ghostwire:test-browser",
  "ghostwire:triage",
  "ghostwire:xcode-test",
  // Plugin workflow commands
  "ghostwire:workflows:brainstorm",
  "ghostwire:workflows:learnings",
  "ghostwire:workflows:review",
  "ghostwire:workflows:work",
]);

export const AgentOverrideConfigSchema = z.object({
  /** @deprecated Use `category` instead. Model is inherited from category defaults. */
  model: z.string().optional(),
  variant: z.string().optional(),
  /** Category name to inherit model and other settings from CategoryConfig */
  category: z.string().optional(),
  /** Skill names to inject into agent prompt */
  skills: z.array(z.string()).optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  prompt: z.string().optional(),
  prompt_append: z.string().optional(),
  tools: z.record(z.string(), z.boolean()).optional(),
  disable: z.boolean().optional(),
  description: z.string().optional(),
  mode: z.enum(["subagent", "primary", "all"]).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  permission: AgentPermissionSchema.optional(),
  /** Maximum tokens for response. Passed directly to OpenCode SDK. */
  maxTokens: z.number().optional(),
  /** Extended thinking configuration (Anthropic). Overrides category and default settings. */
  thinking: z
    .object({
      type: z.enum(["enabled", "disabled"]),
      budgetTokens: z.number().optional(),
    })
    .optional(),
  /** Reasoning effort level (OpenAI). Overrides category and default settings. */
  reasoningEffort: z.enum(["low", "medium", "high", "xhigh"]).optional(),
  /** Text verbosity level. */
  textVerbosity: z.enum(["low", "medium", "high"]).optional(),
  /** Provider-specific options. Passed directly to OpenCode SDK. */
  providerOptions: z.record(z.string(), z.unknown()).optional(),
});

export const AgentOverridesSchema = z.object({
  build: AgentOverrideConfigSchema.optional(),
  plan: AgentOverrideConfigSchema.optional(),
  "operator": AgentOverrideConfigSchema.optional(),
   "executor": AgentOverrideConfigSchema.optional(),
   "OpenCode-Builder": AgentOverrideConfigSchema.optional(),
   "planner": AgentOverrideConfigSchema.optional(),
   "advisor-strategy": AgentOverrideConfigSchema.optional(),
   "validator-audit": AgentOverrideConfigSchema.optional(),
   "advisor-plan": AgentOverrideConfigSchema.optional(),
   "researcher-data": AgentOverrideConfigSchema.optional(),
   "researcher-codebase": AgentOverrideConfigSchema.optional(),
   "analyzer-media": AgentOverrideConfigSchema.optional(),
   "orchestrator": AgentOverrideConfigSchema.optional(),
});

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

export const OperatorConfigSchema = z.object({
  disabled: z.boolean().optional(),
  default_builder_enabled: z.boolean().optional(),
  planner_enabled: z.boolean().optional(),
  replace_plan: z.boolean().optional(),
});

export const CategoryConfigSchema = z.object({
  /** Human-readable description of the category's purpose. Shown in delegate_task prompt. */
  description: z.string().optional(),
  model: z.string().optional(),
  variant: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  maxTokens: z.number().optional(),
  thinking: z
    .object({
      type: z.enum(["enabled", "disabled"]),
      budgetTokens: z.number().optional(),
    })
    .optional(),
  reasoningEffort: z.enum(["low", "medium", "high", "xhigh"]).optional(),
  textVerbosity: z.enum(["low", "medium", "high"]).optional(),
  tools: z.record(z.string(), z.boolean()).optional(),
  prompt_append: z.string().optional(),
  /** Mark agent as unstable - forces background mode for monitoring. Auto-enabled for gemini models. */
  is_unstable_agent: z.boolean().optional(),
});

export const CategoryNameSchema = z.enum([
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "quick",
  "unspecified-low",
  "unspecified-high",
  "writing",
]);

export const CategoriesConfigSchema = z.record(z.string(), CategoryConfigSchema);

export const CommentCheckerConfigSchema = z.object({
  /** Custom prompt to replace the default warning message. Use {{comments}} placeholder for detected comments XML. */
  custom_prompt: z.string().optional(),
});

export const DynamicContextPruningConfigSchema = z.object({
  /** Enable dynamic context pruning (default: false) */
  enabled: z.boolean().default(false),
  /** Notification level: off, minimal, or detailed (default: detailed) */
  notification: z.enum(["off", "minimal", "detailed"]).default("detailed"),
  /** Turn protection - prevent pruning recent tool outputs */
  turn_protection: z
    .object({
      enabled: z.boolean().default(true),
      turns: z.number().min(1).max(10).default(3),
    })
    .optional(),
  /** Tools that should never be pruned */
  protected_tools: z
    .array(z.string())
    .default([
      "task",
      "todowrite",
      "todoread",
      "lsp_rename",
      "session_read",
      "session_write",
      "session_search",
    ]),
  /** Pruning strategies configuration */
  strategies: z
    .object({
      /** Remove duplicate tool calls (same tool + same args) */
      deduplication: z
        .object({
          enabled: z.boolean().default(true),
        })
        .optional(),
      /** Prune write inputs when file subsequently read */
      supersede_writes: z
        .object({
          enabled: z.boolean().default(true),
          /** Aggressive mode: prune any write if ANY subsequent read */
          aggressive: z.boolean().default(false),
        })
        .optional(),
      /** Prune errored tool inputs after N turns */
      purge_errors: z
        .object({
          enabled: z.boolean().default(true),
          turns: z.number().min(1).max(20).default(5),
        })
        .optional(),
    })
    .optional(),
});

export const ExperimentalConfigSchema = z.object({
  aggressive_truncation: z.boolean().optional(),
  auto_resume: z.boolean().optional(),
  /** Truncate all tool outputs, not just whitelisted tools (default: false). Tool output truncator is enabled by default - disable via disabled_hooks. */
  truncate_all_tool_outputs: z.boolean().optional(),
  /** Dynamic context pruning configuration */
  dynamic_context_pruning: DynamicContextPruningConfigSchema.optional(),
});

export const SkillSourceSchema = z.union([
  z.string(),
  z.object({
    path: z.string(),
    recursive: z.boolean().optional(),
    glob: z.string().optional(),
  }),
]);

export const SkillDefinitionSchema = z.object({
  description: z.string().optional(),
  template: z.string().optional(),
  from: z.string().optional(),
  model: z.string().optional(),
  agent: z.string().optional(),
  subtask: z.boolean().optional(),
  "argument-hint": z.string().optional(),
  license: z.string().optional(),
  compatibility: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  "allowed-tools": z.array(z.string()).optional(),
  disable: z.boolean().optional(),
});

export const SkillEntrySchema = z.union([z.boolean(), SkillDefinitionSchema]);

export const SkillsConfigSchema = z.union([
  z.array(z.string()),
  z.record(z.string(), SkillEntrySchema).and(
    z
      .object({
        sources: z.array(SkillSourceSchema).optional(),
        enable: z.array(z.string()).optional(),
        disable: z.array(z.string()).optional(),
      })
      .partial(),
  ),
]);

export const UltraworkLoopConfigSchema = z.object({
  /** Enable ultrawork loop functionality (default: false - opt-in feature) */
  enabled: z.boolean().default(false),
  /** Default max iterations if not specified in command (default: 100) */
  default_max_iterations: z.number().min(1).max(1000).default(100),
  /** Custom state file directory relative to project root (default: .opencode/) */
  state_dir: z.string().optional(),
});

export const BackgroundTaskConfigSchema = z.object({
  defaultConcurrency: z.number().min(1).optional(),
  providerConcurrency: z.record(z.string(), z.number().min(0)).optional(),
  modelConcurrency: z.record(z.string(), z.number().min(0)).optional(),
  /** Stale timeout in milliseconds - interrupt tasks with no activity for this duration (default: 180000 = 3 minutes, minimum: 60000 = 1 minute) */
  staleTimeoutMs: z.number().min(60000).optional(),
});

export const NotificationConfigSchema = z.object({
  /** Force enable grid-session-notification even if external notification plugins are detected (default: false) */
  force_enable: z.boolean().optional(),
});

export const GitMasterConfigSchema = z.object({
  /** Add "Ultraworked with Void Runner" footer to commit messages (default: true) */
  commit_footer: z.boolean().default(true),
  /** Add "Co-authored-by: Void Runner" trailer to commit messages (default: true) */
  include_co_authored_by: z.boolean().default(true),
});

export const BrowserAutomationProviderSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
]);

export const BrowserAutomationConfigSchema = z.object({
  /**
   * Browser automation provider to use for the "playwright" skill.
   * - "playwright": Uses Playwright MCP server (@playwright/mcp) - default
   * - "agent-browser": Uses Vercel's agent-browser CLI (requires: bun add -g agent-browser)
   * - "dev-browser": Uses dev-browser skill with persistent browser state
   */
  provider: BrowserAutomationProviderSchema.default("playwright"),
});

export const TmuxLayoutSchema = z.enum([
  "main-horizontal", // main pane top, agent panes bottom stack
  "main-vertical", // main pane left, agent panes right stack (default)
  "tiled", // all panes same size grid
  "even-horizontal", // all panes horizontal row
  "even-vertical", // all panes vertical stack
]);

export const TmuxConfigSchema = z.object({
  enabled: z.boolean().default(false),
  layout: TmuxLayoutSchema.default("main-vertical"),
  main_pane_size: z.number().min(20).max(80).default(60),
  main_pane_min_width: z.number().min(40).default(120),
  agent_pane_min_width: z.number().min(20).default(40),
});

export const TaskQueueConfigSchema = z.object({
  /** Enable Void Runner Tasks system (default: false) */
  enabled: z.boolean().default(false),
  /** Storage path for tasks (default: .ghostwire/tasks) */
  storage_path: z.string().default(".ghostwire/tasks"),
  /** Enable Claude Code path compatibility mode */
  claude_code_compat: z.boolean().default(false),
});

export const AgentSwarmConfigSchema = z.object({
  /** Enable Void Runner Swarm system (default: false) */
  enabled: z.boolean().default(false),
  /** Storage path for teams (default: .ghostwire/teams) */
  storage_path: z.string().default(".ghostwire/teams"),
  /** UI mode: toast notifications, tmux panes, or both */
  ui_mode: z.enum(["toast", "tmux", "both"]).default("toast"),
});

export const OperatorConfigSchemaWrapper = z.object({
  tasks: TaskQueueConfigSchema.optional(),
  swarm: AgentSwarmConfigSchema.optional(),
  disabled: z.boolean().optional(),
  default_builder_enabled: z.boolean().optional(),
  planner_enabled: z.boolean().optional(),
  replace_plan: z.boolean().optional(),
});
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
  /** Default model for agents when no specific model is configured (e.g., "anthropic/claude-sonnet-4-5") */
  default_model: z.string().optional(),
  /** Whether to inject Ghostwire builtin agents into global OpenCode config (default: true) */
  inject_agents_globally: z.boolean().optional(),
  /** Model configuration for agents and categories */
  models: ModelsConfigSchema.optional(),
});

export type GhostwireConfig = z.infer<typeof GhostwireConfigSchema>;
export type ModelsConfig = z.infer<typeof ModelsConfigSchema>;
export type AgentOverrideConfig = z.infer<typeof AgentOverrideConfigSchema>;
export type AgentOverrides = z.infer<typeof AgentOverridesSchema>;
export type BackgroundTaskConfig = z.infer<typeof BackgroundTaskConfigSchema>;
export type AgentName = z.infer<typeof AgentNameSchema>;
export type HookName = z.infer<typeof HookNameSchema>;
export type CommandName = z.infer<typeof CommandNameSchema>;
export type SkillName = z.infer<typeof SkillNameSchema>;
export type OperatorConfig = z.infer<typeof OperatorConfigSchema>;
export type CommentCheckerConfig = z.infer<typeof CommentCheckerConfigSchema>;
export type ExperimentalConfig = z.infer<typeof ExperimentalConfigSchema>;
export type DynamicContextPruningConfig = z.infer<typeof DynamicContextPruningConfigSchema>;
export type SkillsConfig = z.infer<typeof SkillsConfigSchema>;
export type SkillDefinition = z.infer<typeof SkillDefinitionSchema>;
export type UltraworkLoopConfig = z.infer<typeof UltraworkLoopConfigSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type CategoriesConfig = z.infer<typeof CategoriesConfigSchema>;
export type CategoryName = z.infer<typeof CategoryNameSchema>;
export type GitMasterConfig = z.infer<typeof GitMasterConfigSchema>;
export type BrowserAutomationProvider = z.infer<typeof BrowserAutomationProviderSchema>;
export type BrowserAutomationConfig = z.infer<typeof BrowserAutomationConfigSchema>;
export type TmuxConfig = z.infer<typeof TmuxConfigSchema>;
export type TmuxLayout = z.infer<typeof TmuxLayoutSchema>;
export type TaskQueueConfig = z.infer<typeof TaskQueueConfigSchema>;
export type AgentSwarmConfig = z.infer<typeof AgentSwarmConfigSchema>;
export type OperatorConfigWrapper = z.infer<typeof OperatorConfigSchemaWrapper>;

export {
  AnyMcpNameSchema,
  type AnyMcpName,
  McpNameSchema,
  type McpName,
} from "../../integration/mcp/types";
