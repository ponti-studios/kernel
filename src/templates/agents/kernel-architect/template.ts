import type { AgentTemplate } from "../../../core/templates/types.js";
import { AGENT_NAMES } from "../../constants.js";
import { ARCHITECT_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions, getAgentReferences } from "../../.generated/templates.js";

export function getArchitectAgentTemplate(): AgentTemplate {
  return {
    name: AGENT_NAMES.ARCHITECT,
    profile: "core",
    description:
      "Architecture specialist: reviews design decisions, identifies patterns and anti-patterns, ensures scalable and maintainable structure. Use for architectural questions or after significant structural changes.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Specialist",
      tags: ["architecture", "patterns", "design"],
    },
    instructions: getAgentInstructions(AGENT_NAMES.ARCHITECT),
    capabilities: [
      "Architecture review",
      "Pattern recognition",
      "Anti-pattern detection",
      "Dependency analysis",
    ],
    availableSkills: ARCHITECT_AGENT_AVAILABLE_SKILLS,
    role: "Specialist",
    route: "architect",
    defaultTools: ["read", "search"],
    permissionMode: "plan",
    maxTurns: 30,
    memory: "project",
    disallowedTools: ["Edit", "Write", "Bash"],
    sandboxMode: "read-only",
    reasoningEffort: "high",
    acceptanceChecks: [
      "Architecture assessed",
      "Patterns identified",
      "Recommendations are concrete",
    ],
    references: getAgentReferences(
      AGENT_NAMES.ARCHITECT,
      "references/patterns.md",
      "references/dependencies.md",
    ),
  };
}
