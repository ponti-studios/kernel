import type { AgentTemplate } from "../../../core/templates/types.js";
import { REVIEW_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getReviewAgentTemplate(): AgentTemplate {
  return {
    name: "spec-review",
    description:
      "Quality reviewer: reviews completed work for correctness, security, performance, and code quality. Use after implementation is complete before merging or deploying.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Reviewer",
      tags: ["review", "quality", "security"],
    },
    instructions: getAgentInstructions("spec-review"),
    capabilities: ["Code review", "Security analysis", "Performance review", "Quality assessment"],
    availableSkills: REVIEW_AGENT_AVAILABLE_SKILLS,
    role: "Reviewer",
    route: "review",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "All dimensions reviewed",
      "Issues are prioritized",
      "Suggestions are actionable",
    ],
    references: getAgentReferences(
      "spec-review",
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
