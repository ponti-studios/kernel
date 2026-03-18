import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../core/templates/types.js";
import {
  getCodeFormatCommandTemplate,
  getCodeOptimizeCommandTemplate,
  getCodeRefactorCommandTemplate,
  getCodeReviewCommandTemplate,
} from "./commands/code.js";
import {
  getDocsDeployCommandTemplate,
  getDocsFeatureVideoCommandTemplate,
  getDocsReleaseCommandTemplate,
  getDocsTestBrowserCommandTemplate,
} from "./commands/docs.js";
import {
  getGitBranchCommandTemplate,
  getGitCleanupCommandTemplate,
  getGitMergeCommandTemplate,
  getGitSmartCommitCommandTemplate,
} from "./commands/git.js";
import { getLintRubyCommandTemplate } from "./commands/lint.js";
import {
  getProjectBuildCommandTemplate,
  getProjectConstitutionCommandTemplate,
  getProjectDeployCommandTemplate,
  getProjectInitCommandTemplate,
  getProjectMapCommandTemplate,
} from "./commands/project.js";
import { getRefactorCommandTemplate } from "./commands/refactor.js";
import {
  getUtilBackupCommandTemplate,
  getUtilCleanCommandTemplate,
  getUtilDoctorCommandTemplate,
  getUtilRestoreCommandTemplate,
} from "./commands/util.js";
import { getWorkCancelCommandTemplate, getWorkLoopCommandTemplate } from "./commands/work.js";
import {
  getJinnApplyCommandTemplate,
  getJinnArchiveCommandTemplate,
  getJinnExploreCommandTemplate,
  getJinnProposeCommandTemplate,
  getWorkflowsBrainstormCommandTemplate,
  getWorkflowsCompleteCommandTemplate,
  getWorkflowsCreateCommandTemplate,
  getWorkflowsExecuteCommandTemplate,
  getWorkflowsLearningsCommandTemplate,
  getWorkflowsPlanCommandTemplate,
  getWorkflowsReviewCommandTemplate,
  getWorkflowsStatusCommandTemplate,
  getWorkflowsStopCommandTemplate,
  getWorkflowsWorkCommandTemplate,
} from "./commands/workflows.js";
import {
  getDoAgentTemplate,
  getPlanAgentTemplate,
} from "./agents/index.js";
import {
  getFrontendDesignSkillTemplate,
  getGitMasterSkillTemplate,
} from "./skills/index.js";
import {
  getJinnApplySkillTemplate,
  getJinnArchiveSkillTemplate,
  getJinnExploreSkillTemplate,
  getJinnProposeSkillTemplate,
  getReadyForProdSkillTemplate,
} from "./skills/jinn-skills.js";

export function getDefaultCommandTemplates(): CommandTemplate[] {
  return [
    getGitSmartCommitCommandTemplate(),
    getGitBranchCommandTemplate(),
    getGitCleanupCommandTemplate(),
    getGitMergeCommandTemplate(),
    getCodeFormatCommandTemplate(),
    getCodeRefactorCommandTemplate(),
    getCodeReviewCommandTemplate(),
    getCodeOptimizeCommandTemplate(),
    getWorkflowsPlanCommandTemplate(),
    getWorkflowsExecuteCommandTemplate(),
    getWorkflowsReviewCommandTemplate(),
    getWorkflowsStatusCommandTemplate(),
    getWorkflowsStopCommandTemplate(),
    getWorkflowsCompleteCommandTemplate(),
    getWorkflowsCreateCommandTemplate(),
    getWorkflowsBrainstormCommandTemplate(),
    getWorkflowsLearningsCommandTemplate(),
    getWorkflowsWorkCommandTemplate(),
    getDocsDeployCommandTemplate(),
    getDocsFeatureVideoCommandTemplate(),
    getDocsReleaseCommandTemplate(),
    getDocsTestBrowserCommandTemplate(),
    getProjectBuildCommandTemplate(),
    getProjectConstitutionCommandTemplate(),
    getProjectDeployCommandTemplate(),
    getProjectInitCommandTemplate(),
    getProjectMapCommandTemplate(),
    getUtilBackupCommandTemplate(),
    getUtilCleanCommandTemplate(),
    getUtilDoctorCommandTemplate(),
    getUtilRestoreCommandTemplate(),
    getWorkCancelCommandTemplate(),
    getWorkLoopCommandTemplate(),
    getLintRubyCommandTemplate(),
    getRefactorCommandTemplate(),
    getJinnProposeCommandTemplate(),
    getJinnExploreCommandTemplate(),
    getJinnApplyCommandTemplate(),
    getJinnArchiveCommandTemplate(),
  ];
}

export function getDefaultSkillTemplates(): SkillTemplate[] {
  return [
    getGitMasterSkillTemplate(),
    getFrontendDesignSkillTemplate(),
    getJinnProposeSkillTemplate(),
    getJinnExploreSkillTemplate(),
    getJinnApplySkillTemplate(),
    getJinnArchiveSkillTemplate(),
    getReadyForProdSkillTemplate(),
  ];
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return [
    getDoAgentTemplate(),
    getPlanAgentTemplate(),
  ];
}
