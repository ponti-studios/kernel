import type { AgentTemplate } from "../../../core/templates/types';
import { REVIEW_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates';

export function getKernelReviewAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-review",
    description:
      "Quality reviewer: reviews completed work for correctness, security, performance, and code quality. Use after implementation is complete before merging or deploying.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Reviewer",
      tags: ["review", "quality", "security"],
    },
    instructions: getAgentInstructions("kernel-review"),
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
      "kernel-review",
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
