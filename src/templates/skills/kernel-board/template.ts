import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getBoardSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.BOARD,
    profile: "core",
    description:
      "Generates a current-state task board from Linear projects and issues. Use when the board needs to be rebuilt, issue states changed, or users ask to see the current work queue without opening individual issues.",
    license: "MIT",
    compatibility:
      "Requires Linear access for project and issue reads, and optionally document writes.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "board", "tasks", "markdown"],
    },
    when: [
      "the task board needs to be regenerated from Linear issues",
      "issue states, priorities, or relations have changed",
      "the user asks for a current board view of the project",
    ],
    applicability: [
      "Use to summarize the current board directly from Linear state",
      "Use after triage, execution, or sync changes issue state or relations",
    ],
    termination: [
      "Board summary reflects the current Linear issues in scope",
      "Blocked, in-progress, todo, done, and cancelled groups are current",
    ],
    outputs: ["Grouped task board markdown", "Optional Linear document summary"],
    dependencies: [],
    instructions: getSkillInstructions(SKILL_NAMES.BOARD),
  };
}
