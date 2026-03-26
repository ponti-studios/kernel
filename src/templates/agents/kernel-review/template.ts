import type { AgentTemplate } from "../../../core/templates/types.js";
import { AGENT_NAMES } from "../../constants.js";
import { REVIEW_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getReviewAgentTemplate(): AgentTemplate {
  return {
    name: AGENT_NAMES.REVIEW,
    profile: "core",
    description:
      "Quality reviewer: reviews completed work for correctness, security, performance, and code quality. Use after implementation is complete before merging or deploying.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Reviewer",
      tags: ["review", "quality", "security"],
    },
    instructions: getAgentInstructions(AGENT_NAMES.REVIEW),
    capabilities: ["Code review", "Security analysis", "Performance review", "Quality assessment"],
    availableSkills: REVIEW_AGENT_AVAILABLE_SKILLS,
    role: "Reviewer",
    route: "review",
    defaultTools: ["read", "search"],
    permissionMode: "plan",
    maxTurns: 50,
    memory: "project",
    disallowedTools: ["Edit", "Write", "Bash"],
    sandboxMode: "read-only",
    reasoningEffort: "high",
    acceptanceChecks: [
      "All dimensions reviewed",
      "Issues are prioritized",
      "Suggestions are actionable",
    ],
    references: getAgentReferences(
      AGENT_NAMES.REVIEW,
      "references/python.md",
      "references/typescript.md",
      "references/security.md",
      "references/simplicity.md",
      "references/races.md",
    ),
  };
}
