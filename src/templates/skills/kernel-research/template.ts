import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getResearchSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.RESEARCH,
    profile: "core",
    description:
      "Investigate unknowns, tradeoffs, and risks in a Linear issue or project, then write findings back to the right destination. Use when planning work that needs deeper investigation, technical decisions are unclear, or options need to be explored before committing to an approach.",
    license: "MIT",
    compatibility:
      "Requires Linear access for issue reads and comment, description, or document writes.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "research", "investigation", "linear", "decisions"],
    },
    when: [
      "user wants to investigate tradeoffs or risks before implementing",
      "there are missing context or open decisions in an issue or project",
      "technical direction is unclear and options need to be evaluated",
      "user asks to explore, investigate, or research an issue or topic",
    ],
    termination: [
      "Open questions resolved with rationale written back to Linear",
      "Clear recommendation delivered: ready for implementation or needs a human decision first",
      "All Linear updates (comments, description changes, documents) confirmed",
    ],
    outputs: [
      "Linear comment, updated issue description, updated project description, or Linear document (depending on finding type)",
      "Risk and tradeoff analysis",
      "Implementation readiness recommendation",
    ],
    dependencies: [],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_get_issue",
      "mcp_linear_list_issues",
      "mcp_linear_list_documents",
      "mcp_linear_save_comment",
      "mcp_linear_save_issue",
      "mcp_linear_save_project",
      "mcp_linear_update_document",
      "mcp_linear_create_document",
    ],
    argumentHint: "issue ID, project, or topic to investigate",
    instructions: getSkillInstructions(SKILL_NAMES.RESEARCH),
  };
}
