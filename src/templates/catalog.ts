import type { Profile } from "../core/config/schema.js";
import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import { ALL_AGENTS } from "./agents/index.js";

// Code skills
import { getBuildSkillTemplate } from "./skills/kernel-build/template.js";
import { getMapCodebaseSkillTemplate } from "./skills/kernel-map-codebase/template.js";
import { getPdfSkillTemplate } from "./skills/kernel-pdf/template.js";
import { getProjectInitSkillTemplate } from "./skills/kernel-project-init/template.js";
import { getProjectSetupSkillTemplate } from "./skills/kernel-project-setup/template.js";

// Git skills
import { getGitMasterSkillTemplate } from "./skills/kernel-git-master/template.js";

// Workflow skills
import { getCloseSkillTemplate } from "./skills/kernel-close/template.js";
import { getExecuteSkillTemplate } from "./skills/kernel-execute/template.js";
import { getIntakeSkillTemplate } from "./skills/kernel-intake/template.js";
import { getPlanSkillTemplate } from "./skills/kernel-plan/template.js";
import { getResearchSkillTemplate } from "./skills/kernel-research/template.js";
import { getReviewSkillTemplate } from "./skills/kernel-review/template.js";
import { getShipSkillTemplate } from "./skills/kernel-ship/template.js";
import { getStatusSkillTemplate } from "./skills/kernel-status/template.js";
import { getSyncSkillTemplate } from "./skills/kernel-sync/template.js";
import { getUnblockSkillTemplate } from "./skills/kernel-unblock/template.js";

// Docs skills
import { getDocsWorkflowSkillTemplate } from "./skills/kernel-docs-workflow/template.js";

// Specialist skills
import { getApiEngineeringSkillTemplate } from "./skills/kernel-api-engineering/template.js";
import { getAssetIntegrationSecuritySkillTemplate } from "./skills/kernel-asset-integration-security/template.js";
import { getAuthContractSkillTemplate } from "./skills/kernel-auth-contract/template.js";
import { getDatabaseWorkflowSkillTemplate } from "./skills/kernel-database-workflow/template.js";
import { getDockerWorkflowSkillTemplate } from "./skills/kernel-docker-workflow/template.js";
import { getReactPatternsSkillTemplate } from "./skills/kernel-react-patterns/template.js";
import { getTestingStandardsSkillTemplate } from "./skills/kernel-testing-standards/template.js";
import { getTypeArchitectureSkillTemplate } from "./skills/kernel-type-architecture/template.js";

// Mobile skills
import { getReactNativeSkillTemplate } from "./skills/kernel-react-native/template.js";

// Design skills
import { getDesignSkillTemplate } from "./skills/kernel-design/template.js";
// Ecosystem skills
import { getSkillBuilderSkillTemplate } from "./skills/kernel-skill-builder/template.js";

export function getDefaultSkillTemplates(profile: Profile = "extended"): SkillTemplate[] {
  const all = [
    // Code quality and tooling
    getBuildSkillTemplate(),
    getProjectInitSkillTemplate(),
    getProjectSetupSkillTemplate(),
    getMapCodebaseSkillTemplate(),
    getPdfSkillTemplate(),

    // Git
    getGitMasterSkillTemplate(),

    // Workflow
    getPlanSkillTemplate(),
    getResearchSkillTemplate(),
    getExecuteSkillTemplate(),
    getStatusSkillTemplate(),
    getReviewSkillTemplate(),
    getSyncSkillTemplate(),
    getUnblockSkillTemplate(),
    getIntakeSkillTemplate(),
    getCloseSkillTemplate(),
    getShipSkillTemplate(),

    // Docs
    getDocsWorkflowSkillTemplate(),

    // Specialist
    getApiEngineeringSkillTemplate(),
    getAssetIntegrationSecuritySkillTemplate(),
    getAuthContractSkillTemplate(),
    getDatabaseWorkflowSkillTemplate(),
    getDockerWorkflowSkillTemplate(),
    getReactPatternsSkillTemplate(),
    getTestingStandardsSkillTemplate(),
    getTypeArchitectureSkillTemplate(),

    // Mobile
    getReactNativeSkillTemplate(),

    // Design
    getDesignSkillTemplate(),
    // Ecosystem
    getSkillBuilderSkillTemplate(),
  ];

  if (profile === "core") {
    return all.filter((t) => t.profile === "core");
  }
  return all;
}

export function getDefaultAgentTemplates(profile: Profile = "extended"): AgentTemplate[] {
  const all = ALL_AGENTS.map((getAgentTemplate) => getAgentTemplate());
  if (profile === "core") {
    return all.filter((t) => t.profile === "core");
  }
  return all;
}
