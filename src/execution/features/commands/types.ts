import type { CommandDefinition } from "../claude-code-command-loader";

export type CommandName =
  // Project commands
  | "ghostwire:project:init"
  | "ghostwire:project:map"
  | "ghostwire:project:build"
  | "ghostwire:project:deploy"
  | "ghostwire:project:test"
  | "ghostwire:project:constitution"
  // Work loop commands
  | "ghostwire:work:loop"
  | "ghostwire:work:cancel"
  | "ghostwire:refactor"
  // Workflow execution commands
  | "ghostwire:workflows:execute"
  | "ghostwire:workflows:stop"
  | "ghostwire:workflows:plan"
  | "ghostwire:workflows:create"
  | "ghostwire:workflows:status"
  | "ghostwire:workflows:complete"
  | "ghostwire:code:refactor"
  | "ghostwire:code:review"
  | "ghostwire:code:optimize"
  | "ghostwire:code:format"
  | "ghostwire:git:smart-commit"
  | "ghostwire:git:branch"
  | "ghostwire:git:merge"
  | "ghostwire:git:cleanup"
  | "ghostwire:util:clean"
  | "ghostwire:util:backup"
  | "ghostwire:util:restore"
  | "ghostwire:util:doctor"
  | "ghostwire:docs:deploy-docs"
  | "ghostwire:docs:release-docs"
  | "ghostwire:docs:feature-video"
  | "ghostwire:docs:test-browser"
  | "ghostwire:lint:ruby"
  // Plugin commands (non-workflow)
  | "ghostwire:plan-review"
  | "ghostwire:changelog"
  | "ghostwire:create-agent-skill"
  | "ghostwire:deepen-plan"
  | "ghostwire:generate-command"
  | "ghostwire:heal-skill"
  | "ghostwire:lfg"
  | "ghostwire:quiz-me"
  | "ghostwire:report-bug"
  | "ghostwire:reproduce-bug"
  | "ghostwire:resolve-parallel"
  | "ghostwire:resolve-pr-parallel"
  | "ghostwire:resolve-todo-parallel"
  | "ghostwire:sync-tutorials"
  | "ghostwire:teach-me"
  | "ghostwire:triage"
  | "ghostwire:xcode-test"
  // Plugin workflow commands
  | "ghostwire:workflows:brainstorm"
  | "ghostwire:workflows:learnings"
  | "ghostwire:workflows:review"
  | "ghostwire:workflows:work";

export interface CommandConfig {
  disabled_commands?: CommandName[];
}

export type Commands = Record<string, CommandDefinition>;
