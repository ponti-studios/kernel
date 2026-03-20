import type { AgentTemplate } from "../../../core/templates/types.js";
import { DO_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getDoAgentTemplate(): AgentTemplate {
  return {
    name: "spec-do",
    description:
      "Execution coordinator: works through a plan task by task, handles status checks mid-execution, delegates to specialists, and stops on blockers. Requires a plan to exist before starting.",
    license: "MIT",
    compatibility: "Works with all spec workflows",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Orchestration",
      tags: ["execution", "implementation", "coordination", "status"],
    },
    instructions: getAgentInstructions("spec-do"),
    capabilities: [
      "Task-by-task execution",
      "Mid-execution status reporting",
      "Blocker identification and escalation",
      "Specialist delegation",
      "Project lifecycle coordination",
    ],
    availableSkills: DO_AGENT_AVAILABLE_SKILLS,
    role: "Orchestration",
    route: "do",
    defaultTools: ["edit", "read", "search", "task"],
    acceptanceChecks: [
      "All tasks complete",
      "Each task verified against its acceptance criterion",
      "No silent assumptions made",
      "Blockers are named and visible",
    ],
    references: getAgentReferences("spec-do", "references/do.md"),
  };
}
