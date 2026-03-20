import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getPlanAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-plan",
    description:
      "Pre-implementation planning: interrogates intent, surfaces hidden requirements, maps dependencies, and produces a sequenced plan before any work begins. Do not skip this when the goal is unclear.",
    license: "MIT",
    compatibility: "Works with all jinn workflows",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Orchestration",
      tags: ["planning", "strategy", "requirements"],
    },
    instructions: getAgentInstructions("jinn-plan"),
    capabilities: [
      "Intent interrogation",
      "Requirement discovery",
      "Dependency mapping",
      "Risk identification",
      "Work breakdown and task sequencing",
    ],
    availableSkills: [
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.FRONTEND_DESIGN,
      SKILL_NAMES.JINN_EXPLORE,
      SKILL_NAMES.JINN_PROPOSE,
      SKILL_NAMES.JINN_TRIAGE,
    ],
    role: "Orchestration",
    route: "plan",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "Goal is unambiguous and written down",
      "All implicit requirements have been surfaced",
      "Dependency graph is correct and free of cycles",
      "Acceptance criteria are specific enough to be tested",
      "Risks and open questions are documented",
    ],
    references: getAgentReferences("jinn-plan", "references/plan.md"),
  };
}
