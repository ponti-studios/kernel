import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelConventionsSkillTemplate(): SkillTemplate {
  return {
    name: "kernel-conventions",
    description:
      "Use when defining, reviewing, or documenting the standards that govern how a project is built and maintained.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Engineering",
      tags: ["conventions", "standards", "style", "workflow", "documentation"],
    },
    when: [
      "establishing conventions on a new project",
      "reviewing whether existing conventions are being followed",
      "documenting standards for a project that doesn't have them yet",
      "onboarding contributors who need to know how the project operates",
    ],
    applicability: [
      "Use when a project lacks documented or enforced conventions",
      "Use when reviewing a codebase for convention drift",
    ],
    termination: [
      "Conventions documented in the appropriate files (README.md, CONTRIBUTING.md, docs/)",
      "Automated enforcement configured in CI where possible",
      "Open convention gaps identified for human decision",
    ],
    outputs: ["Documented project conventions", "CI enforcement configuration", "List of gaps requiring decisions"],
    dependencies: [],
    instructions: getSkillInstructions("kernel-conventions"),
  };
}
