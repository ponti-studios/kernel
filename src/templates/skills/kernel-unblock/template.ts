import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getUnblockSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.UNBLOCK,
    profile: "extended",
    description:
      "Diagnoses blocked Linear issues and determines how to resolve them. Use when an issue is in blocked status, implementation has stopped on a dependency, or a blocking relationship has not resolved — decides whether to resolve, defer, or split, and updates the issue.",
    license: "MIT",
    compatibility:
      "Requires Linear access for issue reads, comments, and state or relation updates.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "unblock", "tasks", "blocked"],
    },
    when: [
      "an issue is in blocked status",
      "implementation stopped due to a blocker",
      "a blocking dependency has not been resolved",
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
      "Updated Linear issue status or relations",
      "Comment explaining blocker resolution",
      "Unblock report",
    ],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.SYNC],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_get_issue",
      "mcp_linear_list_issues",
      "mcp_linear_save_issue",
      "mcp_linear_save_comment",
    ],
    argumentHint: "blocked issue ID or title",
    instructions: getSkillInstructions(SKILL_NAMES.UNBLOCK),
  };
}
