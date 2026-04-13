import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import closeSkillMarkdown from "./instructions.md";

const { frontmatter, body } =
  parseFrontmatter<Omit<SkillTemplate, "instructions" | "references">>(closeSkillMarkdown);

export function getCloseSkillTemplate(): SkillTemplate {
  return {
    name: frontmatter.name,
    profile: "extended",
    description:
      "Close out a completed project or milestone: resolve remaining open issues, write a completion summary, and create a retrospective document. Use when a project is done, a milestone has shipped, or users ask to wrap up, close, or finalize a body of work.",
    license: "MIT",
    compatibility:
      "Requires Linear access for issue reads, state updates, milestone updates, and document creation.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "close", "closeout", "retrospective", "linear", "done"],
    },
    when: [
      "a project issue group or milestone is complete",
      "user wants to close or finalize finished work",
      "user says 'wrap up', 'close out', 'finalize', or 'we're done with' a project or milestone",
    ],
    termination: [
      "Parent issue or milestone marked done in Linear",
      "All open issues resolved, deferred, or captured as follow-up",
      "Completion comment written to the parent issue",
      "Retrospective document created and linked",
    ],
    outputs: [
      "Closed parent issue or milestone in Linear",
      "Follow-up Linear issues for deferred work",
      "Completion comment on the parent issue",
      "Retrospective document",
    ],
    dependencies: [SKILL_NAMES.EXECUTE],
    disableModelInvocation: true,
    allowedTools: [
      "mcp_linear_list_issues",
      "mcp_linear_list_milestones",
      "mcp_linear_get_issue",
      "mcp_linear_save_issue",
      "mcp_linear_save_comment",
      "mcp_linear_save_milestone",
      "mcp_linear_create_document",
    ],
    argumentHint: "project name, milestone, or parent issue ID to close",
    instructions: body,
  };
}
