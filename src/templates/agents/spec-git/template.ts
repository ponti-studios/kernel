import type { AgentTemplate } from "../../../core/templates/types.js";
import { GIT_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import { getAgentInstructions } from "../../.generated/templates.js";

export function getGitAgentTemplate(): AgentTemplate {
  return {
    name: "spec-git",
    description:
      "Git specialist: branch strategy, commit hygiene, merge conflict resolution, and history analysis. Use for complex git operations or when you need to understand the history of a codebase.",
    license: "MIT",
    compatibility: "Works with git repositories",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Specialist",
      tags: ["git", "version-control", "history"],
    },
    instructions: getAgentInstructions("spec-git"),
    capabilities: [
      "Branch strategy",
      "Commit hygiene",
      "Conflict resolution",
      "History analysis",
      "Cherry-picking",
    ],
    availableSkills: GIT_AGENT_AVAILABLE_SKILLS,
    role: "Specialist",
    route: "do",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "Git operation completed safely",
      "History is clean",
      "Branch strategy is sound",
    ],
  };
}
