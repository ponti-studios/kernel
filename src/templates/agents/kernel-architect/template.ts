import type { AgentTemplate } from "../../../core/templates/types';
import { ARCHITECT_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions } from "../../.generated/templates';

export function getKernelArchitectAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-architect",
    description:
      "Architecture specialist: reviews design decisions, identifies patterns and anti-patterns, ensures scalable and maintainable structure. Use for architectural questions or after significant structural changes.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Specialist",
      tags: ["architecture", "patterns", "design"],
    },
    instructions: getAgentInstructions("kernel-architect"),
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
