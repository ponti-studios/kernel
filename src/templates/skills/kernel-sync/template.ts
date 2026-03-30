import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getSyncSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.SYNC,
    profile: "core",
    description:
      "Reconciles Linear issue tracking with what actually happened — updates stale in-progress issues, marks completed work done, and fills in missing issue records. Use when the board has drifted from reality, work was completed without updates, or users ask to sync or clean up the board.",
    license: "MIT",
    compatibility: "Requires Linear access for issue reads, comments, and state updates.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "sync", "tasks", "reconcile"],
    },
    when: [
      'Issues are stuck in "in-progress" with no recent activity',
      "work was completed without updating issues",
      "the board state does not match the codebase",
      "before starting a new implementation session",
    ],
    applicability: [
      "Use when Linear issue state has drifted from the actual state of the codebase",
      "Use to audit and reconcile stale, missing, or mis-classified issues",
    ],
    termination: [
      "All in-progress issues classified and transitioned correctly",
      "Undocumented work back-filled in Linear",
      "Sync report delivered",
    ],
    outputs: [
      "Updated Linear issue statuses and comments",
      "Back-filled Linear issues for undocumented work",
      "Sync summary report",
    ],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_list_issues",
      "mcp_linear_get_issue",
      "mcp_linear_save_issue",
      "mcp_linear_save_comment",
    ],
    dependencies: [],
    instructions: getSkillInstructions(SKILL_NAMES.SYNC),
  };
}
