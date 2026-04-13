import type { AgentTemplate, SkillTemplate } from "../templates/types.js";
import { getDoAgentTemplate } from "../../templates/agents/kernel-do/template.js";
import { getGitAgentTemplate } from "../../templates/agents/kernel-git/template.js";
import { getPlanAgentTemplate } from "../../templates/agents/kernel-plan/template.js";
import { getReviewAgentTemplate } from "../../templates/agents/kernel-review/template.js";
import { getSearchAgentTemplate } from "../../templates/agents/kernel-search/template.js";
import { getApiEngineeringSkillTemplate } from "../../templates/skills/kernel-api-engineering/template.js";
import { getAssetIntegrationSecuritySkillTemplate } from "../../templates/skills/kernel-asset-integration-security/template.js";
import { getAuthContractSkillTemplate } from "../../templates/skills/kernel-auth-contract/template.js";
import { getBuildSkillTemplate } from "../../templates/skills/kernel-build/template.js";
import { getDatabaseWorkflowSkillTemplate } from "../../templates/skills/kernel-database-workflow/template.js";
import { getGitMasterSkillTemplate } from "../../templates/skills/kernel-git-master/template.js";
import { getMapCodebaseSkillTemplate } from "../../templates/skills/kernel-map-codebase/template.js";
import { getProjectSetupSkillTemplate } from "../../templates/skills/kernel-project-setup/template.js";
import { getReactNativeSkillTemplate } from "../../templates/skills/kernel-react-native/template.js";
import { getReactPatternsSkillTemplate } from "../../templates/skills/kernel-react-patterns/template.js";
import { getReviewSkillTemplate } from "../../templates/skills/kernel-review/template.js";
import { getTypeArchitectureSkillTemplate } from "../../templates/skills/kernel-type-architecture/template.js";
import type { BrainCommandAlias, BrainPackageManifest, BuiltInCatalog } from "./types.js";

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.name, item])).values()];
}

function dedupePackages(packages: BrainPackageManifest[]): BrainPackageManifest[] {
  return [...new Map(packages.map((pkg) => [pkg.id, pkg])).values()];
}

function getBuiltInSkills(): SkillTemplate[] {
  return dedupeByName([
    getBuildSkillTemplate(),
    getMapCodebaseSkillTemplate(),
    getProjectSetupSkillTemplate(),
    getGitMasterSkillTemplate(),
    getReviewSkillTemplate(),
    getApiEngineeringSkillTemplate(),
    getAssetIntegrationSecuritySkillTemplate(),
    getReactPatternsSkillTemplate(),
    getReactNativeSkillTemplate(),
    getDatabaseWorkflowSkillTemplate(),
    getAuthContractSkillTemplate(),
    getTypeArchitectureSkillTemplate(),
  ]);
}

function getBuiltInAgents(): AgentTemplate[] {
  return dedupeByName([
    getPlanAgentTemplate(),
    getDoAgentTemplate(),
    getReviewAgentTemplate(),
    getSearchAgentTemplate(),
    getGitAgentTemplate(),
  ]);
}

function getBuiltInCommands(): BrainCommandAlias[] {
  return [
    {
      name: "kernel-init",
      description: "Initialize the local Kernel brain, detect hosts, import legacy skills, and sync.",
      target: "init",
    },
    {
      name: "kernel-sync",
      description: "Sync the local Kernel brain into every enabled agent host directory.",
      target: "sync",
    },
    {
      name: "kernel-doctor",
      description: "Diagnose the local Kernel brain, generated host files, and sync drift.",
      target: "doctor",
    },
    {
      name: "kernel-work-new",
      description: "Create a new local work item in kernel/work/ and make it the active task.",
      target: "work new",
      argumentHint: "goal or work description",
    },
    {
      name: "kernel-work-plan",
      description: "Refresh the local work plan and sync tasks into structured state.",
      target: "work plan",
      argumentHint: "optional work id",
    },
    {
      name: "kernel-work-next",
      description: "Show the next unchecked task for the active local work item.",
      target: "work next",
      argumentHint: "optional work id",
    },
    {
      name: "kernel-work-status",
      description: "Show progress for the active local work item.",
      target: "work status",
      argumentHint: "optional work id",
    },
    {
      name: "kernel-work-done",
      description: "Mark a local work task complete and sync the task view.",
      target: "work done",
      argumentHint: "task id or title",
    },
    {
      name: "kernel-work-archive",
      description: "Archive a completed local work item into kernel/work/archive/.",
      target: "work archive",
      argumentHint: "optional work id",
    },
  ];
}

function getBuiltInPackages(): BrainPackageManifest[] {
  return dedupePackages([
    {
      id: "core-brain",
      name: "Core Brain",
      description: "Local-first core skills and orchestration agents for day-to-day coding work.",
      skills: ["kernel-build", "kernel-map-codebase", "kernel-project-setup"],
      agents: ["kernel-plan", "kernel-do", "kernel-search"],
      commands: ["kernel-init", "kernel-sync", "kernel-doctor"],
    },
    {
      id: "workflow-local",
      name: "Workflow Local",
      description: "Local work management commands for planning, tracking, and closing tasks in the repo.",
      skills: [],
      agents: [],
      commands: [
        "kernel-work-new",
        "kernel-work-plan",
        "kernel-work-next",
        "kernel-work-status",
        "kernel-work-done",
        "kernel-work-archive",
      ],
    },
    {
      id: "git",
      name: "Git",
      description: "Git strategy and safe history management.",
      skills: ["kernel-git-master"],
      agents: ["kernel-git"],
      commands: [],
    },
    {
      id: "review",
      name: "Review",
      description: "Review and sign-off helpers for completed work.",
      skills: ["kernel-review"],
      agents: ["kernel-review"],
      commands: [],
    },
    {
      id: "frontend",
      name: "Frontend",
      description: "Frontend architecture, component, and safety skills.",
      skills: [
        "kernel-api-engineering",
        "kernel-asset-integration-security",
        "kernel-react-patterns",
      ],
      agents: [],
      commands: [],
    },
    {
      id: "mobile",
      name: "Mobile",
      description: "React Native and Expo workflow guidance.",
      skills: ["kernel-react-native"],
      agents: [],
      commands: [],
    },
    {
      id: "database",
      name: "Database",
      description: "Schema, auth, and shared type architecture skills.",
      skills: [
        "kernel-database-workflow",
        "kernel-auth-contract",
        "kernel-type-architecture",
      ],
      agents: [],
      commands: [],
    },
  ]);
}

export function getBuiltInCatalog(): BuiltInCatalog {
  return {
    packages: getBuiltInPackages(),
    skills: getBuiltInSkills(),
    agents: getBuiltInAgents(),
    commands: getBuiltInCommands(),
  };
}

export function getBuiltInPackage(packageId: string): BrainPackageManifest | null {
  return getBuiltInCatalog().packages.find((pkg) => pkg.id === packageId) ?? null;
}

export function getBuiltInPackageIds(): string[] {
  return getBuiltInCatalog().packages.map((pkg) => pkg.id);
}
