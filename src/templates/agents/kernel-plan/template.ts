import type { AgentTemplate } from "../../../core/templates/types.js";
import { getAgentInstructions } from "../../.generated/templates.js";
import { AGENT_NAMES } from "../../constants.js";
import { PLAN_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";

export function getPlanAgentTemplate(): AgentTemplate {
  return {
    name: AGENT_NAMES.PLAN,
    profile: "core",
    description:
      "Pre-implementation planning: interrogates intent, surfaces hidden requirements, maps dependencies, and produces a sequenced plan before any work begins. Do not skip this when the goal is unclear.",
    license: "MIT",
    compatibility: "Works with all workflows",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Orchestration",
      tags: ["planning", "strategy", "requirements"],
    },
    instructions: getAgentInstructions(AGENT_NAMES.PLAN),
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
    allowedTools: ["Read", "Grep", "Glob"],
    argumentHint: "goal or task to plan (e.g., 'add user authentication', 'refactor the API layer')",
    permissionMode: "plan",
    maxTurns: 30,
    memory: "project",
    disallowedTools: ["Edit", "Write", "Bash"],
    sandboxMode: "read-only",
    reasoningEffort: "high",
    acceptanceChecks: [
      "Goal is unambiguous and written down",
      "All implicit requirements have been surfaced",
      "Dependency graph is correct and free of cycles",
      "Acceptance criteria are specific enough to be tested",
      "Risks and open questions are documented",
    ],
    handoffs: [
      {
        label: "Start Execution",
        agent: "kernel-do",
        prompt: "The plan above is approved. Execute it.",
        send: false,
      },
    ],
  };
}
