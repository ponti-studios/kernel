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
  GIT: prefixKernelTemplateName("git"),

  // Engineering skills
  PROJECT_SETUP: prefixKernelTemplateName("project-setup"),
  DOCS: prefixKernelTemplateName("docs"),
  PROJECT_INIT: prefixKernelTemplateName("project-init"),
  BUILD: prefixKernelTemplateName("build"),
  LOCATE: prefixKernelTemplateName("locate"),

  // Workflow skills
  APPLY: prefixKernelTemplateName("apply"),
  ARCHIVE: prefixKernelTemplateName("archive"),
  BOARD: prefixKernelTemplateName("board"),
  CLOSE: prefixKernelTemplateName("close"),
  EXECUTE: prefixKernelTemplateName("execute"),
  INTAKE: prefixKernelTemplateName("intake"),
  PLAN: prefixKernelTemplateName("plan"),
  PROPOSE: prefixKernelTemplateName("propose"),
  INVESTIGATE: prefixKernelTemplateName("investigate"),
  REVIEW: prefixKernelTemplateName("review"),
  SHIP: prefixKernelTemplateName("ship"),
  STATUS: prefixKernelTemplateName("status"),
  SYNC: prefixKernelTemplateName("sync"),
  TRIAGE: prefixKernelTemplateName("triage"),
  UNBLOCK: prefixKernelTemplateName("unblock"),
  // Specialist skills
  API_ARCHITECTURE: prefixKernelTemplateName("api-architecture"),
  ASSET_INTEGRATION_SECURITY: prefixKernelTemplateName("asset-integration-security"),
  AUTH_CONTRACT: prefixKernelTemplateName("auth-contract"),
  DATABASE: prefixKernelTemplateName("database"),
  DOCKER: prefixKernelTemplateName("docker"),
  PDF: prefixKernelTemplateName("pdf"),
  REACT: prefixKernelTemplateName("react"),
  TESTING: prefixKernelTemplateName("testing"),
  TYPESCRIPT_ARCHITECTURE: prefixKernelTemplateName("typescript-architecture"),
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
  INIT: "kernel-init",
  SYNC: "kernel-sync",
  DOCTOR: "kernel-doctor",
  GH_PR_ERRORS: "gh-pr-errors",
  INITIATIVE_NEW: "kernel-initiative-new",
  INITIATIVE_PLAN: "kernel-initiative-plan",
  INITIATIVE_STATUS: "kernel-initiative-status",
  INITIATIVE_LIST: "kernel-initiative-list",
  INITIATIVE_DONE: "kernel-initiative-done",
  PROJECT_NEW: "kernel-project-new",
  PROJECT_PLAN: "kernel-project-plan",
  PROJECT_STATUS: "kernel-project-status",
  PROJECT_LIST: "kernel-project-list",
  PROJECT_DONE: "kernel-project-done",
  MILESTONE_NEW: "kernel-milestone-new",
  MILESTONE_PLAN: "kernel-milestone-plan",
  MILESTONE_STATUS: "kernel-milestone-status",
  MILESTONE_LIST: "kernel-milestone-list",
  MILESTONE_DONE: "kernel-milestone-done",
  WORK_NEW: "kernel-work-new",
  WORK_PLAN: "kernel-work-plan",
  WORK_NEXT: "kernel-work-next",
  WORK_DONE: "kernel-work-done",
  WORK_STATUS: "kernel-work-status",
  WORK_ARCHIVE: "kernel-work-archive",
} as const;
