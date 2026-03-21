import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelCodeQualitySkillTemplate(): SkillTemplate {
  return {
    name: "kernel-code-quality",
    description:
      "Code review, formatting, refactoring, optimization, and linting across any language or stack.",
    license: "MIT",
    compatibility: "Works with any codebase",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Engineering",
      tags: ["code", "refactor", "review", "lint", "format", "optimize"],
    },
    when: [
      "user asks to review, refactor, format, or optimize code",
      "there are lint violations or style inconsistencies",
      "code has performance issues or unnecessary complexity",
      "user wants a structured code review before merging or deploying",
    ],
    applicability: [
      "Use for any code quality task: review, refactor, lint, format, or performance work",
      "Use when quality must be validated before merging or shipping",
    ],
    termination: [
      "Code review delivered with prioritized findings",
      "Refactoring complete with tests still passing",
      "Lint and format checks pass",
      "Performance bottleneck identified and addressed",
    ],
    outputs: [
      "Structured code review with prioritized issues",
      "Refactored code with unchanged behaviour",
      "Lint-clean, formatted code",
      "Performance analysis or optimized implementation",
    ],
    dependencies: [],
    instructions: getSkillInstructions("kernel-code-quality"),
  };
}
