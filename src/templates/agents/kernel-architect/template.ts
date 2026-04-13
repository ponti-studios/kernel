import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { AgentTemplate } from "../../../core/templates/types.js";
import { AGENT_NAMES } from "../../constants.js";
import { ARCHITECT_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import architectAgentMarkdown from "./AGENT.md";

const { body } = parseFrontmatter(architectAgentMarkdown);

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
    instructions: body,
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
    allowedTools: ["Read", "Grep", "Glob"],
    argumentHint:
      "code or architecture question (e.g., 'review the database schema', 'how should we structure the API')",
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
  };
}
