import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getPlanSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PLAN,
    profile: "core",
    description:
      "Create a structured work plan at any scope level: strategic initiative, project, milestone, or cycle sprint. Interviews the user to understand scope, then creates all Linear artifacts in the correct hierarchy order. Use when proposing new work, planning a sprint, or when users say 'plan this', 'create a project for', or 'break this down'.",
    license: "MIT",
    compatibility: "Requires Linear access for project, issue, milestone, and cycle creation.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "plan", "linear", "project", "initiative", "milestone", "cycle"],
    },
    when: [
      "user wants to plan new work, a feature, or a sprint",
      "user describes a change request, product idea, or strategic goal",
      "a new project, initiative, milestone, or cycle needs to be structured in Linear",
      "user says 'plan this', 'create a project for', 'break this down', or 'set up a sprint'",
    ],
    termination: [
      "All requested Linear artifacts created in the correct hierarchy",
      "Blocking relations set between phases",
      "Creation summary delivered with Linear IDs and next action",
    ],
    outputs: [
      "Linear project, initiative, milestone, or cycle (depending on scope)",
      "Parent issue and phased sub-issues with blocking relations (for project scope)",
    ],
    dependencies: [SKILL_NAMES.RESEARCH],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_list_teams",
      "mcp_linear_list_projects",
      "mcp_linear_list_issues",
      "mcp_linear_list_milestones",
      "mcp_linear_list_cycles",
      "mcp_linear_save_project",
      "mcp_linear_save_issue",
      "mcp_linear_save_milestone",
    ],
    argumentHint: "work to plan — goal, feature, initiative, or sprint description",
    instructions: getSkillInstructions(SKILL_NAMES.PLAN),
  };
}
