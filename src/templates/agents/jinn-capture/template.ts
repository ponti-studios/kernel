import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getCaptureAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-capture",
    description:
      "Learnings and retrospective specialist: documents what happened, what worked, what didn't, and what to change. Use at the end of a project, sprint, or significant session.",
    license: "MIT",
    compatibility: "Works with all jinn workflows",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Orchestration",
      tags: ["capture", "retrospective", "learnings", "decisions"],
    },
    instructions: getAgentInstructions("jinn-capture"),
    capabilities: [
      "Retrospective facilitation",
      "Learnings documentation",
      "Decision rationale capture",
      "Process improvement identification",
    ],
    availableSkills: [SKILL_NAMES.GIT_MASTER, SKILL_NAMES.JINN_ARCHIVE],
    role: "Orchestration",
    route: "capture",
    defaultTools: ["read", "write"],
    acceptanceChecks: [
      "What went well is documented with root causes (not just outcomes)",
      "What didn't work names specific root causes, not symptoms",
      "Each failure has a concrete, actionable change",
      "Key decisions include rationale, alternatives, and revisit conditions",
      "Output is stored where future contributors will find it",
    ],
    references: getAgentReferences("jinn-capture", "references/capture.md"),
  };
}
