import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import projectSetupSkillMarkdown from "./instructions.md";

export function getProjectSetupSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PROJECT_SETUP,
    profile: "extended",
    description:
      "Manages the full lifecycle of a local development environment: initial setup, daily workflow, health diagnostics, cleanup, and backup/restore. Use when onboarding to a project for the first time, the dev environment feels broken, dependencies are stale, or when users ask how to set up, reset, or diagnose their local environment.",
    license: "MIT",
    compatibility: "Works with any development environment",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Engineering",
      tags: [
        "environment",
        "setup",
        "onboarding",
        "cleanup",
        "health",
        "backup",
        "maintenance",
        "monorepo",
        "docker",
      ],
    },
    when: [
      "user is setting up a project for the first time on a new machine",
      "user is onboarding a new developer to the project",
      "the development environment has a health issue to diagnose",
      "user needs to clean up build artifacts, caches, or temporary files",
      "user needs to reset or restore a broken local environment",
      "user needs to back up project files before a risky change",
    ],
    applicability: [
      "Use for any first-time or fresh-clone project setup",
      "Use for environment hygiene: diagnosing, cleaning, backing up, or restoring",
      "Use when setup documentation is missing or the README instructions fail",
    ],
    termination: [
      "Development server starts and serves the application",
      "All required environment variables are configured",
      "Environment cleaned and verified functional",
      "Health check completed with issues identified and remediation steps provided",
    ],
    outputs: [
      "Working local development environment with running dev server",
      "Health report with diagnosed issues and remediation steps",
      "Clean workspace or restored project state",
    ],
    dependencies: [],
    instructions: parseFrontmatter(projectSetupSkillMarkdown).body,
  };
}
