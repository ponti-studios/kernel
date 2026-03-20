import type { AgentTemplate } from "../../../core/templates/types.js";
import { ARCHITECT_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions } from "../../.generated/templates.js";

export function getArchitectAgentTemplate(): AgentTemplate {
  return {
    name: "spec-architect",
    description:
      "Architecture specialist: reviews design decisions, identifies patterns and anti-patterns, ensures scalable and maintainable structure. Use for architectural questions or after significant structural changes.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Specialist",
      tags: ["architecture", "patterns", "design"],
    },
    instructions: getAgentInstructions("spec-architect"),
    capabilities: [
      "Architecture review",
      "Pattern recognition",
      "Anti-pattern detection",
      "Dependency analysis",
    ],
    availableSkills: ARCHITECT_AGENT_AVAILABLE_SKILLS,
    role: "Specialist",
    route: "do",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "Architecture assessed",
      "Patterns identified",
      "Recommendations are concrete",
    ],
  };
}
