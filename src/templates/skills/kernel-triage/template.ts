import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getTriageSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.TRIAGE,
    profile: "extended",
    description:
      "Assesses and classifies incoming bugs, ad-hoc requests, and unplanned issues before work begins. Use when a new bug report arrives, an unstructured request needs sizing, or work needs to be placed into the correct position in the project issue hierarchy.",
    license: "MIT",
    compatibility: "Requires Linear access for issue and project reads and writes.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "triage", "tasks", "intake"],
    },
    when: [
      "a bug report or ad-hoc request arrives outside the current plan",
      "user reports something broken or missing",
      "a new item needs to be assessed and placed into the issue hierarchy",
    ],
    applicability: [
      "Use to intake and correctly position new bugs or requests in the Linear issue hierarchy",
      "Use before implementation to ensure the item is properly scoped and sequenced",
    ],
    termination: [
      "Linear issue created with correct parentId and priority",
      "Blocking relations set to maintain correct phase ordering",
      "Triage report delivered with issue ID and position in hierarchy",
    ],
    outputs: ["New or updated Linear issue with hierarchy and relations set", "Triage report"],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.PROPOSE],
    disableModelInvocation: true,
    argumentHint: "bug description, issue ID, or request summary",
    instructions: getSkillInstructions(SKILL_NAMES.TRIAGE),
  };
}
