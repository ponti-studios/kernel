import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getJinnTriageSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-triage",
    description:
      "Use when a bug report, ad-hoc request, or unplanned issue arrives and needs to be assessed, sized, and placed into the correct position in the Linear hierarchy before work begins.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "triage", "linear", "intake"],
    },
    when: [
      "a bug report or ad-hoc request arrives outside the current plan",
      "user reports something broken or missing",
      "a new item needs to be assessed and placed into the Linear hierarchy",
    ],
    applicability: [
      "Use to intake and correctly position new bugs or requests in Linear",
      "Use before implementation to ensure the item is properly scoped and sequenced",
    ],
    termination: [
      "Issue created in Linear with correct parentId and priority",
      "blockedBy / blocks relations set to maintain correct phase ordering",
      "Triage report delivered with issue URL and position in hierarchy",
    ],
    outputs: ["New Linear issue with parentId, priority, and relations set", "Triage report"],
    dependencies: ["jinn-explore", "jinn-propose"],
    instructions: getSkillInstructions("jinn-triage"),
  };
}
