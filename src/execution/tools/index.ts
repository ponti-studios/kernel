import {
  lsp_goto_definition,
  lsp_find_references,
  lsp_symbols,
  lsp_diagnostics,
  lsp_prepare_rename,
  lsp_rename,
} from "./lsp/tools";

import { lspManager } from "./lsp/client";
export { lspManager };

import { ast_grep_search, ast_grep_replace } from "./ast-grep";

import { grep } from "./grep";
import { glob } from "./glob";
export { createSlashcommandTool, discoverCommandsSync } from "./slashcommand/tools";

import {
  session_list,
  session_read,
  session_search,
  session_info,
  session_create,
  session_update,
  session_delete,
} from "./session-manager/tools";

export { sessionExists } from "./session-manager/storage";

export { interactive_bash, startBackgroundCheck as startTmuxCheck } from "./interactive-bash";
export { createSkillTool } from "./skill/tools";
export { createSkillMcpTool } from "./skill-mcp";

import { todo_create, todo_list, todo_update, todo_delete } from "./todo-manager/tools";

import { skill_list, skill_create, skill_update, skill_delete } from "./skill/crud";

import {
  createBackgroundOutput,
  createBackgroundCancel,
  createBackgroundTaskList,
  createBackgroundTaskInfo,
  createBackgroundTaskUpdate,
} from "./background-task/tools";

import type { PluginInput, ToolDefinition } from "@opencode-ai/plugin";
import type { BackgroundManager } from "../background-agent/manager";

type OpencodeClient = PluginInput["client"];

export { createLookAt } from "./look-at/tools";
export { createDelegateTask } from "./delegate-task/tools";

export function createBackgroundTools(
  manager: BackgroundManager,
  client: OpencodeClient,
): Record<string, ToolDefinition> {
  return {
    background_output: createBackgroundOutput(manager, client),
    background_cancel: createBackgroundCancel(manager, client),
    background_task_list: createBackgroundTaskList(manager),
    background_task_info: createBackgroundTaskInfo(manager),
    background_task_update: createBackgroundTaskUpdate(manager),
  };
}

export const tools: Record<string, ToolDefinition> = {
  lsp_goto_definition,
  lsp_find_references,
  lsp_symbols,
  lsp_diagnostics,
  lsp_prepare_rename,
  lsp_rename,
  ast_grep_search,
  ast_grep_replace,
  grep,
  glob,
  session_list,
  session_read,
  session_search,
  session_info,
  session_create,
  session_update,
  session_delete,
  todo_create,
  todo_list,
  todo_update,
  todo_delete,
  skill_list,
  skill_create,
  skill_update,
  skill_delete,
};
