import type { AgentTemplate } from "../../../core/templates/types';
import { GIT_AGENT_AVAILABLE_SKILLS } from "../available-skills';
import { getAgentInstructions } from "../../.generated/templates';

export function getKernelGitAgentTemplate(): AgentTemplate {
  return {
    name: "kernel-git",
    description:
      "Git specialist: branch strategy, commit hygiene, merge conflict resolution, and history analysis. Use for complex git operations or when you need to understand the history of a codebase.",
    license: "MIT",
    compatibility: "Works with git repositories",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Specialist",
      tags: ["git", "version-control", "history"],
    },
    instructions: getAgentInstructions("kernel-git"),
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
