import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getExecuteSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.EXECUTE,
    profile: "core",
    description:
      "Execute implementation work from Linear issues one at a time, following priority and blocking order. Updates issue state in Linear before and after every unit of work. Use when tasks are ready for implementation, or when users say 'start on this', 'build', 'implement', or 'do this'.",
    license: "MIT",
    compatibility: "Requires Linear access for issue reads, state updates, and comment writes.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "execute", "implement", "linear", "tasks"],
    },
    when: [
      "user wants to implement work from an issue or sub-issue",
      "there is an unblocked task ready for implementation",
      "user says 'work on', 'implement', 'build', 'start', or 'do this' for an issue",
    ],
    termination: [
      "All issues in scope implemented, verified, and marked done in Linear",
      "Issue state reflects reality: done or blocked with comment trail",
    ],
    outputs: ["Implemented code changes", "Updated Linear issue states and completion comments"],
    dependencies: [SKILL_NAMES.RESEARCH, SKILL_NAMES.PLAN],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_list_teams",
      "mcp_linear_list_issues",
      "mcp_linear_get_issue",
      "mcp_linear_save_issue",
      "mcp_linear_save_comment",
    ],
    argumentHint: "issue ID, project ID, or scope to execute",
    instructions: getSkillInstructions(SKILL_NAMES.EXECUTE),
  };
}
