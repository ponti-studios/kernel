import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelExploreSkillTemplate(): SkillTemplate {
  return {
    name: "kernel-explore",
    description:
      "Use when exploring tradeoffs, risks, or missing context inside an existing Linear project or issue.",
    license: "MIT",
    compatibility: "Requires kernel CLI and a configured Linear MCP server.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "explore", "linear", "investigation"],
    },
    when: [
      "user wants to investigate tradeoffs or risks before implementing",
      "there is missing context or open decisions in a Linear issue or project",
      "user needs to explore options without committing to implementation",
    ],
    applicability: [
      "Use when exploring tradeoffs, risks, or dependencies in existing Linear work",
      "Use before implementation when context or direction is unclear",
    ],
    termination: [
      "Options, risks, and open decisions documented in Linear",
      "Recommendation or decision written back to the Linear issue or project",
    ],
    outputs: [
      "Updated Linear issue or project description with decisions",
      "Risk and tradeoff analysis",
    ],
    dependencies: [],
    instructions: getSkillInstructions("kernel-explore"),
  };
}
