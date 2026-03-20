import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getDoAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-do",
    description:
      "Execution coordinator: works through a plan task by task, handles status checks mid-execution, delegates to specialists, and stops on blockers. Requires a plan to exist before starting.",
    license: "MIT",
    compatibility: "Works with all jinn workflows",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Orchestration",
      tags: ["execution", "implementation", "coordination", "status"],
    },
    instructions: getAgentInstructions("jinn-do"),
    capabilities: [
      "Task-by-task execution",
      "Mid-execution status reporting",
      "Blocker identification and escalation",
      "Specialist delegation",
      "Project lifecycle coordination",
    ],
    availableSkills: [
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.FRONTEND_DESIGN,
      SKILL_NAMES.JINN_CHECK,
      SKILL_NAMES.JINN_REVIEW,
      SKILL_NAMES.JINN_APPLY,
      SKILL_NAMES.JINN_SYNC,
      SKILL_NAMES.JINN_TRIAGE,
      SKILL_NAMES.JINN_UNBLOCK,
      SKILL_NAMES.JINN_READY_FOR_PROD,
      SKILL_NAMES.PROJECT_INIT,
      SKILL_NAMES.BUILD,
      SKILL_NAMES.DEPLOY,
      SKILL_NAMES.CONVENTIONS,
      SKILL_NAMES.MAP_CODEBASE,
    ],
    role: "Orchestration",
    route: "do",
    defaultTools: ["edit", "read", "search", "task"],
    acceptanceChecks: [
      "All tasks complete",
      "Each task verified against its acceptance criterion",
      "No silent assumptions made",
      "Blockers are named and visible",
    ],
    references: getAgentReferences("jinn-do", "references/do.md"),
  };
}
