import type { CommandTemplate } from "../../core/templates/types.js";
import { parseFrontmatter } from "../../core/templates/frontmatter.js";
import { COMMAND_NAMES, SKILL_NAMES } from "../constants.js";

import ghPrErrorsMarkdown from "./gh-pr-errors.md";
import kernelChangeApplyMarkdown from "./kernel-change-apply.md";
import kernelChangeArchiveMarkdown from "./kernel-change-archive.md";
import kernelChangeExploreMarkdown from "./kernel-change-explore.md";
import kernelChangeProposeMarkdown from "./kernel-change-propose.md";
import kernelSpecAnalyzeMarkdown from "./kernel-spec-analyze.md";
import kernelSpecChecklistMarkdown from "./kernel-spec-checklist.md";
import kernelSpecClarifyMarkdown from "./kernel-spec-clarify.md";
import kernelSpecConstitutionMarkdown from "./kernel-spec-constitution.md";
import kernelSpecGitCommitMarkdown from "./kernel-spec-git-commit.md";
import kernelSpecGitFeatureMarkdown from "./kernel-spec-git-feature.md";
import kernelSpecGitInitializeMarkdown from "./kernel-spec-git-initialize.md";
import kernelSpecGitRemoteMarkdown from "./kernel-spec-git-remote.md";
import kernelSpecGitValidateMarkdown from "./kernel-spec-git-validate.md";
import kernelSpecImplementMarkdown from "./kernel-spec-implement.md";
import kernelSpecPlanMarkdown from "./kernel-spec-plan.md";
import kernelSpecifyMarkdown from "./kernel-specify.md";
import kernelSpecTasksMarkdown from "./kernel-spec-tasks.md";
import kernelSpecTasksToIssuesMarkdown from "./kernel-spec-tasks-to-issues.md";

function createCommandTemplate(
  name: string,
  markdown: string,
  options: {
    backedBySkill?: string;
    argumentsHint?: string;
    allowedTools?: string[];
    nativeOnly?: boolean;
  } = {},
): CommandTemplate {
  const { frontmatter, body } = parseFrontmatter<{ description?: string }>(markdown);

  return {
    name,
    description: frontmatter.description ?? `${name} command`,
    instructions: body,
    ...options,
  };
}

export function getDefaultCommandTemplates(): CommandTemplate[] {
  return [
    createCommandTemplate(COMMAND_NAMES.GH_PR_ERRORS, ghPrErrorsMarkdown, {
      backedBySkill: SKILL_NAMES.GH_PR_ERRORS,
      allowedTools: ["Bash", "Read", "Grep", "Glob"],
    }),
    createCommandTemplate(COMMAND_NAMES.CHANGE_PROPOSE, kernelChangeProposeMarkdown, {
      backedBySkill: SKILL_NAMES.CHANGE_PROPOSE,
    }),
    createCommandTemplate(COMMAND_NAMES.CHANGE_EXPLORE, kernelChangeExploreMarkdown, {
      backedBySkill: SKILL_NAMES.CHANGE_EXPLORE,
    }),
    createCommandTemplate(COMMAND_NAMES.CHANGE_APPLY, kernelChangeApplyMarkdown, {
      backedBySkill: SKILL_NAMES.CHANGE_APPLY,
    }),
    createCommandTemplate(COMMAND_NAMES.CHANGE_ARCHIVE, kernelChangeArchiveMarkdown, {
      backedBySkill: SKILL_NAMES.CHANGE_ARCHIVE,
    }),
    createCommandTemplate(COMMAND_NAMES.SPEC_ANALYZE, kernelSpecAnalyzeMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_CHECKLIST, kernelSpecChecklistMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_CLARIFY, kernelSpecClarifyMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_CONSTITUTION, kernelSpecConstitutionMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_GIT_COMMIT, kernelSpecGitCommitMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_GIT_FEATURE, kernelSpecGitFeatureMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_GIT_INITIALIZE, kernelSpecGitInitializeMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_GIT_REMOTE, kernelSpecGitRemoteMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_GIT_VALIDATE, kernelSpecGitValidateMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_IMPLEMENT, kernelSpecImplementMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_PLAN, kernelSpecPlanMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_SPECIFY, kernelSpecifyMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_TASKS, kernelSpecTasksMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPEC_TASKS_TO_ISSUES, kernelSpecTasksToIssuesMarkdown),
  ];
}
