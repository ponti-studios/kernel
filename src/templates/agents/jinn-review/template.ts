import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getReviewAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-review",
    description:
      "Quality reviewer: reviews completed work for correctness, security, performance, and code quality. Use after implementation is complete before merging or deploying.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Reviewer",
      tags: ["review", "quality", "security"],
    },
    instructions: getAgentInstructions("jinn-review"),
    capabilities: ["Code review", "Security analysis", "Performance review", "Quality assessment"],
    availableSkills: [SKILL_NAMES.JINN_REVIEW, SKILL_NAMES.JINN_READY_FOR_PROD, SKILL_NAMES.JINN_SYNC, SKILL_NAMES.GIT_MASTER],
    role: "Reviewer",
    route: "review",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "All dimensions reviewed",
      "Issues are prioritized",
      "Suggestions are actionable",
    ],
    references: getAgentReferences(
      "jinn-review",
      "references/python.md",
      "references/typescript.md",
      "references/rails.md",
      "references/rails-dh.md",
      "references/security.md",
      "references/simplicity.md",
      "references/races.md",
    ),
  };
}
