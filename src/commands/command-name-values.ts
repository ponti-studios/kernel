import { COMMAND_NAME_VALUES as GENERATED_COMMAND_NAME_VALUES } from "./commands-manifest";

export const LEGACY_COMMAND_NAME_VALUES = [
  "ghostwire:changelog",
  "ghostwire:create-agent-skill",
  "ghostwire:deepen-plan",
  "ghostwire:deploy-docs",
  "ghostwire:feature-video",
  "ghostwire:generate-command",
  "ghostwire:heal-skill",
  "ghostwire:lfg",
  "ghostwire:plan-review",
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
  "ghostwire:workflows:compound",
  "ghostwire:xcode-test",
] as const;

export const COMMAND_NAME_VALUES = [
  ...GENERATED_COMMAND_NAME_VALUES,
  ...LEGACY_COMMAND_NAME_VALUES,
] as const;

export type CommandName = (typeof COMMAND_NAME_VALUES)[number];
