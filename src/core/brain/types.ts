import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";

export type HostId = "claude" | "codex" | "copilot" | "opencode" | "pi";

export interface BrainConfig {
  version: string;
  hosts: HostId[];
  packages: string[];
  brainPath?: string;
}

export interface BrainCommandAlias {
  name: string;
  description: string;
  target: string;
  argumentHint?: string;
}

export interface BrainPackageManifest {
  id: string;
  name: string;
  description: string;
  skills: string[];
  agents: string[];
  commands: string[];
}

export interface BuiltInCatalog {
  packages: BrainPackageManifest[];
  skills: SkillTemplate[];
  agents: AgentTemplate[];
  commands: BrainCommandAlias[];
}

export interface HostDescriptor {
  id: HostId;
  name: string;
  homeDir: string;
  projectMarker: string;
}

export interface SyncTrackedHostState {
  paths: string[];
}

export interface SyncManifest {
  version: number;
  hosts: Partial<Record<HostId, SyncTrackedHostState>>;
}

export interface SyncAction {
  path: string;
  kind: "file" | "symlink";
  content?: string;
  target?: string;
}

export interface SyncHostResult {
  host: HostId;
  created: number;
  updated: number;
  removed: number;
  unchanged: number;
  tracked: string[];
}

export interface SyncResult {
  brainPath: string;
  importedLegacySkills: string[];
  hosts: SyncHostResult[];
}

export interface InitResult {
  configPath: string;
  brainPath: string;
  detectedHosts: HostId[];
  enabledHosts: HostId[];
  enabledPackages: string[];
  importedLegacySkills: string[];
}

export interface DoctorIssue {
  level: "error" | "warning";
  message: string;
}

export interface DoctorResult {
  configPath: string;
  brainPath: string;
  hosts: HostId[];
  packages: string[];
  issues: DoctorIssue[];
}

export interface PackageMutationResult {
  configPath: string;
  packages: string[];
}

export interface HostStatus {
  id: HostId;
  name: string;
  detected: boolean;
  enabled: boolean;
  homePath: string;
}

export interface CommandMaterialization {
  alias: BrainCommandAlias;
  template: CommandTemplate;
}
