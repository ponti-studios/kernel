import type { CommandDefinition } from "../command-loader/types";
import type { SkillMcpConfig } from "../skill-mcp-manager/types";

export type SkillScope = "plugin" | "config" | "user" | "project" | "opencode" | "opencode-project";

export interface SkillMetadata {
  name?: string;
  description?: string;
  model?: string;
  "argument-hint"?: string;
  agent?: string;
  subtask?: boolean;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  "allowed-tools"?: string | string[];
  mcp?: SkillMcpConfig;
}

export interface LazyContentLoader {
  loaded: boolean;
  content?: string;
  load: () => Promise<string>;
}

export interface LoadedSkill {
  name: string;
  path?: string;
  resolvedPath?: string;
  definition: CommandDefinition;
  scope: SkillScope;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string[];
  mcpConfig?: SkillMcpConfig;
  lazyContent?: LazyContentLoader;
}

export type CanonicalSkillScopeKind =
  | "project-local-nearest"
  | "parent-scope"
  | "user-scope"
  | "system-scope"
  | "builtin";

export interface CanonicalDiscoveryPolicy {
  canonicalPath: ".agents/skills";
  scopeWalkEnabled: boolean;
  collisionPolicy: "first-wins";
  emitCollisionDiagnostics: boolean;
}

export interface ScopedSkillSource {
  kind: CanonicalSkillScopeKind;
  rootPath: string;
  skillsPath: string;
  precedenceRank: number;
}

export interface SkillCollisionDiagnostic {
  skillName: string;
  winnerPath?: string;
  loserPath?: string;
  winnerScope: SkillScope;
  loserScope: SkillScope;
  reason: "first-wins";
}

export interface DeterministicResolutionResult {
  skills: LoadedSkill[];
  collisions: SkillCollisionDiagnostic[];
}
