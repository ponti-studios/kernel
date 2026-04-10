import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import openspecProposeMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(openspecProposeMarkdown);

export function getOpenSpecProposeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.OPENSPEC_PROPOSE,
    profile: "extended",
    description:
      "Create an OpenSpec change and generate the proposal, design, and tasks artifacts needed to reach implementation readiness in one pass.",
    license: "MIT",
    compatibility: "Requires openspec CLI.",
    metadata: {
      author: "openspec",
      version: "1.0",
      category: "Workflow",
      tags: ["openspec", "proposal", "design", "tasks"],
    },
    when: [
      "the user wants to propose a new OpenSpec change",
      "the user wants a fresh proposal, design, and tasks set generated together",
    ],
    termination: [
      "The change exists on disk",
      "All artifacts required for implementation are created",
      "The user receives the ready-to-implement summary",
    ],
    outputs: ["OpenSpec change scaffold", "proposal.md", "design.md", "tasks.md"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name or feature description",
    instructions: body,
  };
}
