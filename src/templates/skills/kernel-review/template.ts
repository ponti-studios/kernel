import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import reviewSkillMarkdown from "./instructions.md";

export function getReviewSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.REVIEW,
    profile: "core",
    description:
      "Assesses completed deliverables for correctness, completeness, quality, security, performance, and standards compliance. Also covers refactoring, formatting, linting, and performance optimization. Use after implementation to evaluate whether work meets acceptance criteria, before handoff, merge, or deployment, or when asked to refactor, clean up, or improve code quality.",
    license: "MIT",
    compatibility: "Use after implementation is complete, before handoff, merge, or deployment.",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Workflow",
      tags: [
        "workflow",
        "review",
        "quality",
        "post-completion",
        "refactor",
        "lint",
        "format",
        "optimize",
      ],
    },
    when: [
      "a deliverable is complete and ready for sign-off",
      "a milestone has been reached and work should be reviewed before continuing",
      "before handing off, deploying, or merging",
      "after an implementation workflow completes a set of sub-issues",
      "user asks to review, refactor, format, or optimize code",
      "there are lint violations, style inconsistencies, or performance issues",
    ],
    applicability: [
      "Use to formally assess whether completed work meets its acceptance criteria",
      "Use to surface must-fix issues before the work moves downstream",
      "Use for any code quality task: review, refactor, lint, format, or performance work",
    ],
    termination: [
      "All evaluation dimensions covered",
      "Findings prioritised as must-fix, should-fix, or consider",
      "Clear recommendation delivered: approve | approve with changes | needs rework",
      "Refactoring complete with tests still passing",
      "Lint and format checks pass",
    ],
    outputs: [
      "Review report with recommendation",
      "Prioritised findings list",
      "Updated local work status or follow-up notes",
      "Refactored code with unchanged behaviour",
      "Lint-clean, formatted code",
    ],
    dependencies: [],
    disableModelInvocation: true,
    allowedTools: ["Read", "Grep", "Glob", "Bash"],
    argumentHint: "work item, PR link, or file/directory to review (optional)",
    instructions: parseFrontmatter(reviewSkillMarkdown).body,
  };
}
