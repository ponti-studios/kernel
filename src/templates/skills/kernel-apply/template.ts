import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelApplySkillTemplate(): SkillTemplate {
  return {
    name: "kernel-apply",
    description: "Use when executing implementation work from Linear issues and sub-issues.",
    license: "MIT",
    compatibility: "Requires kernel CLI and a configured Linear MCP server.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "apply", "linear", "execute"],
    },
    when: [
      "user wants to implement work from a Linear issue or sub-issue",
      "there is an unblocked Linear task ready for implementation",
      'user says "work on", "implement", "build", or "start" a Linear issue',
    ],
    applicability: [
      "Use when executing implementation tasks tracked in Linear",
      "Use when the plan is clear and the next unblocked issue is ready",
    ],
    termination: [
      "All sub-issues in scope are implemented and verified",
      "Linear issue status updated to reflect completion or blockers",
    ],
    outputs: ["Implemented code changes", "Updated Linear issue statuses"],
    dependencies: ["kernel-explore", "kernel-propose"],
    disableModelInvocation: true,
    instructions: getSkillInstructions("kernel-apply"),
  };
}
