import type { CommandDefinition } from "../claude-code-command-loader";
import type { CommandName, Commands } from "./types";

// Import new command files (one command per file)
import { COMMAND as WORK_LOOP_COMMAND, NAME as WORK_LOOP_NAME } from "./commands/work.loop";
import { COMMAND as WORK_CANCEL_COMMAND, NAME as WORK_CANCEL_NAME } from "./commands/work.cancel";

// workflows commands
import {
  COMMAND as WORKFLOWS_PLAN_COMMAND,
  NAME as WORKFLOWS_PLAN_NAME,
} from "./commands/workflows.plan";
import {
  COMMAND as WORKFLOWS_EXECUTE_COMMAND,
  NAME as WORKFLOWS_EXECUTE_NAME,
} from "./commands/workflows.execute";
import {
  COMMAND as WORKFLOWS_STOP_COMMAND,
  NAME as WORKFLOWS_STOP_NAME,
} from "./commands/workflows.stop";
import {
  COMMAND as WORKFLOWS_CREATE_COMMAND,
  NAME as WORKFLOWS_CREATE_NAME,
} from "./commands/workflows.create";
import {
  COMMAND as WORKFLOWS_STATUS_COMMAND,
  NAME as WORKFLOWS_STATUS_NAME,
} from "./commands/workflows.status";
import {
  COMMAND as WORKFLOWS_COMPLETE_COMMAND,
  NAME as WORKFLOWS_COMPLETE_NAME,
} from "./commands/workflows.complete";
import {
  COMMAND as WORKFLOWS_BRAINSTORM_COMMAND,
  NAME as WORKFLOWS_BRAINSTORM_NAME,
} from "./commands/workflows.brainstorm";
import {
  COMMAND as WORKFLOWS_LEARNINGS_COMMAND,
  NAME as WORKFLOWS_LEARNINGS_NAME,
} from "./commands/workflows.learnings";
import {
  COMMAND as WORKFLOWS_REVIEW_COMMAND,
  NAME as WORKFLOWS_REVIEW_NAME,
} from "./commands/workflows.review";
import {
  COMMAND as WORKFLOWS_WORK_COMMAND,
  NAME as WORKFLOWS_WORK_NAME,
} from "./commands/workflows.work";

// code commands
import {
  COMMAND as CODE_REFACTOR_COMMAND,
  NAME as CODE_REFACTOR_NAME,
} from "./commands/code.refactor";
import { COMMAND as CODE_REVIEW_COMMAND, NAME as CODE_REVIEW_NAME } from "./commands/code.review";
import {
  COMMAND as CODE_OPTIMIZE_COMMAND,
  NAME as CODE_OPTIMIZE_NAME,
} from "./commands/code.optimize";
import { COMMAND as CODE_FORMAT_COMMAND, NAME as CODE_FORMAT_NAME } from "./commands/code.format";

// git commands
import {
  COMMAND as GIT_SMART_COMMIT_COMMAND,
  NAME as GIT_SMART_COMMIT_NAME,
} from "./commands/git.smart-commit";
import { COMMAND as GIT_BRANCH_COMMAND, NAME as GIT_BRANCH_NAME } from "./commands/git.branch";
import { COMMAND as GIT_MERGE_COMMAND, NAME as GIT_MERGE_NAME } from "./commands/git.merge";
import { COMMAND as GIT_CLEANUP_COMMAND, NAME as GIT_CLEANUP_NAME } from "./commands/git.cleanup";

// util commands
import { COMMAND as UTIL_CLEAN_COMMAND, NAME as UTIL_CLEAN_NAME } from "./commands/util.clean";
import { COMMAND as UTIL_BACKUP_COMMAND, NAME as UTIL_BACKUP_NAME } from "./commands/util.backup";
import {
  COMMAND as UTIL_RESTORE_COMMAND,
  NAME as UTIL_RESTORE_NAME,
} from "./commands/util.restore";
import { COMMAND as UTIL_DOCTOR_COMMAND, NAME as UTIL_DOCTOR_NAME } from "./commands/util.doctor";

// docs commands
import {
  COMMAND as DOCS_DEPLOY_DOCS_COMMAND,
  NAME as DOCS_DEPLOY_DOCS_NAME,
} from "./commands/docs.deploy-docs";
import {
  COMMAND as DOCS_RELEASE_DOCS_COMMAND,
  NAME as DOCS_RELEASE_DOCS_NAME,
} from "./commands/docs.release-docs";
import {
  COMMAND as DOCS_FEATURE_VIDEO_COMMAND,
  NAME as DOCS_FEATURE_VIDEO_NAME,
} from "./commands/docs.feature-video";
import {
  COMMAND as DOCS_TEST_BROWSER_COMMAND,
  NAME as DOCS_TEST_BROWSER_NAME,
} from "./commands/docs.test-browser";

// other commands
import { COMMAND as REFACTOR_COMMAND, NAME as REFACTOR_NAME } from "./commands/refactor";
import { COMMAND as LINT_RUBY_COMMAND, NAME as LINT_RUBY_NAME } from "./commands/lint.ruby";

// Map of command modules
const CORE_COMMAND_MODULES: Record<
  string,
  { name: CommandName; command: Omit<CommandDefinition, "name"> }
> = {
  [WORK_LOOP_NAME]: { name: WORK_LOOP_NAME, command: WORK_LOOP_COMMAND },
  [WORK_CANCEL_NAME]: { name: WORK_CANCEL_NAME, command: WORK_CANCEL_COMMAND },
  [WORKFLOWS_PLAN_NAME]: { name: WORKFLOWS_PLAN_NAME, command: WORKFLOWS_PLAN_COMMAND },
  [WORKFLOWS_EXECUTE_NAME]: { name: WORKFLOWS_EXECUTE_NAME, command: WORKFLOWS_EXECUTE_COMMAND },
  [WORKFLOWS_STOP_NAME]: { name: WORKFLOWS_STOP_NAME, command: WORKFLOWS_STOP_COMMAND },
  [WORKFLOWS_CREATE_NAME]: { name: WORKFLOWS_CREATE_NAME, command: WORKFLOWS_CREATE_COMMAND },
  [WORKFLOWS_STATUS_NAME]: { name: WORKFLOWS_STATUS_NAME, command: WORKFLOWS_STATUS_COMMAND },
  [WORKFLOWS_COMPLETE_NAME]: { name: WORKFLOWS_COMPLETE_NAME, command: WORKFLOWS_COMPLETE_COMMAND },
  [WORKFLOWS_BRAINSTORM_NAME]: {
    name: WORKFLOWS_BRAINSTORM_NAME,
    command: WORKFLOWS_BRAINSTORM_COMMAND,
  },
  [WORKFLOWS_LEARNINGS_NAME]: {
    name: WORKFLOWS_LEARNINGS_NAME,
    command: WORKFLOWS_LEARNINGS_COMMAND,
  },
  [WORKFLOWS_REVIEW_NAME]: { name: WORKFLOWS_REVIEW_NAME, command: WORKFLOWS_REVIEW_COMMAND },
  [WORKFLOWS_WORK_NAME]: { name: WORKFLOWS_WORK_NAME, command: WORKFLOWS_WORK_COMMAND },
  [CODE_REFACTOR_NAME]: { name: CODE_REFACTOR_NAME, command: CODE_REFACTOR_COMMAND },
  [CODE_REVIEW_NAME]: { name: CODE_REVIEW_NAME, command: CODE_REVIEW_COMMAND },
  [CODE_OPTIMIZE_NAME]: { name: CODE_OPTIMIZE_NAME, command: CODE_OPTIMIZE_COMMAND },
  [CODE_FORMAT_NAME]: { name: CODE_FORMAT_NAME, command: CODE_FORMAT_COMMAND },
  [GIT_SMART_COMMIT_NAME]: { name: GIT_SMART_COMMIT_NAME, command: GIT_SMART_COMMIT_COMMAND },
  [GIT_BRANCH_NAME]: { name: GIT_BRANCH_NAME, command: GIT_BRANCH_COMMAND },
  [GIT_MERGE_NAME]: { name: GIT_MERGE_NAME, command: GIT_MERGE_COMMAND },
  [GIT_CLEANUP_NAME]: { name: GIT_CLEANUP_NAME, command: GIT_CLEANUP_COMMAND },
  [UTIL_CLEAN_NAME]: { name: UTIL_CLEAN_NAME, command: UTIL_CLEAN_COMMAND },
  [UTIL_BACKUP_NAME]: { name: UTIL_BACKUP_NAME, command: UTIL_BACKUP_COMMAND },
  [UTIL_RESTORE_NAME]: { name: UTIL_RESTORE_NAME, command: UTIL_RESTORE_COMMAND },
  [UTIL_DOCTOR_NAME]: { name: UTIL_DOCTOR_NAME, command: UTIL_DOCTOR_COMMAND },
  [DOCS_DEPLOY_DOCS_NAME]: { name: DOCS_DEPLOY_DOCS_NAME, command: DOCS_DEPLOY_DOCS_COMMAND },
  [DOCS_RELEASE_DOCS_NAME]: { name: DOCS_RELEASE_DOCS_NAME, command: DOCS_RELEASE_DOCS_COMMAND },
  [DOCS_FEATURE_VIDEO_NAME]: { name: DOCS_FEATURE_VIDEO_NAME, command: DOCS_FEATURE_VIDEO_COMMAND },
  [DOCS_TEST_BROWSER_NAME]: { name: DOCS_TEST_BROWSER_NAME, command: DOCS_TEST_BROWSER_COMMAND },
  [REFACTOR_NAME]: { name: REFACTOR_NAME, command: REFACTOR_COMMAND },
  [LINT_RUBY_NAME]: { name: LINT_RUBY_NAME, command: LINT_RUBY_COMMAND },
};

const COMMAND_MODULES = CORE_COMMAND_MODULES;

export const COMMAND_DEFINITIONS: Record<
  CommandName,
  Omit<CommandDefinition, "name">
> = Object.values(COMMAND_MODULES).reduce(
  (acc, mod) => {
    acc[mod.name as CommandName] = mod.command;
    return acc;
  },
  {} as Record<CommandName, Omit<CommandDefinition, "name">>,
);

export function loadCommands(disabledCommands?: CommandName[]): Commands {
  const disabled = new Set(disabledCommands ?? []);
  const commands: Commands = {};

  for (const [name, definition] of Object.entries(COMMAND_DEFINITIONS)) {
    if (!disabled.has(name as CommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition;
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition;
    }
  }

  return commands;
}
