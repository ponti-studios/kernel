import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getStatusSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.STATUS,
    profile: "core",
    description:
      "Report the current state of work: what is done, in-progress, blocked, and next. Supports cycle/sprint progress, milestone rollups, project board views, and health checks. Use when asking where things stand, what is blocking progress, or what comes next.",
    license: "MIT",
    compatibility: "Requires Linear access for issue, cycle, milestone, and project reads.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "status", "board", "cycle", "milestone", "linear"],
    },
    when: [
      "user asks where things stand, what is blocking, or what comes next",
      "a status update is needed mid-execution",
      "a milestone has been reached and work should be assessed before continuing",
      "user asks 'what's in this sprint?', 'how's the cycle going?', or 'are we on track?'",
    ],
    termination: [
      "Status report delivered with clear recommendation",
      "All blockers named with recommended resolutions",
      "Next action is unambiguous",
    ],
    outputs: ["Status report (on track | at risk | blocked)", "Optional Linear document snapshot"],
    dependencies: [],
    disableModelInvocation: false,
    allowedTools: [
      "mcp_linear_list_issues",
      "mcp_linear_list_cycles",
      "mcp_linear_list_milestones",
      "mcp_linear_list_projects",
      "mcp_linear_get_project",
      "mcp_linear_create_document",
    ],
    argumentHint: "project, milestone, cycle, team, or issue ID to check",
    instructions: getSkillInstructions(SKILL_NAMES.STATUS),
  };
}
