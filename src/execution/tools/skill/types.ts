import type { SkillScope, LoadedSkill } from "../../opencode-skill-loader/types";
import type { SkillMcpManager } from "../../skill-mcp-manager/manager";
import type { GitMasterConfig } from "../../../platform/config/runtime.schema";

export interface SkillArgs {
  name: string;
}

export interface SkillInfo {
  name: string;
  description: string;
  location?: string;
  scope: SkillScope;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string[];
}

export interface SkillLoadOptions {
  /** When true, only load from OpenCode paths (.opencode/skills/, ~/.config/opencode/skills/) */
  opencodeOnly?: boolean;
  /** Pre-merged skills to use instead of discovering */
  skills?: LoadedSkill[];
  /** MCP manager for querying skill-embedded MCP servers */
  mcpManager?: SkillMcpManager;
  /** Session ID getter for MCP client identification */
  getSessionID?: () => string;
  /** Git master configuration for watermark/co-author settings */
  gitMasterConfig?: GitMasterConfig;
}

// CRUD Types
export interface SkillListArgs {
  scope?: "plugin" | "project" | "user" | "all";
}

export interface SkillCreateArgs {
  name: string;
  description: string;
  template?: "agent" | "tool" | "analysis" | "hook";
  scope?: "project" | "user";
  content?: string;
}

export interface SkillUpdateArgs {
  skill_name: string;
  name?: string;
  description?: string;
  content?: string;
  append?: string;
}

export interface SkillDeleteArgs {
  skill_name: string;
  force?: boolean;
}
