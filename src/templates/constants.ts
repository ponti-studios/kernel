/**
 * Template Constants
 *
 * Single source of truth for all skill names.
 * When updating a skill name, update it here and rebuild.
 *
 * SKILL_NAMES: Complete skill identifiers (includes prefix)
 *   - Defined with full prefix as they appear in generated files
 */

export const KERNEL_TEMPLATE_PREFIX = "kernel-";

export function prefixKernelTemplateName(name: string): string {
  return name.startsWith(KERNEL_TEMPLATE_PREFIX) ? name : `${KERNEL_TEMPLATE_PREFIX}${name}`;
}

// =============================================================================
// Skill Names (must include prefix as defined in skill templates)
// =============================================================================
export const SKILL_NAMES = {
  // Git skills
  GIT_MASTER: prefixKernelTemplateName("git-master"),

  // Engineering skills
  PROJECT_SETUP: prefixKernelTemplateName("project-setup"),
  DOCS_WORKFLOW: prefixKernelTemplateName("docs-workflow"),
  PROJECT_INIT: prefixKernelTemplateName("project-init"),
  BUILD: prefixKernelTemplateName("build"),
  MAP_CODEBASE: prefixKernelTemplateName("map-codebase"),

  // Workflow skills
  APPLY: prefixKernelTemplateName("apply"),
  ARCHIVE: prefixKernelTemplateName("archive"),
  BOARD: prefixKernelTemplateName("board"),
  CLOSE: prefixKernelTemplateName("close"),
  EXECUTE: prefixKernelTemplateName("execute"),
  EXPLORE: prefixKernelTemplateName("explore"),
  GH_PR_ERRORS: prefixKernelTemplateName("gh-pr-errors"),
  INTAKE: prefixKernelTemplateName("intake"),
  CHANGE_APPLY: prefixKernelTemplateName("change-apply"),
  CHANGE_ARCHIVE: prefixKernelTemplateName("change-archive"),
  CHANGE_EXPLORE: prefixKernelTemplateName("change-explore"),
  CHANGE_PROPOSE: prefixKernelTemplateName("change-propose"),
  PLAN: prefixKernelTemplateName("plan"),
  PROPOSE: prefixKernelTemplateName("propose"),
  RESEARCH: prefixKernelTemplateName("research"),
  REVIEW: prefixKernelTemplateName("review"),
  SHIP: prefixKernelTemplateName("ship"),
  STATUS: prefixKernelTemplateName("status"),
  SYNC: prefixKernelTemplateName("sync"),
  TRIAGE: prefixKernelTemplateName("triage"),
  UNBLOCK: prefixKernelTemplateName("unblock"),
  // Specialist skills
  API_ENGINEERING: prefixKernelTemplateName("api-engineering"),
  ASSET_INTEGRATION_SECURITY: prefixKernelTemplateName("asset-integration-security"),
  AUTH_CONTRACT: prefixKernelTemplateName("auth-contract"),
  DATABASE_WORKFLOW: prefixKernelTemplateName("database-workflow"),
  DOCKER_WORKFLOW: prefixKernelTemplateName("docker-workflow"),
  PDF: prefixKernelTemplateName("pdf"),
  REACT_PATTERNS: prefixKernelTemplateName("react-patterns"),
  TESTING_STANDARDS: prefixKernelTemplateName("testing-standards"),
  TYPE_ARCHITECTURE: prefixKernelTemplateName("type-architecture"),
  // Mobile skills
  REACT_NATIVE: prefixKernelTemplateName("react-native"),

  // Design skills
  DESIGN: prefixKernelTemplateName("design"),
  // Ecosystem skills
  SKILL_BUILDER: prefixKernelTemplateName("skill-builder"),
} as const;

export const EXTENDED_SKILL_NAMES: Record<string, never> = {} as const;

export const AGENT_NAMES = {
  ARCHITECT: prefixKernelTemplateName("architect"),
  CAPTURE: prefixKernelTemplateName("capture"),
  DESIGNER: prefixKernelTemplateName("designer"),
  DO: prefixKernelTemplateName("do"),
  GIT: prefixKernelTemplateName("git"),
  PLAN: prefixKernelTemplateName("plan"),
  REVIEW: prefixKernelTemplateName("review"),
  SEARCH: prefixKernelTemplateName("search"),
} as const;

export const COMMAND_NAMES = {
  GH_PR_ERRORS: "gh-pr-errors",
  CHANGE_APPLY: "kernel-change-apply",
  CHANGE_ARCHIVE: "kernel-change-archive",
  CHANGE_EXPLORE: "kernel-change-explore",
  CHANGE_PROPOSE: "kernel-change-propose",
  SPEC_ANALYZE: "kernel-spec-analyze",
  SPEC_CHECKLIST: "kernel-spec-checklist",
  SPEC_CLARIFY: "kernel-spec-clarify",
  SPEC_CONSTITUTION: "kernel-spec-constitution",
  SPEC_GIT_COMMIT: "kernel-spec-git-commit",
  SPEC_GIT_FEATURE: "kernel-spec-git-feature",
  SPEC_GIT_INITIALIZE: "kernel-spec-git-initialize",
  SPEC_GIT_REMOTE: "kernel-spec-git-remote",
  SPEC_GIT_VALIDATE: "kernel-spec-git-validate",
  SPEC_IMPLEMENT: "kernel-spec-implement",
  SPEC_PLAN: "kernel-spec-plan",
  SPEC_SPECIFY: "kernel-specify",
  SPEC_TASKS: "kernel-spec-tasks",
  SPEC_TASKS_TO_ISSUES: "kernel-spec-tasks-to-issues",
} as const;
