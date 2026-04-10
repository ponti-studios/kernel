import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import openspecApplyMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(openspecApplyMarkdown);

export function getOpenSpecApplyChangeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.OPENSPEC_APPLY_CHANGE,
    profile: "extended",
    description:
      "Implement tasks from an OpenSpec change using the current schema instructions and task state. Use when the user wants to start or continue work on an OpenSpec change.",
    license: "MIT",
    compatibility: "Requires openspec CLI.",
    metadata: {
      author: "openspec",
      version: "1.0",
      category: "Workflow",
      tags: ["openspec", "implementation", "tasks", "change"],
    },
    when: [
      "the user wants to implement an OpenSpec change",
      "the user wants to continue task execution from an existing OpenSpec change",
    ],
    termination: [
      "The active task run finishes or pauses with a clear reason",
      "Completed tasks are marked done",
      "Overall OpenSpec task progress is reported",
    ],
    outputs: ["Implemented task increments", "Updated OpenSpec task checklist", "Progress summary"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name",
    dependencies: [SKILL_NAMES.OPENSPEC_PROPOSE],
    instructions: body,
  };
}
