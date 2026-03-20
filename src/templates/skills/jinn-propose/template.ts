import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getJinnProposeSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-propose",
    description:
      "Use when turning a change request into a Linear project with seeded issues and sub-issues.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "propose", "linear", "planning"],
    },
    when: [
      "user wants to plan new work or a new feature",
      "user describes a change request or product idea",
      "a new project or initiative needs to be structured",
    ],
    applicability: [
      "Use when turning a vague change request into structured Linear work",
      "Use when a project or initiative needs a proposal with seeded issues",
    ],
    termination: [
      "Linear project created with a description and design context",
      "Top-level Linear issues seeded for each workstream",
      "Sub-issues created for immediately actionable tasks",
    ],
    outputs: ["Linear project", "Linear issues and sub-issues"],
    dependencies: ["jinn-explore"],
    instructions: getSkillInstructions("jinn-propose"),
  };
}
