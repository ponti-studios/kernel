import type { PluginInput } from "@opencode-ai/plugin";
import { existsSync } from "node:fs";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { log } from "../../../integration/shared/logger";

const HOOK_NAME = "deterministic-edit-guard";

const DIRECT_EDIT_TOOLS = new Set(["write", "edit", "multiedit"]);
const DETERMINISTIC_TOKEN_TOOLS = new Set([
  "lsp_prepare_rename",
  "lsp_rename",
  "ast_grep_search",
  "ast_grep_replace",
]);

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".rb",
  ".go",
  ".rs",
  ".java",
  ".c",
  ".cc",
  ".cpp",
  ".cs",
  ".swift",
  ".kt",
  ".kts",
  ".php",
  ".scala",
  ".sh",
  ".bash",
  ".zsh",
  ".lua",
  ".sql",
  ".css",
  ".scss",
  ".less",
  ".html",
]);

const NON_CODE_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".json",
  ".jsonc",
  ".yml",
  ".yaml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  ".csv",
  ".tsv",
  ".xml",
]);

const sessionMutationTokens = new Map<string, number>();

function normalizeToolName(tool: string): string {
  return tool.trim().toLowerCase();
}

function extractFilePath(args: Record<string, unknown>): string | undefined {
  const value = (args.filePath ?? args.file_path ?? args.path ?? args.file) as unknown;
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function extractBashCommand(args: Record<string, unknown>): string | undefined {
  const value = (args.command ?? args.cmd ?? args.script) as unknown;
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function resolveInsideWorkspace(workspaceRoot: string, filePath: string): string {
  const resolved = isAbsolute(filePath) ? resolve(filePath) : resolve(workspaceRoot, filePath);
  const rel = relative(workspaceRoot, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    // Out-of-workspace paths are considered high risk for direct text edits.
    return resolved;
  }
  return resolved;
}

function isCodeFile(path: string): boolean {
  const extension = extname(path).toLowerCase();
  return CODE_EXTENSIONS.has(extension);
}

function isNonCodeFile(path: string): boolean {
  const extension = extname(path).toLowerCase();
  return NON_CODE_EXTENSIONS.has(extension);
}

function isToolFailure(outputText: string): boolean {
  const normalized = outputText.toLowerCase();
  return (
    normalized.includes("error:") ||
    normalized.includes("failed to") ||
    normalized.includes("could not") ||
    normalized.startsWith("error")
  );
}

function isCodeMutatingBashCommand(command: string): boolean {
  const c = command.toLowerCase();

  const codeExt = "(ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs|java|c|cc|cpp|cs|swift|kt|kts|php|scala|sh|bash|zsh|lua|sql|css|scss|less|html)";

  const redirectionToCode = new RegExp(`(?:>|>>)\\s*[^\\n|&;]+\\.(${codeExt})\\b`, "i").test(c);
  const teeToCode = new RegExp(`\\btee\\b[^\\n|&;]*\\.(${codeExt})\\b`, "i").test(c);
  const sedInPlaceCode = new RegExp(`\\bsed\\s+-i\\b[^\\n]*\\.(${codeExt})\\b`, "i").test(c);
  const perlInPlaceCode = new RegExp(`\\bperl\\s+-i\\b[^\\n]*\\.(${codeExt})\\b`, "i").test(c);

  return redirectionToCode || teeToCode || sedInPlaceCode || perlInPlaceCode;
}

function grantMutationToken(sessionID: string): number {
  const next = (sessionMutationTokens.get(sessionID) ?? 0) + 1;
  sessionMutationTokens.set(sessionID, next);
  return next;
}

function consumeMutationToken(sessionID: string): number {
  const current = sessionMutationTokens.get(sessionID) ?? 0;
  const next = Math.max(0, current - 1);
  sessionMutationTokens.set(sessionID, next);
  return next;
}

export function createDeterministicEditGuardHook(ctx: PluginInput) {
  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown> },
    ): Promise<void> => {
      const tool = normalizeToolName(input.tool);
      if (tool === "bash") {
        const command = extractBashCommand(output.args);
        if (!command || !isCodeMutatingBashCommand(command)) {
          return;
        }

        const remaining = sessionMutationTokens.get(input.sessionID) ?? 0;
        if (remaining <= 0) {
          log(`[${HOOK_NAME}] Blocked ad-hoc bash code mutation (no token)`, {
            sessionID: input.sessionID,
            tool: input.tool,
            command: command.slice(0, 180),
          });
          throw new Error(
            `[${HOOK_NAME}] Ad-hoc bash code mutation blocked. ` +
              `Policy requires deterministic tooling first. ` +
              `Run ast_grep_search/ast_grep_replace or lsp_prepare_rename/lsp_rename, then retry.`,
          );
        }

        consumeMutationToken(input.sessionID);
        return;
      }

      if (!DIRECT_EDIT_TOOLS.has(tool)) {
        return;
      }

      const filePath = extractFilePath(output.args);
      if (!filePath) {
        throw new Error(
          `[${HOOK_NAME}] Direct edit blocked: missing file path. ` +
            `Use deterministic tools first (ast_grep_search/ast_grep_replace/lsp_prepare_rename/lsp_rename).`,
        );
      }

      const resolvedPath = resolveInsideWorkspace(ctx.directory, filePath);
      const fileExists = existsSync(resolvedPath);

      // New file creation has no deterministic transform baseline to anchor against.
      if (!fileExists) {
        return;
      }

      if (isNonCodeFile(resolvedPath)) {
        return;
      }

      // Unknown extensions are treated as code-like for maximum safety.
      if (!isCodeFile(resolvedPath) && extname(resolvedPath) !== "") {
        const remaining = sessionMutationTokens.get(input.sessionID) ?? 0;
        if (remaining <= 0) {
          throw new Error(
            `[${HOOK_NAME}] Direct edit blocked for ${filePath}. ` +
              `No deterministic mutation token available. Run ast_grep_search/ast_grep_replace or lsp_prepare_rename/lsp_rename first.`,
          );
        }
        consumeMutationToken(input.sessionID);
        return;
      }

      const remaining = sessionMutationTokens.get(input.sessionID) ?? 0;
      if (remaining <= 0) {
        log(`[${HOOK_NAME}] Blocked direct code edit (no token)`, {
          sessionID: input.sessionID,
          tool: input.tool,
          filePath,
        });
        throw new Error(
          `[${HOOK_NAME}] Direct code edit blocked for ${filePath}. ` +
            `Policy requires deterministic tooling first. ` +
            `Run ast_grep_search/ast_grep_replace or lsp_prepare_rename/lsp_rename, then retry.`,
        );
      }

      const afterConsume = consumeMutationToken(input.sessionID);
      log(`[${HOOK_NAME}] Consumed deterministic mutation token`, {
        sessionID: input.sessionID,
        tool: input.tool,
        filePath,
        remainingTokens: afterConsume,
      });
    },

    "tool.execute.after": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { output: string },
    ): Promise<void> => {
      const tool = normalizeToolName(input.tool);
      if (!DETERMINISTIC_TOKEN_TOOLS.has(tool)) {
        return;
      }

      const outputText = typeof output.output === "string" ? output.output : "";
      if (isToolFailure(outputText)) {
        return;
      }

      const tokens = grantMutationToken(input.sessionID);
      log(`[${HOOK_NAME}] Granted deterministic mutation token`, {
        sessionID: input.sessionID,
        tool: input.tool,
        tokens,
      });
    },

    event: async (
      input: { event: { type: string; properties?: Record<string, unknown> } },
    ): Promise<void> => {
      if (input.event.type !== "session.deleted") {
        return;
      }

      const info = input.event.properties?.info as { id?: string } | undefined;
      const sessionID = info?.id;
      if (!sessionID) {
        return;
      }

      sessionMutationTokens.delete(sessionID);
    },
  };
}
