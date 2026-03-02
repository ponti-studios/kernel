import { z } from "zod";
import { COMMAND_NAME_VALUES } from "../../commands/command-name-values";
import { SKILL_NAME_VALUES } from "../../skills/skills-manifest";
import type { CommandName } from "../../commands/command-name-values";

export const AgentNameSchema = z.enum(["do", "research"]);

const VALID_SKILL_NAMES_SET = new Set<string>(SKILL_NAME_VALUES);
export type SkillName = (typeof SKILL_NAME_VALUES)[number];
export const SkillNameSchema = z.custom<SkillName>(
  (value) => typeof value === "string" && VALID_SKILL_NAMES_SET.has(value),
  {
    message: `Invalid skill name. Expected one of: ${SKILL_NAME_VALUES.join(", ")}`,
  },
);

export const OverridableAgentNameSchema = z.enum(["build", "do", "research"]);

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

const VALID_COMMAND_NAMES_SET = new Set<string>(COMMAND_NAME_VALUES);
export const CommandNameSchema = z.custom<CommandName>(
  (value) => typeof value === "string" && VALID_COMMAND_NAMES_SET.has(value),
  {
    message: `Invalid command name. Expected one of: ${COMMAND_NAME_VALUES.join(", ")}`,
  },
);

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

export const BrowserAutomationProviderSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
]);

export const TmuxLayoutSchema = z.enum([
  "main-horizontal",
  "main-vertical",
  "tiled",
  "even-horizontal",
  "even-vertical",
]);

export type AgentName = z.infer<typeof AgentNameSchema>;
export type SkillName = z.infer<typeof SkillNameSchema>;
export type OverridableAgentName = z.infer<typeof OverridableAgentNameSchema>;
export type HookName = z.infer<typeof HookNameSchema>;
export type CommandName = z.infer<typeof CommandNameSchema>;
export type CategoryName = z.infer<typeof CategoryNameSchema>;
export type BrowserAutomationProvider = z.infer<typeof BrowserAutomationProviderSchema>;
export type TmuxLayout = z.infer<typeof TmuxLayoutSchema>;
