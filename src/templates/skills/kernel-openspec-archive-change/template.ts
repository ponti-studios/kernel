import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import openspecArchiveMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(openspecArchiveMarkdown);

export function getOpenSpecArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.OPENSPEC_ARCHIVE_CHANGE,
    profile: "extended",
    description:
      "Archive a completed OpenSpec change after checking artifact state, task completion, and delta spec sync status.",
    license: "MIT",
    compatibility: "Requires openspec CLI.",
    metadata: {
      author: "openspec",
      version: "1.0",
      category: "Workflow",
      tags: ["openspec", "archive", "change", "spec-sync"],
    },
    when: [
      "the user wants to finalize and archive an OpenSpec change",
      "implementation is complete and the change should move into archive",
    ],
    termination: [
      "Archive result is reported with warnings if applicable",
      "Any incomplete tasks or artifacts are surfaced before archiving",
      "Spec sync status is included in the summary",
    ],
    outputs: ["Archived OpenSpec change", "Archive summary with warnings and sync state"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name",
    dependencies: [SKILL_NAMES.OPENSPEC_APPLY_CHANGE],
    instructions: body,
  };
}
