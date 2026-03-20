import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getReadyForProdSkillTemplate(): SkillTemplate {
  return {
    name: "spec-ready-for-prod",
    description:
      "Use when validating production readiness before a release, deployment, or launch decision.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Quality",
      tags: ["quality", "production", "deployment", "readiness"],
    },
    when: [
      "user is about to release, deploy, or merge to production",
      'user asks "is this ready?" or "can we ship this?"',
      "a PR or branch needs a final quality gate before merging",
    ],
    applicability: [
      "Use before any production deployment, release, or launch",
      "Use when validating code quality, security, tests, and documentation",
    ],
    termination: [
      "All checklist categories reviewed",
      "Pass or fail verdict delivered with blocking items listed",
      "Verdict written to the associated Linear issue (if one exists)",
    ],
    outputs: ["Production readiness report", "List of blocking issues (if any)", "Linear comment with verdict"],
    dependencies: [],
    instructions: getSkillInstructions("spec-ready-for-prod"),
  };
}
