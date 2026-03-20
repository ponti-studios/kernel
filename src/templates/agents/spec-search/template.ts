import type { AgentTemplate } from "../../../core/templates/types.js";
import { SEARCH_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getSearchAgentTemplate(): AgentTemplate {
  return {
    name: "spec-search",
    description:
      "Search specialist: locates code, finds documentation, traces history, and retrieves prior learnings. Use when you need targeted research across the codebase or external sources.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Research",
      tags: ["search", "codebase", "docs", "history", "learnings"],
    },
    instructions: getAgentInstructions("spec-search"),
    capabilities: ["Code search", "Documentation research", "History analysis", "Knowledge retrieval"],
    availableSkills: SEARCH_AGENT_AVAILABLE_SKILLS,
    role: "Research",
    route: "research",
    defaultTools: ["search", "read", "web"],
    acceptanceChecks: ["Search scope identified", "Relevant results returned", "Findings are actionable"],
    references: getAgentReferences(
      "spec-search",
      "references/code.md",
      "references/docs.md",
      "references/history.md",
      "references/learnings.md",
    ),
  };
}
