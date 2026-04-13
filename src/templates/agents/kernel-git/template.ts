import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { AgentTemplate } from "../../../core/templates/types.js";
import { AGENT_NAMES } from "../../constants.js";
import { GIT_AGENT_AVAILABLE_SKILLS } from "../available-skills.js";
import gitAgentMarkdown from "./AGENT.md";

const { body } = parseFrontmatter(gitAgentMarkdown);

export function getGitAgentTemplate(): AgentTemplate {
  return {
    name: AGENT_NAMES.GIT,
    profile: "core",
    description:
      "Git specialist: branch strategy, commit hygiene, merge conflict resolution, and history analysis. Use for complex git operations or when you need to understand the history of a codebase.",
    license: "MIT",
    compatibility: "Works with git repositories",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Specialist",
      tags: ["git", "version-control", "history"],
    },
    instructions: body,
    capabilities: [
      "Branch strategy",
      "Commit hygiene",
      "Conflict resolution",
      "History analysis",
      "Cherry-picking",
    ],
    availableSkills: GIT_AGENT_AVAILABLE_SKILLS,
    role: "Specialist",
    route: "git",
    defaultTools: ["read", "search"],
    allowedTools: ["Read", "Grep", "Glob", "Bash"],
    argumentHint:
      "git operation or question (e.g., 'resolve merge conflict', 'rebase feature branch')",
    maxTurns: 50,
    sandboxMode: "workspace-write",
    reasoningEffort: "medium",
    acceptanceChecks: [
      "Git operation completed safely",
      "History is clean",
      "Branch strategy is sound",
    ],
  };
}
