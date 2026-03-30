import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getIntakeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.INTAKE,
    profile: "extended",
    description:
      "Intake, classify, and correctly place new bugs, ad-hoc requests, and unplanned work into Linear. Resolves team, workflow status, labels, relation type, and optionally cycle and milestone before creating the issue. Use when a new bug report arrives, an unstructured request needs placement, or work needs to be positioned correctly in the Linear hierarchy.",
    license: "MIT",
    compatibility:
      "Requires Linear access for issue, project, team, label, and workflow status reads and writes.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "intake", "triage", "bugs", "linear", "classification"],
    },
    when: [
      "a bug report or ad-hoc request arrives outside the current plan",
      "user reports something broken or missing",
      "a new item needs to be assessed and placed into the Linear issue hierarchy",
      "user says 'log this bug', 'add this request', or 'intake this'",
    ],
    termination: [
      "Linear issue created with correct team, status, parent, priority, labels, and relations",
      "Intake report delivered with issue ID and position in hierarchy",
    ],
    outputs: [
      "New Linear issue with fully resolved metadata and hierarchy",
      "Intake placement report",
    ],
    dependencies: [SKILL_NAMES.RESEARCH, SKILL_NAMES.PLAN],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_list_teams",
      "mcp_linear_list_projects",
      "mcp_linear_list_issues",
      "mcp_linear_list_issue_labels",
      "mcp_linear_list_issue_statuses",
      "mcp_linear_list_cycles",
      "mcp_linear_save_issue",
    ],
    argumentHint: "bug description, request summary, or unstructured idea to intake",
    instructions: getSkillInstructions(SKILL_NAMES.INTAKE),
  };
}
