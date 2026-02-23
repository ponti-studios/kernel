import type { CommandDefinition } from "../claude-code-command-loader";
import type { BuiltinCommandName, BuiltinCommands } from "./types";
import { INIT_DEEP_TEMPLATE } from "./templates/init-deep";
import {
  ULTRAWORK_LOOP_TEMPLATE,
  CANCEL_ULTRAWORK_TEMPLATE,
} from "./templates/ultrawork-loop";
import { STOP_CONTINUATION_TEMPLATE } from "./templates/stop-continuation";
import { REFACTOR_TEMPLATE } from "./templates/refactor";
import { START_WORK_TEMPLATE } from "./templates/start-work";
import {
  WORKFLOWS_CREATE_TEMPLATE,
  WORKFLOWS_STATUS_TEMPLATE,
  WORKFLOWS_COMPLETE_TEMPLATE,
  WORKFLOWS_PLAN_TEMPLATE,
} from "./templates/workflows";
import {
  CODE_REFACTOR_TEMPLATE,
  CODE_REVIEW_TEMPLATE,
  CODE_OPTIMIZE_TEMPLATE,
  CODE_FORMAT_TEMPLATE,
} from "./templates/code";
import {
  GIT_SMART_COMMIT_TEMPLATE,
  GIT_BRANCH_TEMPLATE,
  GIT_MERGE_TEMPLATE,
  GIT_CLEANUP_TEMPLATE,
} from "./templates/git";
import {
  PROJECT_INIT_TEMPLATE,
  PROJECT_BUILD_TEMPLATE,
  PROJECT_DEPLOY_TEMPLATE,
  PROJECT_TEST_TEMPLATE,
} from "./templates/project";
import {
  UTIL_CLEAN_TEMPLATE,
  UTIL_BACKUP_TEMPLATE,
  UTIL_RESTORE_TEMPLATE,
  UTIL_DOCTOR_TEMPLATE,
} from "./templates/util";
import {
  DOCS_DEPLOY_DOCS_TEMPLATE,
  DOCS_RELEASE_DOCS_TEMPLATE,
  DOCS_FEATURE_VIDEO_TEMPLATE,
  DOCS_TEST_BROWSER_TEMPLATE,
} from "./templates/docs";
import { LINT_RUBY_TEMPLATE } from "./templates/lint-ruby";
// Plugin command templates
import { PLAN_REVIEW_TEMPLATE } from "./templates/plan-review";
import { CHANGELOG_TEMPLATE } from "./templates/changelog";
import { CREATE_AGENT_SKILL_TEMPLATE } from "./templates/create-agent-skill";
import { DEEPEN_PLAN_TEMPLATE } from "./templates/deepen-plan";
import { DEPLOY_DOCS_TEMPLATE } from "./templates/deploy-docs";
import { FEATURE_VIDEO_TEMPLATE } from "./templates/feature-video";
import { GENERATE_COMMAND_TEMPLATE } from "./templates/generate-command";
import { HEAL_SKILL_TEMPLATE } from "./templates/heal-skill";
import { LFG_TEMPLATE } from "./templates/lfg";
import { QUIZ_ME_TEMPLATE } from "./templates/quiz-me";
import { RELEASE_DOCS_TEMPLATE } from "./templates/release-docs";
import { REPORT_BUG_TEMPLATE } from "./templates/report-bug";
import { REPRODUCE_BUG_TEMPLATE } from "./templates/reproduce-bug";
import { RESOLVE_PARALLEL_TEMPLATE } from "./templates/resolve-parallel";
import { RESOLVE_PR_PARALLEL_TEMPLATE } from "./templates/resolve-pr-parallel";
import { RESOLVE_TODO_PARALLEL_TEMPLATE } from "./templates/resolve-todo-parallel";
import { SYNC_TUTORIALS_TEMPLATE } from "./templates/sync-tutorials";
import { TEACH_ME_TEMPLATE } from "./templates/teach-me";
import { TEST_BROWSER_TEMPLATE } from "./templates/test-browser";
import { TRIAGE_TEMPLATE } from "./templates/triage";
import { XCODE_TEST_TEMPLATE } from "./templates/xcode-test";
// Plugin workflow templates
import { WORKFLOWS_BRAINSTORM_TEMPLATE } from "./templates/workflows/brainstorm";
import { WORKFLOWS_LEARNINGS_TEMPLATE } from "./templates/workflows/learnings";
import { WORKFLOWS_PLAN_TEMPLATE as WORKFLOWS_PLAN_V2_TEMPLATE } from "./templates/workflows/plan";
import { WORKFLOWS_REVIEW_TEMPLATE } from "./templates/workflows/review";
import { WORKFLOWS_WORK_TEMPLATE } from "./templates/workflows/work";
// Spec command templates (from specify integration)
import {
  SPEC_CREATE_TEMPLATE,
  SPEC_PLAN_TEMPLATE,
  SPEC_TASKS_TEMPLATE,
  SPEC_IMPLEMENT_TEMPLATE,
  SPEC_CLARIFY_TEMPLATE,
  SPEC_ANALYZE_TEMPLATE,
  SPEC_CHECKLIST_TEMPLATE,
  SPEC_TO_ISSUES_TEMPLATE,
} from "./templates/spec";
// Project command templates
import { PROJECT_CONSTITUTION_TEMPLATE } from "./templates/project/constitution";

export const BUILTIN_COMMAND_DEFINITIONS: Record<
  BuiltinCommandName,
  Omit<CommandDefinition, "name">
> = {
  "ghostwire:init-deep": {
    description: "(builtin) Initialize hierarchical AGENTS.md knowledge base",
    template: `<command-instruction>
${INIT_DEEP_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[--create-new] [--max-depth=N]",
  },
  "ghostwire:ultrawork-loop": {
    description:
      "(builtin) Start self-referential development loop until completion",
    template: `<command-instruction>
${ULTRAWORK_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
    argumentHint:
      '"task description" [--completion-promise=TEXT] [--max-iterations=N]',
  },
  "ghostwire:ulw-ultrawork": {
    description:
      "(builtin) Start ultrawork loop - continues until completion with ultrawork mode",
    template: `<command-instruction>
${ULTRAWORK_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
    argumentHint:
      '"task description" [--completion-promise=TEXT] [--max-iterations=N]',
  },
  "ghostwire:cancel-ultrawork": {
    description: "(builtin) Cancel active Ultrawork Loop",
    template: `<command-instruction>
${CANCEL_ULTRAWORK_TEMPLATE}
</command-instruction>`,
  },
  "ghostwire:refactor": {
    description:
      "(builtin) Intelligent refactoring command with LSP, AST-grep, architecture analysis, codemap, and TDD verification.",
    template: `<command-instruction>
${REFACTOR_TEMPLATE}
</command-instruction>`,
    argumentHint:
      "<refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]",
  },
  "ghostwire:jack-in-work": {
    description: "(builtin) Start operator work session from planner plan",
    agent: "orchestrator",
    template: `<command-instruction>
${START_WORK_TEMPLATE}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[plan-name]",
  },
  "ghostwire:stop-continuation": {
    description:
      "(builtin) Stop all continuation mechanisms (ultrawork loop, todo continuation, ultrawork state) for this session",
    template: `<command-instruction>
${STOP_CONTINUATION_TEMPLATE}
</command-instruction>`,
  },
  "ghostwire:workflows:plan": {
    description: "Transform feature descriptions into implementation plans",
    template: `<command-instruction>
${WORKFLOWS_PLAN_TEMPLATE}
</command-instruction>

<feature-description>
$ARGUMENTS
</feature-description>`,
    argumentHint: "[feature description, bug report, or improvement idea]",
  },
  "ghostwire:workflows:create": {
    description:
      "Execute plan by breaking into tasks and coordinating implementation",
    template: `<command-instruction>
${WORKFLOWS_CREATE_TEMPLATE}
</command-instruction>

<plan-reference>
$ARGUMENTS
</plan-reference>`,
    argumentHint: "[plan-name or plan-file-path]",
  },
  "ghostwire:workflows:status": {
    description: "Check status of in-progress workflow or plan",
    template: `<command-instruction>
${WORKFLOWS_STATUS_TEMPLATE}
</command-instruction>

<workflow-reference>
$ARGUMENTS
</workflow-reference>`,
    argumentHint: "[workflow-id or plan-name]",
  },
  "ghostwire:workflows:complete": {
    description: "Finalize and archive completed workflow",
    template: `<command-instruction>
${WORKFLOWS_COMPLETE_TEMPLATE}
</command-instruction>

<workflow-reference>
$ARGUMENTS
</workflow-reference>`,
    argumentHint: "[workflow-id or plan-name]",
  },
  "ghostwire:code:refactor": {
    description: "Systematically refactor code while maintaining functionality",
    template: `<command-instruction>
${CODE_REFACTOR_TEMPLATE}
</command-instruction>

<refactoring-target>
$ARGUMENTS
</refactoring-target>`,
    argumentHint:
      "<target> [--scope=file|module|project] [--strategy=safe|aggressive]",
  },
  "ghostwire:code:review": {
    description: "Conduct comprehensive code reviews with specialist agents",
    template: `<command-instruction>
${CODE_REVIEW_TEMPLATE}
</command-instruction>

<code-context>
$ARGUMENTS
</code-context>`,
    argumentHint:
      "[file-path or PR-number] [--type=architecture|security|performance]",
  },
  "ghostwire:code:optimize": {
    description:
      "Improve performance, reduce bundle size, or enhance efficiency",
    template: `<command-instruction>
${CODE_OPTIMIZE_TEMPLATE}
</command-instruction>

<optimization-target>
$ARGUMENTS
</optimization-target>`,
    argumentHint: "[target] [--area=algorithmic|memory|cpu|network|build]",
  },
  "ghostwire:code:format": {
    description: "Apply consistent formatting and style standards",
    template: `<command-instruction>
${CODE_FORMAT_TEMPLATE}
</command-instruction>

<format-scope>
$ARGUMENTS
</format-scope>`,
    argumentHint: "[path-to-format] [--dry-run]",
  },
  "ghostwire:git:smart-commit": {
    description: "Generate well-structured commits following conventions",
    template: `<command-instruction>
${GIT_SMART_COMMIT_TEMPLATE}
</command-instruction>

<commit-context>
$ARGUMENTS
</commit-context>`,
    argumentHint: '[--message="custom message"]',
  },
  "ghostwire:git:branch": {
    description: "Create and manage feature branches with naming conventions",
    template: `<command-instruction>
${GIT_BRANCH_TEMPLATE}
</command-instruction>

<branch-context>
$ARGUMENTS
</branch-context>`,
    argumentHint: "[feature-description] [--type=feature|fix|refactor]",
  },
  "ghostwire:git:merge": {
    description: "Merge branches safely with conflict resolution",
    template: `<command-instruction>
${GIT_MERGE_TEMPLATE}
</command-instruction>

<merge-context>
$ARGUMENTS
</merge-context>`,
    argumentHint: "[branch-name] [--strategy=fast-forward|squash|rebase]",
  },
  "ghostwire:git:cleanup": {
    description: "Remove stale branches and optimize repository",
    template: `<command-instruction>
${GIT_CLEANUP_TEMPLATE}
</command-instruction>

<cleanup-options>
$ARGUMENTS
</cleanup-options>`,
    argumentHint: "[--days=N] [--dry-run]",
  },
  "ghostwire:project:init": {
    description: "Initialize new project with structure and tooling",
    template: `<command-instruction>
${PROJECT_INIT_TEMPLATE}
</command-instruction>

<project-context>
$ARGUMENTS
</project-context>`,
    argumentHint: "[project-name] [--type=web|api|library|cli|monorepo]",
  },
  "ghostwire:project:build": {
    description: "Compile, transpile, and bundle project code",
    template: `<command-instruction>
${PROJECT_BUILD_TEMPLATE}
</command-instruction>

<build-context>
$ARGUMENTS
</build-context>`,
    argumentHint: "[--mode=development|production|staging]",
  },
  "ghostwire:project:deploy": {
    description: "Deploy project to specified environment",
    template: `<command-instruction>
${PROJECT_DEPLOY_TEMPLATE}
</command-instruction>

<deploy-context>
$ARGUMENTS
</deploy-context>`,
    argumentHint: "[environment] [--strategy=blue-green|canary|standard]",
  },
  "ghostwire:project:test": {
    description: "Run test suites and measure code coverage",
    template: `<command-instruction>
${PROJECT_TEST_TEMPLATE}
</command-instruction>

<test-context>
$ARGUMENTS
</test-context>`,
    argumentHint: "[--type=unit|integration|e2e|all] [--coverage]",
  },
  "ghostwire:util:clean": {
    description: "Remove build artifacts and temporary files",
    template: `<command-instruction>
${UTIL_CLEAN_TEMPLATE}
</command-instruction>

<clean-context>
$ARGUMENTS
</clean-context>`,
    argumentHint: "[--level=light|standard|deep|aggressive] [--dry-run]",
  },
  "ghostwire:util:backup": {
    description: "Create backups of project state and files",
    template: `<command-instruction>
${UTIL_BACKUP_TEMPLATE}
</command-instruction>

<backup-context>
$ARGUMENTS
</backup-context>`,
    argumentHint: "[--type=snapshot|config|database|selective]",
  },
  "ghostwire:util:restore": {
    description: "Restore project from backup",
    template: `<command-instruction>
${UTIL_RESTORE_TEMPLATE}
</command-instruction>

<restore-context>
$ARGUMENTS
</restore-context>`,
    argumentHint: "[backup-name] [--selective] [--dry-run]",
  },
  "ghostwire:util:doctor": {
    description: "Diagnose project health and configuration",
    template: `<command-instruction>
${UTIL_DOCTOR_TEMPLATE}
</command-instruction>

<doctor-context>
$ARGUMENTS
</doctor-context>`,
    argumentHint: "[--fix] [--verbose]",
  },
  "ghostwire:docs:deploy-docs": {
    description: "Build and deploy documentation to hosting",
    template: `<command-instruction>
${DOCS_DEPLOY_DOCS_TEMPLATE}
</command-instruction>

<docs-context>
$ARGUMENTS
</docs-context>`,
    argumentHint:
      "[--target=github-pages|vercel|netlify|s3] [--version=latest|stable]",
  },
  "ghostwire:docs:release-docs": {
    description: "Create versioned documentation release",
    template: `<command-instruction>
${DOCS_RELEASE_DOCS_TEMPLATE}
</command-instruction>

<release-context>
$ARGUMENTS
</release-context>`,
    argumentHint: "[version] [--create-migration-guide]",
  },
  "ghostwire:docs:feature-video": {
    description: "Create demonstration video for feature",
    template: `<command-instruction>
${DOCS_FEATURE_VIDEO_TEMPLATE}
</command-instruction>

<video-context>
$ARGUMENTS
</video-context>`,
    argumentHint: "[feature-name] [--type=demo|tutorial|comparison|tip]",
  },
  "ghostwire:docs:test-browser": {
    description: "Test documentation in browser environment",
    template: `<command-instruction>
${DOCS_TEST_BROWSER_TEMPLATE}
</command-instruction>

<test-context>
$ARGUMENTS
</test-context>`,
    argumentHint:
      "[--browsers=chrome,firefox,safari] [--test-types=visual,functional,accessibility]",
  },
  "ghostwire:lint:ruby": {
    description: "Run linting and code quality checks on Ruby and ERB files",
    template: `<command-instruction>
${LINT_RUBY_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[--fix] [--files=path1,path2]",
  },
  // Plugin commands (non-workflow)
  "ghostwire:plan-review": {
    description: "Review implementation plans with multiple expert reviewers",
    template: `<command-instruction>
${PLAN_REVIEW_TEMPLATE}
</command-instruction>

<plan-file>
$ARGUMENTS
</plan-file>`,
    argumentHint: "[plan-file-path]",
  },
  "ghostwire:changelog": {
    description: "Generate and maintain changelog entries",
    template: `<command-instruction>
${CHANGELOG_TEMPLATE}
</command-instruction>

<changelog-context>
$ARGUMENTS
</changelog-context>`,
    argumentHint: "[--type=feature|fix|breaking] [--version=X.Y.Z]",
  },
  "ghostwire:create-agent-skill": {
    description: "Create a new Claude Code agent skill with scaffolding",
    template: `<command-instruction>
${CREATE_AGENT_SKILL_TEMPLATE}
</command-instruction>

<skill-context>
$ARGUMENTS
</skill-context>`,
    argumentHint: "[skill-name] [--description=...]",
  },
  "ghostwire:deepen-plan": {
    description:
      "Enhance implementation plans with deeper research and analysis",
    template: `<command-instruction>
${DEEPEN_PLAN_TEMPLATE}
</command-instruction>

<plan-file>
$ARGUMENTS
</plan-file>`,
    argumentHint: "[plan-file-path] [--agents=performance,security,ui]",
  },
  "ghostwire:deploy-docs": {
    description: "Deploy documentation to GitHub Pages",
    template: `<command-instruction>
${DEPLOY_DOCS_TEMPLATE}
</command-instruction>

<docs-context>
$ARGUMENTS
</docs-context>`,
    argumentHint: "[--version=latest|stable] [--dry-run]",
  },
  "ghostwire:feature-video": {
    description: "Create demonstration videos for new features",
    template: `<command-instruction>
${FEATURE_VIDEO_TEMPLATE}
</command-instruction>

<feature-context>
$ARGUMENTS
</feature-context>`,
    argumentHint: "[feature-name] [--type=demo|tutorial]",
  },
  "ghostwire:generate-command": {
    description: "Generate new slash commands with templates and structure",
    template: `<command-instruction>
${GENERATE_COMMAND_TEMPLATE}
</command-instruction>

<command-spec>
$ARGUMENTS
</command-spec>`,
    argumentHint: "[command-name] [--description=...]",
  },
  "ghostwire:heal-skill": {
    description: "Fix and validate existing agent skills",
    template: `<command-instruction>
${HEAL_SKILL_TEMPLATE}
</command-instruction>

<skill-path>
$ARGUMENTS
</skill-path>`,
    argumentHint: "[skill-directory-path]",
  },
  "ghostwire:lfg": {
    description: "Start a learning for growth session",
    template: `<command-instruction>
${LFG_TEMPLATE}
</command-instruction>

<learning-topic>
$ARGUMENTS
</learning-topic>`,
    argumentHint: "[topic] [--level=beginner|intermediate|advanced]",
  },
  "ghostwire:quiz-me": {
    description: "Test your knowledge with interactive quizzes",
    template: `<command-instruction>
${QUIZ_ME_TEMPLATE}
</command-instruction>

<quiz-topic>
$ARGUMENTS
</quiz-topic>`,
    argumentHint: "[topic] [--difficulty=easy|medium|hard]",
  },
  "ghostwire:release-docs": {
    description: "Create versioned documentation release",
    template: `<command-instruction>
${RELEASE_DOCS_TEMPLATE}
</command-instruction>

<release-context>
$ARGUMENTS
</release-context>`,
    argumentHint: "[version] [--create-migration-guide]",
  },
  "ghostwire:report-bug": {
    description: "Report a bug with detailed information and context",
    template: `<command-instruction>
${REPORT_BUG_TEMPLATE}
</command-instruction>

<bug-context>
$ARGUMENTS
</bug-context>`,
    argumentHint: "[--description=...] [--severity=critical|high|medium|low]",
  },
  "ghostwire:reproduce-bug": {
    description: "Reproduce and analyze a reported bug",
    template: `<command-instruction>
${REPRODUCE_BUG_TEMPLATE}
</command-instruction>

<bug-reproduction>
$ARGUMENTS
</bug-reproduction>`,
    argumentHint: "[issue-number or bug-description]",
  },
  "ghostwire:resolve-parallel": {
    description: "Resolve multiple GitHub issues in parallel",
    template: `<command-instruction>
${RESOLVE_PARALLEL_TEMPLATE}
</command-instruction>

<issues-context>
$ARGUMENTS
</issues-context>`,
    argumentHint: "[issue-numbers or filter]",
  },
  "ghostwire:resolve-pr-parallel": {
    description: "Review and resolve multiple pull requests in parallel",
    template: `<command-instruction>
${RESOLVE_PR_PARALLEL_TEMPLATE}
</command-instruction>

<pr-context>
$ARGUMENTS
</pr-context>`,
    argumentHint: "[pr-numbers or filter]",
  },
  "ghostwire:resolve-todo-parallel": {
    description: "Resolve all pending CLI todos using parallel processing",
    template: `<command-instruction>
${RESOLVE_TODO_PARALLEL_TEMPLATE}
</command-instruction>

<todos-context>
$ARGUMENTS
</todos-context>`,
    argumentHint: "[optional: specific todo ID or pattern]",
  },
  "ghostwire:sync-tutorials": {
    description: "Sync coding tutorials to GitHub repository",
    template: `<command-instruction>
${SYNC_TUTORIALS_TEMPLATE}
</command-instruction>

<sync-context>
$ARGUMENTS
</sync-context>`,
    argumentHint: "[]",
  },
  "ghostwire:teach-me": {
    description: "Start a teaching and learning session",
    template: `<command-instruction>
${TEACH_ME_TEMPLATE}
</command-instruction>

<learning-context>
$ARGUMENTS
</learning-context>`,
    argumentHint: "[topic]",
  },
  "ghostwire:test-browser": {
    description: "Run browser tests on pages affected by current PR or branch",
    template: `<command-instruction>
${TEST_BROWSER_TEMPLATE}
</command-instruction>

<test-context>
$ARGUMENTS
</test-context>`,
    argumentHint: "[PR number, branch name, or 'current' for current branch]",
  },
  "ghostwire:triage": {
    description: "Triage and categorize findings for the CLI todo system",
    template: `<command-instruction>
${TRIAGE_TEMPLATE}
</command-instruction>

<findings-context>
$ARGUMENTS
</findings-context>`,
    argumentHint: "[findings list or source type]",
  },
  "ghostwire:xcode-test": {
    description: "Build and test iOS apps on simulator using XcodeBuildMCP",
    template: `<command-instruction>
${XCODE_TEST_TEMPLATE}
</command-instruction>

<xcode-context>
$ARGUMENTS
</xcode-context>`,
    argumentHint: "[scheme name or 'current' to use default]",
  },
  // Plugin workflow commands
  "ghostwire:workflows:brainstorm": {
    description:
      "Scout Recon requirements and approaches through collaborative dialogue",
    template: `<command-instruction>
${WORKFLOWS_BRAINSTORM_TEMPLATE}
</command-instruction>

<brainstorm-context>
$ARGUMENTS
</brainstorm-context>`,
    argumentHint: "[feature idea or problem to scout-recon]",
  },
  "ghostwire:workflows:learnings": {
    description: "Document a recently solved problem to build team learnings",
    template: `<command-instruction>
${WORKFLOWS_LEARNINGS_TEMPLATE}
</command-instruction>

<learnings-context>
$ARGUMENTS
</learnings-context>`,
    argumentHint: "[optional: brief context about the fix]",
  },
  "ghostwire:workflows:review": {
    description: "Perform exhaustive code reviews using multi-agent analysis",
    template: `<command-instruction>
${WORKFLOWS_REVIEW_TEMPLATE}
</command-instruction>

<review-context>
$ARGUMENTS
</review-context>`,
    argumentHint: "[PR number, GitHub URL, branch name, or latest]",
  },
  "ghostwire:workflows:work": {
    description: "Execute work plans efficiently while maintaining quality",
    template: `<command-instruction>
${WORKFLOWS_WORK_TEMPLATE}
</command-instruction>

<work-context>
$ARGUMENTS
</work-context>`,
    argumentHint: "[plan file, specification, or todo file path]",
  },
  // Spec commands (from specify integration)
  "ghostwire:spec:create": {
    description: "Create feature specification from natural language description",
    template: `<command-instruction>
${SPEC_CREATE_TEMPLATE}
</command-instruction>

<feature-description>
$ARGUMENTS
</feature-description>`,
    argumentHint: '"feature description in natural language"',
  },
  "ghostwire:spec:plan": {
    description: "Create implementation plan from feature specification",
    template: `<command-instruction>
${SPEC_PLAN_TEMPLATE}
</command-instruction>

<specification-path>
$ARGUMENTS
</specification-path>`,
    argumentHint: "[path to spec.md or auto-detect from branch]",
  },
  "ghostwire:spec:tasks": {
    description: "Generate actionable tasks from implementation plan",
    template: `<command-instruction>
${SPEC_TASKS_TEMPLATE}
</command-instruction>

<plan-path>
$ARGUMENTS
</plan-path>`,
    argumentHint: "[path to plan.md or auto-detect from branch]",
  },
  "ghostwire:spec:implement": {
    description: "Execute all tasks from task breakdown",
    template: `<command-instruction>
${SPEC_IMPLEMENT_TEMPLATE}
</command-instruction>

<tasks-path>
$ARGUMENTS
</tasks-path>`,
    argumentHint: "[path to tasks.md or auto-detect from branch]",
  },
  "ghostwire:spec:clarify": {
    description: "Interactive Q&A to resolve specification ambiguities",
    template: `<command-instruction>
${SPEC_CLARIFY_TEMPLATE}
</command-instruction>

<specification-path>
$ARGUMENTS
</specification-path>`,
    argumentHint: "[path to spec.md or auto-detect from branch]",
  },
  "ghostwire:spec:analyze": {
    description: "Cross-artifact consistency validation",
    template: `<command-instruction>
${SPEC_ANALYZE_TEMPLATE}
</command-instruction>

<feature-directory>
$ARGUMENTS
</feature-directory>`,
    argumentHint: "[path to feature directory or auto-detect from branch]",
  },
  "ghostwire:spec:checklist": {
    description: "Generate domain-specific checklists",
    template: `<command-instruction>
${SPEC_CHECKLIST_TEMPLATE}
</command-instruction>

<domain-and-feature>
$ARGUMENTS
</domain-and-feature>`,
    argumentHint: "[domain] [feature name] (e.g., 'security user-auth')",
  },
  "ghostwire:spec:to-issues": {
    description: "Convert tasks to GitHub issues",
    template: `<command-instruction>
${SPEC_TO_ISSUES_TEMPLATE}
</command-instruction>

<tasks-path>
$ARGUMENTS
</tasks-path>`,
    argumentHint: "[path to tasks.md or auto-detect from branch]",
  },
  // Project commands
  "ghostwire:project:constitution": {
    description: "Create or update project constitution with core principles",
    template: `<command-instruction>
${PROJECT_CONSTITUTION_TEMPLATE}
</command-instruction>

<project-name>
$ARGUMENTS
</project-name>`,
    argumentHint: "[project name] (optional, defaults to repo name)",
  },
};

export function loadBuiltinCommands(
  disabledCommands?: BuiltinCommandName[],
): BuiltinCommands {
  const disabled = new Set(disabledCommands ?? []);
  const commands: BuiltinCommands = {};

  for (const [name, definition] of Object.entries(
    BUILTIN_COMMAND_DEFINITIONS,
  )) {
    if (!disabled.has(name as BuiltinCommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition;
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition;
    }
  }

  return commands;
}
