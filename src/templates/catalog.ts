import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import { getDoAgentTemplate, getPlanAgentTemplate, getCaptureAgentTemplate } from "./agents/index.js";

// Code skills
import { getDesignSystemSkillTemplate } from "./skills/design-system/template.js";
import { getFrontendDesignSkillTemplate } from "./skills/jinn-frontend-design/template.js";
import { getCodeQualitySkillTemplate } from "./skills/jinn-code-quality/template.js";
import { getDevEnvironmentSkillTemplate } from "./skills/jinn-dev-environment/template.js";
import { getProjectInitSkillTemplate } from "./skills/jinn-project-init/template.js";
import { getProjectBuildSkillTemplate } from "./skills/jinn-build/template.js";
import { getProjectDeploySkillTemplate } from "./skills/jinn-deploy/template.js";
import { getProjectConventionsSkillTemplate } from "./skills/jinn-conventions/template.js";
import { getMapCodebaseSkillTemplate } from "./skills/jinn-map-codebase/template.js";

// Git skills
import { getGitMasterSkillTemplate } from "./skills/jinn-git-master/template.js";

// Workflow skills
import { getJinnApplySkillTemplate } from "./skills/jinn-apply/template.js";
import { getJinnArchiveSkillTemplate } from "./skills/jinn-archive/template.js";
import { getJinnCheckSkillTemplate } from "./skills/jinn-check/template.js";
import { getJinnExploreSkillTemplate } from "./skills/jinn-explore/template.js";
import { getJinnProposeSkillTemplate } from "./skills/jinn-propose/template.js";
import { getReadyForProdSkillTemplate } from "./skills/jinn-ready-for-prod/template.js";
import { getJinnReviewSkillTemplate } from "./skills/jinn-review/template.js";
import { getJinnSyncSkillTemplate } from "./skills/jinn-sync/template.js";
import { getJinnTriageSkillTemplate } from "./skills/jinn-triage/template.js";

// Docs skills
import { getDocsWorkflowSkillTemplate } from "./skills/jinn-docs-workflow/template.js";

// Support skills
import { getJinnUnblockSkillTemplate } from "./skills/jinn-unblock/template.js";

export function getDefaultSkillTemplates(): SkillTemplate[] {
  return [
    // Design
    getDesignSystemSkillTemplate(),
    getFrontendDesignSkillTemplate(),

    // Code quality and tooling
    getCodeQualitySkillTemplate(),
    getProjectConventionsSkillTemplate(),
    getProjectBuildSkillTemplate(),
    getProjectDeploySkillTemplate(),
    getProjectInitSkillTemplate(),
    getDevEnvironmentSkillTemplate(),
    getMapCodebaseSkillTemplate(),

    // Git
    getGitMasterSkillTemplate(),

    // Workflow
    getJinnProposeSkillTemplate(),
    getJinnExploreSkillTemplate(),
    getJinnApplySkillTemplate(),
    getJinnCheckSkillTemplate(),
    getJinnReviewSkillTemplate(),
    getJinnArchiveSkillTemplate(),
    getReadyForProdSkillTemplate(),
    getJinnSyncSkillTemplate(),
    getJinnTriageSkillTemplate(),

    // Docs
    getDocsWorkflowSkillTemplate(),

    // Support
    getJinnUnblockSkillTemplate(),
  ];
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return [getDoAgentTemplate(), getPlanAgentTemplate(), getCaptureAgentTemplate()];
}
