import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getAgentInstructions } from "../../.generated/templates.js";

export function getDesignerAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-designer",
    description:
      "Frontend designer: builds production-grade UIs, implements components, maps user flows, iterates on design quality, and verifies implementation against design specs. Use for all frontend and UI work.",
    license: "MIT",
    compatibility: "Works with frontend projects",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Specialist",
      tags: ["frontend", "ui", "ux", "design", "figma"],
    },
    instructions: getAgentInstructions("jinn-designer"),
    capabilities: [
      "UI implementation",
      "Component architecture",
      "User flow analysis",
      "Design verification",
      "Figma sync",
      "Accessibility",
    ],
    availableSkills: [SKILL_NAMES.JINN_READY_FOR_PROD, SKILL_NAMES.GIT_MASTER],
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
