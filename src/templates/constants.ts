/**
 * Template Constants
 *
 * Single source of truth for all skill names.
 * When updating a skill name, update it here and rebuild.
 *
 * SKILL_NAMES: Complete skill identifiers (includes prefix)
 *   - Defined with full prefix as they appear in generated files
 */

// =============================================================================
// Skill Names (must include prefix as defined in skill templates)
// =============================================================================
export const SKILL_NAMES = {
  // Git skills
  GIT_MASTER: "spec-git-master",

  // Frontend skills
  DESIGN: "spec-design",

  // Engineering skills
  CODE_QUALITY: "spec-code-quality",
  DEV_ENVIRONMENT: "spec-dev-environment",
  DOCS_WORKFLOW: "spec-docs-workflow",
  PROJECT_INIT: "spec-project-init",
  BUILD: "spec-build",
  DEPLOY: "spec-deploy",
  CONVENTIONS: "spec-conventions",
  MAP_CODEBASE: "spec-map-codebase",

  // Spec workflow skills
  JINN_CHECK: "spec-check",
  JINN_REVIEW: "spec-review",
  JINN_PROPOSE: "spec-propose",
  JINN_EXPLORE: "spec-explore",
  JINN_APPLY: "spec-apply",
  JINN_ARCHIVE: "spec-archive",
  JINN_SYNC: "spec-sync",
  JINN_TRIAGE: "spec-triage",
  JINN_UNBLOCK: "spec-unblock",
  JINN_READY_FOR_PROD: "spec-ready-for-prod",
} as const;
