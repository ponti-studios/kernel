import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getJinnSyncSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-sync",
    description:
      "Use when Linear state has drifted from reality — stale In Progress issues, work completed without updates, or issues missing from the board. Reconciles Linear with what actually happened.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "sync", "linear", "reconcile"],
    },
    when: [
      'Linear issues are stuck in "In Progress" with no recent activity',
      "work was completed without updating Linear",
      "the board state does not match the codebase",
      "before starting a new jinn-apply session",
    ],
    applicability: [
      "Use when Linear state has drifted from the actual state of the codebase",
      "Use to audit and reconcile stale, missing, or mis-classified issues",
    ],
    termination: [
      "All In Progress issues classified and transitioned correctly",
      "Undocumented work back-filled in Linear",
      "Sync report delivered",
    ],
    outputs: [
      "Updated Linear issue statuses",
      "Back-filled issues for undocumented work",
      "Sync summary report",
    ],
    disableModelInvocation: true,
    dependencies: [],
    instructions: getSkillInstructions("jinn-sync"),
  };
}
