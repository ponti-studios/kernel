import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import ghPrErrorsMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";
import { ghPrErrorsScript } from "./script.js";

const { body } = parseFrontmatter(ghPrErrorsMarkdown);

export function getGhPrErrorsSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.GH_PR_ERRORS,
    profile: "extended",
    description:
      "Inspect the latest GitHub Actions failure details for the open pull request on the current branch. Use when CI is failing on the active branch and you need the newest failed step logs and the first actionable error.",
    license: "MIT",
    compatibility: "Requires gh CLI with an authenticated session.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Workflow",
      tags: ["github", "actions", "ci", "pull-request", "errors"],
    },
    when: [
      "the user asks why the current pull request is failing in CI",
      "the user wants the latest GitHub Actions errors for the active branch",
      "you need failed step logs from the newest pull request workflow run",
    ],
    termination: [
      "Latest run metadata is surfaced",
      "The current run state is reported accurately",
      "If the run failed, the first actionable error is summarized",
    ],
    outputs: ["Compact CI status summary", "First actionable GitHub Actions failure"],
    allowedTools: ["Bash", "Read", "Grep", "Glob"],
    disableModelInvocation: true,
    argumentHint: "optional branch or PR context",
    references: [
      {
        relativePath: "scripts/check-last-gh-actions-errors.sh",
        content: ghPrErrorsScript,
      },
    ],
    instructions: body,
  };
}
