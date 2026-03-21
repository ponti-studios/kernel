import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelUnblockSkillTemplate(): SkillTemplate {
  return {
    name: "kernel-unblock",
    description:
      "Use when an issue is Blocked — either because kernel-apply stopped on a blocker, or a blockedBy dependency hasn't resolved. Diagnoses the blocker, decides whether to resolve, defer, or split, and updates Linear accordingly.",
    license: "MIT",
    compatibility: "Requires kernel CLI and a configured Linear MCP server.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "unblock", "linear", "blocked"],
    },
    when: [
      "a Linear issue is in Blocked status",
      "kernel-apply stopped due to a blocker",
      "a blockedBy dependency has not been resolved",
    ],
    applicability: [
      "Use to diagnose and resolve blocked Linear issues",
      "Use when a blocker must be classified and actioned before implementation can resume",
    ],
    termination: [
      "Blocker classified and resolution action taken",
      "Blocked issue transitioned to the correct new status",
      "Parent issue updated if timeline or scope is affected",
    ],
    outputs: [
      "Updated Linear issue status",
      "Comment explaining blocker resolution",
      "Unblock report",
    ],
    dependencies: ["kernel-explore", "kernel-sync"],
    instructions: getSkillInstructions("kernel-unblock"),
  };
}
