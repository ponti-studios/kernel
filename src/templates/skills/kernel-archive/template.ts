import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelArchiveSkillTemplate(): SkillTemplate {
  return {
    name: "kernel-archive",
    description:
      "Use when closing or cleaning up completed Linear projects, issues, and follow-up work.",
    license: "MIT",
    compatibility: "Requires kernel CLI and a configured Linear MCP server.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "archive", "linear", "done"],
    },
    when: [
      "a Linear project or milestone is complete",
      "user wants to clean up or close finished work",
      'user says "wrap up", "close", "archive", or "done" for a Linear project',
    ],
    applicability: [
      "Use when closing completed Linear projects and resolving remaining issues",
      "Use when surfacing follow-up work before archiving a project",
    ],
    termination: [
      "Linear project marked complete",
      "All open issues resolved, deferred, or captured as follow-up",
    ],
    outputs: ["Completed Linear project", "Follow-up issues for deferred work"],
    dependencies: ["kernel-apply"],
    disableModelInvocation: true,
    instructions: getSkillInstructions("kernel-archive"),
  };
}
