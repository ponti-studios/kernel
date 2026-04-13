import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import KernelApplyMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(KernelApplyMarkdown);

export function getChangeApplySkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.CHANGE_APPLY,
    profile: "extended",
    description:
      "Implement tasks from a kernel change using the current schema instructions and task state. Use when the user wants to start or continue work on a kernel change.",
    license: "MIT",
    compatibility: "Requires kernel CLI.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["kernel", "implementation", "tasks", "change"],
    },
    when: [
      "the user wants to implement a kernel change",
      "the user wants to continue task execution from an existing kernel change",
    ],
    termination: [
      "The active task run finishes or pauses with a clear reason",
      "Completed tasks are marked done",
      "Overall Kernel task progress is reported",
    ],
    outputs: ["Implemented task increments", "Updated Kernel task checklist", "Progress summary"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name",
    dependencies: [SKILL_NAMES.CHANGE_PROPOSE],
    instructions: body,
  };
}
