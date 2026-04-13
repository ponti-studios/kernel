import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import KernelArchiveMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(KernelArchiveMarkdown);

export function getChangeArchiveSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.CHANGE_ARCHIVE,
    profile: "extended",
    description:
      "Archive a completed kernel change after checking artifact state, task completion, and delta spec sync status.",
    license: "MIT",
    compatibility: "Requires kernel CLI.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["kernel", "archive", "change", "spec-sync"],
    },
    when: [
      "the user wants to finalize and archive a kernel change",
      "implementation is complete and the change should move into archive",
    ],
    termination: [
      "Archive result is reported with warnings if applicable",
      "Any incomplete tasks or artifacts are surfaced before archiving",
      "Spec sync status is included in the summary",
    ],
    outputs: ["Archived kernel change", "Archive summary with warnings and sync state"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name",
    dependencies: [SKILL_NAMES.CHANGE_APPLY],
    instructions: body,
  };
}
