import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import { ALL_AGENTS } from "./agents/index.js";

// Code skills
import { getDesignSkillTemplate } from "./skills/spec-design/template.js";
import { getCodeQualitySkillTemplate } from "./skills/spec-code-quality/template.js";
import { getDevEnvironmentSkillTemplate } from "./skills/spec-dev-environment/template.js";
import { getProjectInitSkillTemplate } from "./skills/spec-project-init/template.js";
import { getProjectBuildSkillTemplate } from "./skills/spec-build/template.js";
import { getProjectDeploySkillTemplate } from "./skills/spec-deploy/template.js";
import { getProjectConventionsSkillTemplate } from "./skills/spec-conventions/template.js";
import { getMapCodebaseSkillTemplate } from "./skills/spec-map-codebase/template.js";

// Git skills
import { getGitMasterSkillTemplate } from "./skills/spec-git-master/template.js";

// Workflow skills
import { getSpecApplySkillTemplate } from "./skills/spec-apply/template.js";
import { getSpecArchiveSkillTemplate } from "./skills/spec-archive/template.js";
import { getSpecCheckSkillTemplate } from "./skills/spec-check/template.js";
import { getSpecExploreSkillTemplate } from "./skills/spec-explore/template.js";
import { getSpecProposeSkillTemplate } from "./skills/spec-propose/template.js";
import { getReadyForProdSkillTemplate } from "./skills/spec-ready-for-prod/template.js";
import { getSpecReviewSkillTemplate } from "./skills/spec-review/template.js";
import { getSpecSyncSkillTemplate } from "./skills/spec-sync/template.js";
import { getSpecTriageSkillTemplate } from "./skills/spec-triage/template.js";

// Docs skills
import { getDocsWorkflowSkillTemplate } from "./skills/spec-docs-workflow/template.js";

// Support skills
import { getSpecUnblockSkillTemplate } from "./skills/spec-unblock/template.js";

export function getDefaultSkillTemplates(): SkillTemplate[] {
  return [
    // Design
    getDesignSkillTemplate(),

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
    getSpecProposeSkillTemplate(),
    getSpecExploreSkillTemplate(),
    getSpecApplySkillTemplate(),
    getSpecCheckSkillTemplate(),
    getSpecReviewSkillTemplate(),
    getSpecArchiveSkillTemplate(),
    getReadyForProdSkillTemplate(),
    getSpecSyncSkillTemplate(),
    getSpecTriageSkillTemplate(),

    // Docs
    getDocsWorkflowSkillTemplate(),

    // Support
    getSpecUnblockSkillTemplate(),
  ];
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return ALL_AGENTS.map((getAgentTemplate) => getAgentTemplate());
}
