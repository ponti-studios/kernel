import type { CommandTemplate } from "../../core/templates/types.js";
import { parseFrontmatter } from "../../core/templates/frontmatter.js";
import { COMMAND_NAMES, SKILL_NAMES } from "../constants.js";

import ghPrErrorsMarkdown from "./gh-pr-errors.md";
import opsxApplyMarkdown from "./opsx-apply.md";
import opsxArchiveMarkdown from "./opsx-archive.md";
import opsxExploreMarkdown from "./opsx-explore.md";
import opsxProposeMarkdown from "./opsx-propose.md";
import speckitAnalyzeMarkdown from "./speckit.analyze.md";
import speckitChecklistMarkdown from "./speckit.checklist.md";
import speckitClarifyMarkdown from "./speckit.clarify.md";
import speckitConstitutionMarkdown from "./speckit.constitution.md";
import speckitGitCommitMarkdown from "./speckit.git.commit.md";
import speckitGitFeatureMarkdown from "./speckit.git.feature.md";
import speckitGitInitializeMarkdown from "./speckit.git.initialize.md";
import speckitGitRemoteMarkdown from "./speckit.git.remote.md";
import speckitGitValidateMarkdown from "./speckit.git.validate.md";
import speckitImplementMarkdown from "./speckit.implement.md";
import speckitPlanMarkdown from "./speckit.plan.md";
import speckitSpecifyMarkdown from "./speckit.specify.md";
import speckitTasksMarkdown from "./speckit.tasks.md";
import speckitTasksToIssuesMarkdown from "./speckit.taskstoissues.md";

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
    createCommandTemplate(COMMAND_NAMES.OPSX_PROPOSE, opsxProposeMarkdown, {
      backedBySkill: SKILL_NAMES.OPENSPEC_PROPOSE,
    }),
    createCommandTemplate(COMMAND_NAMES.OPSX_EXPLORE, opsxExploreMarkdown, {
      backedBySkill: SKILL_NAMES.OPENSPEC_EXPLORE,
    }),
    createCommandTemplate(COMMAND_NAMES.OPSX_APPLY, opsxApplyMarkdown, {
      backedBySkill: SKILL_NAMES.OPENSPEC_APPLY_CHANGE,
    }),
    createCommandTemplate(COMMAND_NAMES.OPSX_ARCHIVE, opsxArchiveMarkdown, {
      backedBySkill: SKILL_NAMES.OPENSPEC_ARCHIVE_CHANGE,
    }),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_ANALYZE, speckitAnalyzeMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_CHECKLIST, speckitChecklistMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_CLARIFY, speckitClarifyMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_CONSTITUTION, speckitConstitutionMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_GIT_COMMIT, speckitGitCommitMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_GIT_FEATURE, speckitGitFeatureMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_GIT_INITIALIZE, speckitGitInitializeMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_GIT_REMOTE, speckitGitRemoteMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_GIT_VALIDATE, speckitGitValidateMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_IMPLEMENT, speckitImplementMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_PLAN, speckitPlanMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_SPECIFY, speckitSpecifyMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_TASKS, speckitTasksMarkdown),
    createCommandTemplate(COMMAND_NAMES.SPECKIT_TASKS_TO_ISSUES, speckitTasksToIssuesMarkdown),
  ];
}
