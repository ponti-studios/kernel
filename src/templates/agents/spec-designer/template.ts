import type { AgentTemplate } from "../../../core/templates/types.js";
import { DESIGNER_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions } from "../../.generated/templates.js";

export function getDesignerAgentTemplate(): AgentTemplate {
  return {
    name: "spec-designer",
    description:
      "Frontend designer: builds production-grade UIs, implements components, maps user flows, iterates on design quality, and verifies implementation against design specs. Use for all frontend and UI work.",
    license: "MIT",
    compatibility: "Works with frontend projects",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Specialist",
      tags: ["frontend", "ui", "ux", "design", "figma"],
    },
    instructions: getAgentInstructions("spec-designer"),
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
    route: "do",
    defaultTools: ["edit", "read", "search"],
    acceptanceChecks: [
      "Design is production-ready",
      "Implementation matches specs",
      "Accessible",
      "Responsive",
    ],
  };
}
