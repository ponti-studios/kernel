import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getJinnReviewSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-review",
    description:
      "Use after a deliverable is complete to assess whether work is ready to move forward. Evaluates correctness, completeness, quality, security, performance, and standards. Produces an approve / approve-with-changes / needs-rework recommendation.",
    license: "MIT",
    compatibility: "Use after implementation is complete, before handoff, merge, or deployment.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "review", "quality", "post-completion"],
    },
    when: [
      "a deliverable is complete and ready for sign-off",
      "a milestone has been reached and work should be reviewed before continuing",
      "before handing off, deploying, or merging",
      "after jinn-apply completes a set of sub-issues",
    ],
    applicability: [
      "Use to formally assess whether completed work meets its acceptance criteria",
      "Use to surface must-fix issues before the work moves downstream",
    ],
    termination: [
      "All evaluation dimensions covered",
      "Findings prioritised as must-fix, should-fix, or consider",
      "Clear recommendation delivered: approve | approve with changes | needs rework",
    ],
    outputs: [
      "Review report with recommendation",
      "Prioritised findings list",
      "Updated Linear issue status (Done or back to In Progress) via mcp_linear_save_issue",
    ],
    dependencies: [],
    instructions: getSkillInstructions("jinn-review"),
  };
}
