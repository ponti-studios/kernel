import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getSpecUnblockSkillTemplate(): SkillTemplate {
  return {
    name: "spec-unblock",
    description:
      "Use when an issue is Blocked — either because spec-apply stopped on a blocker, or a blockedBy dependency hasn't resolved. Diagnoses the blocker, decides whether to resolve, defer, or split, and updates Linear accordingly.",
    license: "MIT",
    compatibility: "Requires spec CLI and a configured Linear MCP server.",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "unblock", "linear", "blocked"],
    },
    when: [
      "a Linear issue is in Blocked status",
      "spec-apply stopped due to a blocker",
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
    dependencies: ["spec-explore", "spec-sync"],
    instructions: getSkillInstructions("spec-unblock"),
  };
}
