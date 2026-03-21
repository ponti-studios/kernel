import type { AgentTemplate } from "../../../core/templates/types';
import { SEARCH_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates';

export function getKernelSearchAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-search",
    description:
      "Search specialist: locates code, finds documentation, traces history, and retrieves prior learnings. Use when you need targeted research across the codebase or external sources.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Research",
      tags: ["search", "codebase", "docs", "history", "learnings"],
    },
    instructions: getAgentInstructions("kernel-search"),
    capabilities: ["Code search", "Documentation research", "History analysis", "Knowledge retrieval"],
    availableSkills: SEARCH_AGENT_AVAILABLE_SKILLS,
    role: "Research",
    route: "research",
    defaultTools: ["search", "read", "web"],
    acceptanceChecks: ["Search scope identified", "Relevant results returned", "Findings are actionable"],
    references: getAgentReferences(
      "kernel-search",
      "references/code.md",
      "references/docs.md",
      "references/history.md",
      "references/learnings.md",
    ),
  };
}
