/**
 * Template Constants
 *
 * Single source of truth for all command IDs and skill names.
 * When updating a command or skill name, update it here and rebuild.
 *
 * COMMAND_IDS: Base command identifiers (no prefix)
 *   - Used by the generator/adapter to create file paths
 *   - Used in agent templates via prefixCommand() helper
 *
 * SKILL_NAMES: Complete skill identifiers (includes prefix)
 *   - Defined with full prefix as they appear in generated files
 */

// =============================================================================
// Command IDs (single source of truth for all commands)
// =============================================================================
export const COMMAND_IDS = {
  // Git commands
  GIT_SMART_COMMIT: 'git-smart-commit',
  GIT_BRANCH: 'git-branch',
  GIT_CLEANUP: 'git-cleanup',
  GIT_MERGE: 'git-merge',

  // Code commands
  CODE_FORMAT: 'code-format',
  CODE_REFACTOR: 'code-refactor',
  CODE_REVIEW: 'code-review',
  CODE_OPTIMIZE: 'code-optimize',

  // Workflow commands
  WORKFLOWS_PLAN: 'workflows-plan',
  WORKFLOWS_EXECUTE: 'workflows-execute',
  WORKFLOWS_REVIEW: 'workflows-review',
  WORKFLOWS_STATUS: 'workflows-status',
  WORKFLOWS_STOP: 'workflows-stop',
  WORKFLOWS_COMPLETE: 'workflows-complete',
  WORKFLOWS_CREATE: 'workflows-create',
  WORKFLOWS_BRAINSTORM: 'workflows-brainstorm',
  WORKFLOWS_LEARNINGS: 'workflows-learnings',

  // Docs commands
  DOCS_DEPLOY: 'docs-deploy',
  DOCS_FEATURE_VIDEO: 'docs-feature-video',
  DOCS_RELEASE: 'docs-release',
  DOCS_TEST_BROWSER: 'docs-test-browser',

  // Project commands
  PROJECT_BUILD: 'project-build',
  PROJECT_CONSTITUTION: 'project-constitution',
  PROJECT_DEPLOY: 'project-deploy',
  PROJECT_INIT: 'project-init',
  PROJECT_MAP: 'project-map',

  // Utility commands
  UTIL_CLEAN: 'util-clean',
  UTIL_DOCTOR: 'util-doctor',

  // Jinn workflow commands
  JINN_PROPOSE: 'propose',
  JINN_EXPLORE: 'explore',
  JINN_APPLY: 'apply',
  JINN_ARCHIVE: 'archive',
} as const;

// =============================================================================
// Helper to apply command prefix (for agent templates)
// =============================================================================
export function prefixCommand(commandId: string): string {
  return `jinn-${commandId}`;
}

// =============================================================================
// Skill Names (must include prefix as defined in skill templates)
// =============================================================================
export const SKILL_NAMES = {
  // Git skills
  GIT_MASTER: 'jinn-git-master',

  // Frontend skills
  FRONTEND_DESIGN: 'jinn-frontend-design',

  // Jinn workflow skills
  JINN_PROPOSE: 'jinn-propose',
  JINN_EXPLORE: 'jinn-explore',
  JINN_APPLY: 'jinn-apply',
  JINN_ARCHIVE: 'jinn-archive',
  JINN_READY_FOR_PROD: 'jinn-ready-for-prod',
} as const;

