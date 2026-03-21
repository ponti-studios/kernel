import type { AgentTemplate } from "../../../core/templates/types';
import { PLAN_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates';

export function getKernelPlanAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-plan",
    description:
      "Pre-implementation planning: interrogates intent, surfaces hidden requirements, maps dependencies, and produces a sequenced plan before any work begins. Do not skip this when the goal is unclear.",
    license: "MIT",
    compatibility: "Works with all kernel workflows",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Orchestration",
      tags: ["planning", "strategy", "requirements"],
    },
    instructions: getAgentInstructions("kernel-plan"),
    capabilities: [
      "Intent interrogation",
      "Requirement discovery",
      "Dependency mapping",
      "Risk identification",
      "Work breakdown and task sequencing",
    ],
    availableSkills: PLAN_AGENT_AVAILABLE_SKILLS,
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
    references: getAgentReferences("kernel-plan", "references/plan.md"),
  };
}
