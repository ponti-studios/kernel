import type { AgentTemplate } from "../../../core/templates/types.js";
import { AGENT_NAMES } from "../../constants.js";
import { DESIGNER_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getDesignerAgentTemplate(): AgentTemplate {
  return {
    name: AGENT_NAMES.DESIGNER,
    profile: "core",
    description:
      "Frontend designer: builds production-grade UIs, implements components, maps user flows, iterates on design quality, and verifies implementation against design specs. Use for all frontend and UI work.",
    license: "MIT",
    compatibility: "Works with frontend projects",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Specialist",
      tags: ["frontend", "ui", "ux", "design", "figma"],
    },
    instructions: getAgentInstructions(AGENT_NAMES.DESIGNER),
    capabilities: [
      "UI implementation",
      "Component architecture",
      "User flow analysis",
      "Design verification",
      "Figma sync",
      "Accessibility",
    ],
    availableSkills: DESIGNER_AGENT_AVAILABLE_SKILLS,
    role: "Specialist",
    route: "design",
    defaultTools: ["edit", "read", "search"],
    maxTurns: 100,
    sandboxMode: "workspace-write",
    reasoningEffort: "medium",
    acceptanceChecks: [
      "Design is production-ready",
      "Implementation matches specs",
      "Accessible",
      "Responsive",
    ],
    references: getAgentReferences(
      AGENT_NAMES.DESIGNER,
      "references/components.md",
      "references/accessibility.md",
    ),
  };
}
