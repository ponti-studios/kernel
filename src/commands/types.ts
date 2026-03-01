import type { CommandDefinition } from "../claude-code-command-loader";
import type { CommandName as UnifiedCommandName } from "./command-name-values";

export type CommandName = UnifiedCommandName;

export interface CommandConfig {
  disabled_commands?: CommandName[];
}

export type Commands = Record<string, CommandDefinition>;
