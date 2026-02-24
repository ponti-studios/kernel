import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDeterministicEditGuardHook } from "./index";

describe("deterministic-edit-guard", () => {
  let workspaceDir: string;
  const sessionID = "session-det-1";

  beforeEach(() => {
    workspaceDir = mkdtempSync(join(tmpdir(), "ghostwire-det-guard-"));
  });

  afterEach(() => {
    rmSync(workspaceDir, { recursive: true, force: true });
  });

  function makeHook() {
    return createDeterministicEditGuardHook({
      directory: workspaceDir,
      client: {},
    } as never);
  }

  test("blocks direct edit on existing code file without deterministic token", async () => {
    const file = join(workspaceDir, "src", "main.ts");
    mkdirSync(join(workspaceDir, "src"), { recursive: true });
    writeFileSync(file, "const x = 1;\n");

    const hook = makeHook();

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "Edit", sessionID, callID: "c1" },
        { args: { filePath: file, oldString: "1", newString: "2" } },
      ),
    ).rejects.toThrow("Direct code edit blocked");
  });

  test("grants token after deterministic tool success and consumes on code edit", async () => {
    const file = join(workspaceDir, "src", "main.ts");
    mkdirSync(join(workspaceDir, "src"), { recursive: true });
    writeFileSync(file, "const x = 1;\n");

    const hook = makeHook();

    await hook["tool.execute.after"]?.(
      { tool: "ast_grep_search", sessionID, callID: "c1" },
      { output: "Found 1 match" },
    );

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "edit", sessionID, callID: "c2" },
        { args: { filePath: file, oldString: "1", newString: "2" } },
      ),
    ).resolves.toBeUndefined();

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "edit", sessionID, callID: "c3" },
        { args: { filePath: file, oldString: "2", newString: "3" } },
      ),
    ).rejects.toThrow("Direct code edit blocked");
  });

  test("does not grant token on deterministic tool failure output", async () => {
    const file = join(workspaceDir, "src", "main.ts");
    mkdirSync(join(workspaceDir, "src"), { recursive: true });
    writeFileSync(file, "const x = 1;\n");

    const hook = makeHook();

    await hook["tool.execute.after"]?.(
      { tool: "lsp_rename", sessionID, callID: "c1" },
      { output: "Error: Cannot rename at this position" },
    );

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "edit", sessionID, callID: "c2" },
        { args: { filePath: file, oldString: "1", newString: "2" } },
      ),
    ).rejects.toThrow("Direct code edit blocked");
  });

  test("allows non-code direct edits without deterministic token", async () => {
    const file = join(workspaceDir, "docs", "notes.md");
    mkdirSync(join(workspaceDir, "docs"), { recursive: true });
    writeFileSync(file, "# note\n");

    const hook = makeHook();

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "write", sessionID, callID: "c1" },
        { args: { filePath: file, content: "# note\\nupdated" } },
      ),
    ).resolves.toBeUndefined();
  });

  test("allows creation of new code files without deterministic token", async () => {
    const file = join(workspaceDir, "src", "new-file.ts");
    const hook = makeHook();

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "write", sessionID, callID: "c1" },
        { args: { filePath: file, content: "export const n = 1;\n" } },
      ),
    ).resolves.toBeUndefined();
  });

  test("clears tokens when session is deleted", async () => {
    const file = join(workspaceDir, "src", "main.ts");
    mkdirSync(join(workspaceDir, "src"), { recursive: true });
    writeFileSync(file, "const x = 1;\n");

    const hook = makeHook();

    await hook["tool.execute.after"]?.(
      { tool: "ast_grep_replace", sessionID, callID: "c1" },
      { output: "Applied 1 replacement" },
    );

    await hook.event?.({
      event: {
        type: "session.deleted",
        properties: {
          info: { id: sessionID },
        },
      },
    });

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "edit", sessionID, callID: "c2" },
        { args: { filePath: file, oldString: "1", newString: "2" } },
      ),
    ).rejects.toThrow("Direct code edit blocked");
  });

  test("blocks ad-hoc bash in-place code mutation without token", async () => {
    const hook = makeHook();

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "bash", sessionID, callID: "c1" },
        { args: { command: "sed -i '' 's/foo/bar/g' src/main.ts" } },
      ),
    ).rejects.toThrow("Ad-hoc bash code mutation blocked");
  });

  test("allows ad-hoc bash code mutation when deterministic token exists", async () => {
    const hook = makeHook();

    await hook["tool.execute.after"]?.(
      { tool: "ast_grep_search", sessionID, callID: "c1" },
      { output: "Found 2 matches" },
    );

    await expect(
      hook["tool.execute.before"]?.(
        { tool: "bash", sessionID, callID: "c2" },
        { args: { command: "sed -i '' 's/foo/bar/g' src/main.ts" } },
      ),
    ).resolves.toBeUndefined();
  });
});
