import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import openspecExploreMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(openspecExploreMarkdown);

export function getOpenSpecExploreSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.OPENSPEC_EXPLORE,
    profile: "extended",
    description:
      "Explore ideas, constraints, and requirements in OpenSpec mode without implementing code. Use when the user wants to think through a change before or during proposal work.",
    license: "MIT",
    compatibility: "Requires openspec CLI.",
    metadata: {
      author: "openspec",
      version: "1.0",
      category: "Workflow",
      tags: ["openspec", "exploration", "requirements", "design"],
    },
    when: [
      "the user wants to reason through an OpenSpec change before implementing",
      "the user wants exploratory discussion grounded in the current OpenSpec artifacts",
    ],
    termination: [
      "Exploration stays non-implementing",
      "Relevant OpenSpec context is surfaced when available",
      "The user leaves with clearer next steps or captured decisions",
    ],
    outputs: ["Exploration notes", "Optional OpenSpec artifact updates"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name or topic to explore",
    instructions: body,
  };
}
