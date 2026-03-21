import type { AgentTemplate } from "../../../core/templates/types';
import { CAPTURE_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates';

export function getKernelCaptureAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-capture",
    description:
      "Learnings and retrospective specialist: documents what happened, what worked, what didn't, and what to change. Use at the end of a project, sprint, or significant session.",
    license: "MIT",
    compatibility: "Works with all kernel workflows",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Orchestration",
      tags: ["capture", "retrospective", "learnings", "decisions"],
    },
    instructions: getAgentInstructions("kernel-capture"),
    capabilities: [
      "Retrospective facilitation",
      "Learnings documentation",
      "Decision rationale capture",
      "Process improvement identification",
    ],
    availableSkills: CAPTURE_AGENT_AVAILABLE_SKILLS,
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
    references: getAgentReferences("kernel-capture", "references/capture.md"),
  };
}
