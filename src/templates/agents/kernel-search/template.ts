import type { AgentTemplate } from "../../../core/templates/types.js";
import { AGENT_NAMES } from "../../constants.js";
import { SEARCH_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getSearchAgentTemplate(): AgentTemplate {
  return {
    name: AGENT_NAMES.SEARCH,
    profile: "core",
    description:
      "Search specialist: locates code, finds documentation, traces history, and retrieves prior learnings. Use when you need targeted research across the codebase or external sources.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Research",
      tags: ["search", "codebase", "docs", "history", "learnings"],
    },
    instructions: getAgentInstructions(AGENT_NAMES.SEARCH),
    capabilities: ["Code search", "Documentation research", "History analysis", "Knowledge retrieval"],
    availableSkills: SEARCH_AGENT_AVAILABLE_SKILLS,
    role: "Research",
    route: "research",
    defaultTools: ["search", "read", "web"],
    permissionMode: "plan",
    maxTurns: 20,
    disallowedTools: ["Edit", "Write"],
    sandboxMode: "read-only",
    reasoningEffort: "low",
    acceptanceChecks: ["Search scope identified", "Relevant results returned", "Findings are actionable"],
    references: getAgentReferences(
      AGENT_NAMES.SEARCH,
      "references/code.md",
      "references/docs.md",
      "references/history.md",
      "references/learnings.md",
    ),
  };
}
