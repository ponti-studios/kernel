import { z } from "zod";

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
  /** Add "Ultraworked with ghost" footer to commit messages (default: true) */
  commit_footer: z.boolean().default(true),
  /** Add "Co-authored-by: ghost" trailer to commit messages (default: true) */
  include_co_authored_by: z.boolean().default(true),
});

export const BrowserAutomationConfigSchema = z.object({
  /**
   * Browser automation provider to use for the "playwright" skill.
   * - "playwright": Uses Playwright MCP server (@playwright/mcp) - default
   * - "agent-browser": Uses Vercel's agent-browser CLI (requires: bun add -g agent-browser)
   * - "dev-browser": Uses dev-browser skill with persistent browser state
   */
  provider: z.enum(["playwright", "agent-browser", "dev-browser"]).default("playwright"),
});

export const TmuxConfigSchema = z.object({
  enabled: z.boolean().default(false),
  layout: z
    .enum(["main-horizontal", "main-vertical", "tiled", "even-horizontal", "even-vertical"])
    .default("main-vertical"),
  main_pane_size: z.number().min(20).max(80).default(60),
  main_pane_min_width: z.number().min(40).default(120),
  agent_pane_min_width: z.number().min(20).default(40),
});

export const TaskQueueConfigSchema = z.object({
  /** Enable ghost Tasks system (default: false) */
  enabled: z.boolean().default(false),
  /** Storage path for tasks (default: docs/tasks) */
  storage_path: z.string().default("docs/tasks"),
  /** Enable Claude Code path compatibility mode */
  claude_code_compat: z.boolean().default(false),
});

export const AgentSwarmConfigSchema = z.object({
  /** Enable ghost Swarm system (default: false) */
  enabled: z.boolean().default(false),
  /** Storage path for teams (default: docs/teams) */
  storage_path: z.string().default("docs/teams"),
  /** UI mode: toast notifications, tmux panes, or both */
  ui_mode: z.enum(["toast", "tmux", "both"]).default("toast"),
});

export type UltraworkLoopConfig = z.infer<typeof UltraworkLoopConfigSchema>;
export type BackgroundTaskConfig = z.infer<typeof BackgroundTaskConfigSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type GitMasterConfig = z.infer<typeof GitMasterConfigSchema>;
export type BrowserAutomationConfig = z.infer<typeof BrowserAutomationConfigSchema>;
export type TmuxConfig = z.infer<typeof TmuxConfigSchema>;
export type TaskQueueConfig = z.infer<typeof TaskQueueConfigSchema>;
export type AgentSwarmConfig = z.infer<typeof AgentSwarmConfigSchema>;
