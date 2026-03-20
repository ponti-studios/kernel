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
  GIT_MASTER: "jinn-git-master",

  // Frontend skills
  FRONTEND_DESIGN: "jinn-frontend-design",
  DESIGN_SYSTEM: "design-system",

  // Engineering skills
  CODE_QUALITY: "jinn-code-quality",
  DEV_ENVIRONMENT: "jinn-dev-environment",
  DOCS_WORKFLOW: "jinn-docs-workflow",
  PROJECT_INIT: "jinn-project-init",
  BUILD: "jinn-build",
  DEPLOY: "jinn-deploy",
  CONVENTIONS: "jinn-conventions",
  MAP_CODEBASE: "jinn-map-codebase",

  // Jinn workflow skills
  JINN_CHECK: "jinn-check",
  JINN_REVIEW: "jinn-review",
  JINN_PROPOSE: "jinn-propose",
  JINN_EXPLORE: "jinn-explore",
  JINN_APPLY: "jinn-apply",
  JINN_ARCHIVE: "jinn-archive",
  JINN_SYNC: "jinn-sync",
  JINN_TRIAGE: "jinn-triage",
  JINN_UNBLOCK: "jinn-unblock",
  JINN_READY_FOR_PROD: "jinn-ready-for-prod",
} as const;
