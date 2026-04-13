import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import KernelExploreMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(KernelExploreMarkdown);

export function getChangeExploreSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.CHANGE_EXPLORE,
    profile: "extended",
    description:
      "Explore ideas, constraints, and requirements in Kernel mode without implementing code. Use when the user wants to think through a change before or during proposal work.",
    license: "MIT",
    compatibility: "Requires kernel CLI.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["kernel", "exploration", "requirements", "design"],
    },
    when: [
      "the user wants to reason through a kernel change before implementing",
      "the user wants exploratory discussion grounded in the current Kernel artifacts",
    ],
    termination: [
      "Exploration stays non-implementing",
      "Relevant Kernel context is surfaced when available",
      "The user leaves with clearer next steps or captured decisions",
    ],
    outputs: ["Exploration notes", "Optional Kernel artifact updates"],
    disableModelInvocation: true,
    allowedTools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit"],
    argumentHint: "change name or topic to explore",
    instructions: body,
  };
}
