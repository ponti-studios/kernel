import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getDevEnvironmentSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-dev-environment",
    description:
      "Developer environment maintenance: health checks, cleanup, backup, restore, and session management.",
    license: "MIT",
    compatibility: "Works with any development environment",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Engineering",
      tags: ["environment", "cleanup", "health", "backup", "maintenance"],
    },
    when: [
      "user needs to clean up build artifacts, caches, or temporary files",
      "the development environment has a health issue to diagnose",
      "user needs to back up or restore project files before a risky change",
      "an in-progress task needs to be cleanly stopped or cancelled",
    ],
    applicability: [
      "Use for environment hygiene: cleaning, diagnosing, backing up, or restoring",
      "Use when cancelling or managing the state of an in-progress session",
    ],
    termination: [
      "Environment cleaned and verified functional",
      "Health check completed with issues identified",
      "Backup created or restore completed",
    ],
    outputs: [
      "Clean workspace with temporary files removed",
      "Health report with diagnosed issues and remediation steps",
      "Backup archive or restored project state",
    ],
    dependencies: [],
    instructions: getSkillInstructions("jinn-dev-environment"),
  };
}
