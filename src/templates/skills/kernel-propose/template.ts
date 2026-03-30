import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions, getSkillReferences } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getProposeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PROPOSE,
    profile: "core",
    description:
      "Turns a change request or product idea into a structured Linear project with a parent issue, phased sub-issues, and blocking relations. Use when planning new work, when a user describes a feature or initiative that needs to be structured, or when users say 'plan this', 'create a project for', or 'break this down'.",
    license: "MIT",
    compatibility: "Requires Linear access for project and issue creation.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "propose", "tasks", "planning"],
    },
    when: [
      "user wants to plan new work or a new feature",
      "user describes a change request or product idea",
      "a new project or initiative needs to be structured into Linear issues",
    ],
    applicability: [
      "Use when turning a vague change request into a structured Linear project and issue tree",
      "Use when a project or initiative needs a proposal with seeded parent and child Linear issues",
    ],
    termination: [
      "Linear project created with description and summary",
      "Parent issue created with description and context",
      "Sub-issues created for phased execution with blocking relations set",
    ],
    outputs: ["Linear project", "Parent issue", "Phased sub-issues with blocking relations"],
    dependencies: [SKILL_NAMES.EXPLORE],
    disableModelInvocation: true,
    references: getSkillReferences(
      SKILL_NAMES.PROPOSE,
      "references/plan-template.md",
      "references/parent-issue-template.md",
      "references/phase-template.md",
      "references/task-template.md",
      "references/milestone-template.md",
      "references/sub-issue-template.md",
    ),
    argumentHint: "feature description or change request",
    instructions: getSkillInstructions(SKILL_NAMES.PROPOSE),
  };
}
