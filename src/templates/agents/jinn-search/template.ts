import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getSearchAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-search",
    description:
      "Search specialist: locates code, finds documentation, traces history, and retrieves prior learnings. Use when you need targeted research across the codebase or external sources.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Research",
      tags: ["search", "codebase", "docs", "history", "learnings"],
    },
    instructions: getAgentInstructions("jinn-search"),
    capabilities: ["Code search", "Documentation research", "History analysis", "Knowledge retrieval"],
    availableSkills: [SKILL_NAMES.GIT_MASTER, SKILL_NAMES.JINN_READY_FOR_PROD],
    role: "Research",
    route: "research",
    defaultTools: ["search", "read", "web"],
    acceptanceChecks: ["Search scope identified", "Relevant results returned", "Findings are actionable"],
    references: getAgentReferences(
      "jinn-search",
      "references/code.md",
      "references/docs.md",
      "references/history.md",
      "references/learnings.md",
    ),
  };
}
