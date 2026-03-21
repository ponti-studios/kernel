import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelGitMasterSkillTemplate(): SkillTemplate {
  return {
    name: "kernel-git-master",
    description: "Advanced git workflows, branch management, and collaboration patterns",
    license: "MIT",
    compatibility: "Works with any git repository",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Version Control",
      tags: ["git", "workflow", "collaboration"],
    },
    when: [
      "user asks about branching, merging, or rebasing",
      "there are merge conflicts to resolve",
      "user wants to clean up commit history before a PR",
      "user needs help with git collaboration workflows",
    ],
    applicability: [
      "Use when working with git history, branches, or remote repositories",
      "Use for commit hygiene, rebase workflows, and conflict resolution",
    ],
    termination: [
      "Git operation described and commands provided",
      "Conflict resolved or branch strategy defined",
    ],
    outputs: [
      "Git commands and workflow guidance",
      "Branch strategy or commit message recommendations",
    ],
    dependencies: [],
    instructions: getSkillInstructions("kernel-git-master"),
  };
}
