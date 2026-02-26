import type { PluginInput } from "@opencode-ai/plugin";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve, relative, isAbsolute } from "node:path";
import {
  HOOK_NAME,
  PLANNER_AGENTS,
  ALLOWED_EXTENSIONS,
  ALLOWED_PATH_PREFIX,
  BLOCKED_TOOLS,
  PLANNING_CONSULT_WARNING,
  PLANNER_WORKFLOW_REMINDER,
} from "./constants";
import {
  findNearestMessageWithFields,
  findFirstMessageWithAgent,
  MESSAGE_STORAGE,
} from "../../../execution/features/hook-message-injector";
import { getSessionAgent } from "../../../execution/features/claude-code-session-state";
import { log } from "../../../integration/shared/logger";
import { SYSTEM_DIRECTIVE_PREFIX } from "../../../integration/shared/system-directive";
import { getAgentDisplayName } from "../../../integration/shared/agent-display-names";

export * from "./constants";

/**
 * Cross-platform path validator for planner file writes.
 * Uses path.resolve/relative instead of string matching to handle:
 * - Windows backslashes (e.g., .ghostwire\\plans\\x.md)
 * - Mixed separators (e.g., .ghostwire\\plans/x.md)
 * - Case-insensitive directory/extension matching
 * - Workspace confinement (blocks paths outside root or via traversal)
 * - Nested project paths (e.g., parent/.ghostwire/... when ctx.directory is parent)
 */
function isAllowedFile(filePath: string, workspaceRoot: string): boolean {
  // 1. Resolve to absolute path
  const resolved = resolve(workspaceRoot, filePath);

  // 2. Get relative path from workspace root
  const rel = relative(workspaceRoot, resolved);

  // 3. Reject if escapes root (starts with ".." or is absolute)
  if (rel.startsWith("..") || isAbsolute(rel)) {
    return false;
  }

  // 4. Check if .ghostwire/ or .ghostwire\ exists anywhere in the path (case-insensitive)
  // This handles both direct paths (.ghostwire/x.md) and nested paths (project/.ghostwire/x.md)
  if (!/\.ghostwire[/\\]/i.test(rel)) {
    return false;
  }

  // 5. Check extension matches one of ALLOWED_EXTENSIONS (case-insensitive)
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    resolved.toLowerCase().endsWith(ext.toLowerCase()),
  );
  if (!hasAllowedExtension) {
    return false;
  }

  return true;
}

function getMessageDir(sessionID: string): string | null {
  if (!existsSync(MESSAGE_STORAGE)) return null;

  const directPath = join(MESSAGE_STORAGE, sessionID);
  if (existsSync(directPath)) return directPath;

  for (const dir of readdirSync(MESSAGE_STORAGE)) {
    const sessionPath = join(MESSAGE_STORAGE, dir, sessionID);
    if (existsSync(sessionPath)) return sessionPath;
  }

  return null;
}

const TASK_TOOLS = ["delegate_task", "task"];

function getAgentFromMessageFiles(sessionID: string): string | undefined {
  const messageDir = getMessageDir(sessionID);
  if (!messageDir) return undefined;
  return findFirstMessageWithAgent(messageDir) ?? findNearestMessageWithFields(messageDir)?.agent;
}

function getAgentFromSession(sessionID: string): string | undefined {
  return getSessionAgent(sessionID) ?? getAgentFromMessageFiles(sessionID);
}

export function createPlannerMdOnlyHook(ctx: PluginInput) {
  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string },
    ): Promise<void> => {
      const agentName = getAgentFromSession(input.sessionID);

      if (!agentName || !PLANNER_AGENTS.includes(agentName)) {
        return;
      }

      const toolName = input.tool;

      // Inject read-only warning for task tools called by planner
      if (TASK_TOOLS.includes(toolName)) {
        const prompt = output.args.prompt as string | undefined;
        if (prompt && !prompt.includes(SYSTEM_DIRECTIVE_PREFIX)) {
          output.args.prompt = PLANNING_CONSULT_WARNING + prompt;
          log(`[${HOOK_NAME}] Injected read-only planning warning to ${toolName}`, {
            sessionID: input.sessionID,
            tool: toolName,
            agent: agentName,
          });
        }
        return;
      }

      if (!BLOCKED_TOOLS.includes(toolName)) {
        return;
      }

      const filePath = (output.args.filePath ?? output.args.path ?? output.args.file) as
        | string
        | undefined;
      if (!filePath) {
        return;
      }

      if (!isAllowedFile(filePath, ctx.directory)) {
        log(`[${HOOK_NAME}] Blocked: planner can only write to .ghostwire/*.md`, {
          sessionID: input.sessionID,
          tool: toolName,
          filePath,
          agent: agentName,
        });
        throw new Error(
          `[${HOOK_NAME}] ${getAgentDisplayName("planner")} can only write/edit .md files inside .ghostwire/ directory. ` +
            `Attempted to modify: ${filePath}. ` +
            `${getAgentDisplayName("planner")} is a READ-ONLY planner. Use /ghostwire:workflows:execute to execute the plan. ` +
            `APOLOGIZE TO THE USER, REMIND OF YOUR PLAN WRITING PROCESSES, TELL USER WHAT YOU WILL GOING TO DO AS THE PROCESS, WRITE THE PLAN`,
        );
      }

      const normalizedPath = filePath.toLowerCase().replace(/\\/g, "/");
      if (
        normalizedPath.includes(".ghostwire/plans/") ||
        normalizedPath.includes(".ghostwire\\plans\\")
      ) {
        log(`[${HOOK_NAME}] Injecting workflow reminder for plan write`, {
          sessionID: input.sessionID,
          tool: toolName,
          filePath,
          agent: agentName,
        });
        output.message = (output.message || "") + PLANNER_WORKFLOW_REMINDER;
      }

      log(`[${HOOK_NAME}] Allowed: .ghostwire/*.md write permitted`, {
        sessionID: input.sessionID,
        tool: toolName,
        filePath,
        agent: agentName,
      });
    },
  };
}
