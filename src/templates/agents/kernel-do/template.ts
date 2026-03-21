import type { AgentTemplate } from "../../../core/templates/types';
import { DO_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates';

export function getKernelDoAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-do",
    description:
      "Execution coordinator: works through a plan task by task, handles status checks mid-execution, delegates to specialists, and stops on blockers. Requires a plan to exist before starting.",
    license: "MIT",
    compatibility: "Works with all kernel workflows",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Orchestration",
      tags: ["execution", "implementation", "coordination", "status"],
    },
    instructions: getAgentInstructions("kernel-do"),
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
    references: getAgentReferences("kernel-do", "references/do.md"),
  };
}
