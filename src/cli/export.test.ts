import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { exportGenius } from "./export";
import { AGENTS_MANIFEST } from "../execution/features/agents-manifest";
import { createSkills } from "../execution/features/skills";

function countFilesRecursive(root: string): number {
  if (!existsSync(root)) return 0;
  let total = 0;
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else {
        total++;
      }
    }
  };
  walk(root);
  return total;
}

describe("export CLI", () => {
  let tempDir: string;
  const mockConsoleLog = mock(() => {});
  const mockConsoleError = mock(() => {});
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    //#given temporary project directory
    tempDir = join(
      tmpdir(),
      `ghostwire-export-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(tempDir, { recursive: true });
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("exports modular copilot artifact tree", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "copilot",
      directory: tempDir,
    });

    //#then
    const outputPath = join(tempDir, ".github", "copilot-instructions.md");
    const scopedPath = join(tempDir, ".github", "instructions", "typescript.instructions.md");
    const hookPath = join(tempDir, ".github", "hooks", "ghostwire-guardrails.json");
    const manifestPath = join(tempDir, ".ghostwire", "export-manifest.json");
    const agentsDir = join(tempDir, ".github", "agents");
    const promptsDir = join(tempDir, ".github", "prompts");
    const skillsDir = join(tempDir, ".github", "skills");

    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);
    expect(existsSync(scopedPath)).toBe(true);
    expect(existsSync(hookPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(false);
    expect(countFilesRecursive(agentsDir)).toBe(2);
    expect(countFilesRecursive(promptsDir)).toBeGreaterThan(30);
    expect(countFilesRecursive(skillsDir)).toBeGreaterThan(10);

    const content = readFileSync(outputPath, "utf-8");
    expect(content).toContain("Ghostwire Copilot Instructions");
    expect(content.length).toBeLessThan(4000);

  });

  test("exports codex instructions to AGENTS.md", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "codex",
      directory: tempDir,
    });

    //#then
    const outputPath = join(tempDir, "AGENTS.md");
    const manifestPath = join(tempDir, ".ghostwire", "export-manifest.json");
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(false);
    const content = readFileSync(outputPath, "utf-8");
    expect(content).toContain("Ghostwire Codex Instructions");
    expect(content).toContain("technical and scientific language");
    expect(content).toContain(AGENTS_MANIFEST[0].id);
  });

  test("does not overwrite existing files without --force", async () => {
    //#given
    const outputPath = join(tempDir, "AGENTS.md");
    writeFileSync(outputPath, "existing-content", "utf-8");

    //#when
    const exitCode = await exportGenius({
      target: "codex",
      directory: tempDir,
      force: false,
    });

    //#then
    expect(exitCode).toBe(1);
    expect(readFileSync(outputPath, "utf-8")).toBe("existing-content");
  });

  test("overwrites existing files with --force", async () => {
    //#given
    const outputPath = join(tempDir, "AGENTS.md");
    writeFileSync(outputPath, "existing-content", "utf-8");

    //#when
    const exitCode = await exportGenius({
      target: "codex",
      directory: tempDir,
      force: true,
    });

    //#then
    expect(exitCode).toBe(0);
    expect(readFileSync(outputPath, "utf-8")).not.toBe("existing-content");
  });

  test("produces deterministic artifacts for same target", async () => {
    //#when
    const first = await exportGenius({
      target: "copilot",
      directory: tempDir,
      force: true,
    });
    const promptFiles = readdirSync(join(tempDir, ".github", "prompts")).sort();
    const firstPrompt = promptFiles[0]!;
    const firstContent = readFileSync(join(tempDir, ".github", "prompts", firstPrompt), "utf-8");

    const second = await exportGenius({
      target: "copilot",
      directory: tempDir,
      force: true,
    });
    const secondContent = readFileSync(join(tempDir, ".github", "prompts", firstPrompt), "utf-8");

    //#then
    expect(first).toBe(0);
    expect(second).toBe(0);
    expect(firstContent).toBe(secondContent);
  });

  test("filters copilot artifacts by --groups", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "copilot",
      directory: tempDir,
      groups: "prompts",
    });

    //#then
    expect(exitCode).toBe(0);
    expect(existsSync(join(tempDir, ".github", "copilot-instructions.md"))).toBe(true);
    expect(countFilesRecursive(join(tempDir, ".github", "prompts"))).toBeGreaterThan(30);
    expect(existsSync(join(tempDir, ".github", "skills"))).toBe(false);
    expect(existsSync(join(tempDir, ".github", "hooks", "ghostwire-guardrails.json"))).toBe(false);
  });

  test("fails for invalid --groups value", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "copilot",
      directory: tempDir,
      groups: "prompts,invalid-group",
    });

    //#then
    expect(exitCode).toBe(1);
  });

  test("writes manifest only when --manifest is requested", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "copilot",
      directory: tempDir,
      manifest: true,
    });

    //#then
    const manifestPath = join(tempDir, ".ghostwire", "export-manifest.json");
    expect(exitCode).toBe(0);
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(manifest.generator).toBe("ghostwire-export/v3-full");
    expect(Array.isArray(manifest.entries)).toBe(true);
    expect(manifest.entries.length).toBeGreaterThan(70);
    expect(manifest.coverage.agents.source_count).toBe(AGENTS_MANIFEST.length);
    expect(manifest.coverage.agents.emitted_count).toBe(AGENTS_MANIFEST.length);
    expect(manifest.coverage.agents.missing_ids).toHaveLength(0);
    expect(manifest.coverage.skills.source_count).toBe(createSkills().length);
    expect(manifest.coverage.skills.emitted_count).toBe(createSkills().length);
    expect(manifest.coverage.skills.missing_ids).toHaveLength(0);
    expect(manifest.coverage.prompts.source_count).toBeGreaterThan(30);
    expect(manifest.coverage.prompts.source_count).toBe(manifest.coverage.prompts.emitted_count);
  });
});
