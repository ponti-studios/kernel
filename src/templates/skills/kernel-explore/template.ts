import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import exploreSkillMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

export function getExploreSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.EXPLORE,
    profile: "core",
    description:
      "Investigates tradeoffs, risks, and missing context inside an existing project issue or issue group. Use when planning work that needs deeper investigation, technical decisions are unclear, or users ask to explore options before committing to an approach.",
    license: "MIT",
    compatibility: "Requires Linear access for issue reads and comment or description updates.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "explore", "tasks", "investigation"],
    },
    when: [
      "user wants to investigate tradeoffs or risks before implementing",
      "there is missing context or open decisions in an issue or project group",
      "user needs to explore options without committing to implementation",
    ],
    applicability: [
      "Use when exploring tradeoffs, risks, or dependencies in existing Linear-tracked work",
      "Use before implementation when context or direction is unclear",
    ],
    termination: [
      "Options, risks, and open decisions documented in the Linear issue",
      "Recommendation or decision written back to the project task record",
    ],
    outputs: ["Updated Linear issue or comment with decisions", "Risk and tradeoff analysis"],
    dependencies: [],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_list_issues",
      "mcp_linear_get_issue",
      "mcp_linear_save_issue",
      "mcp_linear_save_comment",
    ],
    argumentHint: "issue ID, parent issue, or topic to investigate",
    instructions: parseFrontmatter(exploreSkillMarkdown).body,
  };
}
