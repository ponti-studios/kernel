import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "spec-detector-"));
}

// ============================================================================
// Tool Definitions — structure tests (existing)
// ============================================================================

describe("Tool Definitions", () => {
  it("has tools defined", async () => {
    const { TOOL_DEFINITIONS } = await import("../definitions.js");
    expect(TOOL_DEFINITIONS.length).toBe(6);
  });

  it("each tool has unique id", async () => {
    const { TOOL_DEFINITIONS } = await import("../definitions.js");
    const ids = TOOL_DEFINITIONS.map((t: any) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("each tool has skillsDir", async () => {
    const { TOOL_DEFINITIONS } = await import("../definitions.js");
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.skillsDir).toBeDefined();
    }
  });

  it("opencode tool exists", async () => {
    const { TOOL_DEFINITIONS } = await import("../definitions.js");
    const opencode = TOOL_DEFINITIONS.find((t: any) => t.id === "opencode");
    expect(opencode).toBeDefined();
    expect(opencode!.skillsDir).toBe(".opencode");
  });

  it("codex tool exists", async () => {
    const { TOOL_DEFINITIONS } = await import("../definitions.js");
    const codex = TOOL_DEFINITIONS.find((t: any) => t.id === "codex");
    expect(codex).toBeDefined();
    expect(codex!.skillsDir).toBe(".codex");
  });
});

// ============================================================================
// Adapter Registry — structure tests (existing)
// ============================================================================

describe("Adapter Registry", () => {
  it("creates registry successfully", async () => {
    const { createPopulatedAdapterRegistry } = await import("../../adapters/index.js");
    const registry = createPopulatedAdapterRegistry();
    expect(registry).toBeDefined();
  });

  it("has getAll method", async () => {
    const { createPopulatedAdapterRegistry } = await import("../../adapters/index.js");
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    expect(Array.isArray(adapters)).toBe(true);
    expect(adapters.length).toBe(6);
  });

  it("throws on unknown tool", async () => {
    const { createPopulatedAdapterRegistry } = await import("../../adapters/index.js");
    const registry = createPopulatedAdapterRegistry();
    expect(() => registry.get("nonexistent-tool")).toThrow();
  });

  it("has registered tool ids", async () => {
    const { createPopulatedAdapterRegistry } = await import("../../adapters/index.js");
    const registry = createPopulatedAdapterRegistry();
    const ids = registry.getRegisteredToolIds();
    expect(ids).toContain("opencode");
    expect(ids).toContain("claude");
    expect(ids).toContain("codex");
    expect(ids).toContain("github-copilot");
    expect(ids).toContain("gemini");
    expect(ids).toContain("cursor");
  });
});

// ============================================================================
// Consistency check: definitions.skillsDir === adapter.skillsDir
// ============================================================================

describe("definitions ↔ adapter skillsDir consistency", () => {
  it("every tool definition skillsDir matches its adapter", async () => {
    const { TOOL_DEFINITIONS } = await import("../definitions.js");
    const { createPopulatedAdapterRegistry } = await import("../../adapters/index.js");
    const registry = createPopulatedAdapterRegistry();

    for (const def of TOOL_DEFINITIONS) {
      const adapter = registry.get(def.id);
      expect(adapter.skillsDir).toBe(def.skillsDir);
    }
  });
});

// ============================================================================
// detectAvailableTools — filesystem tests (new)
// ============================================================================

describe("detectAvailableTools — filesystem detection", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns empty array when no tool directories exist", async () => {
    const { detectAvailableTools } = await import("../detector.js");
    const result = await detectAvailableTools(tmpDir);
    expect(result).toEqual([]);
  });

  it("detects opencode when .opencode/ directory exists", async () => {
    const { detectAvailableTools } = await import("../detector.js");
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const result = await detectAvailableTools(tmpDir);
    expect(result).toContain("opencode");
  });

  it("detects multiple tools when multiple directories exist", async () => {
    const { detectAvailableTools } = await import("../detector.js");
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    await fs.mkdir(path.join(tmpDir, ".cursor"), { recursive: true });
    await fs.mkdir(path.join(tmpDir, ".claude"), { recursive: true });
    const result = await detectAvailableTools(tmpDir);
    expect(result).toContain("opencode");
    expect(result).toContain("cursor");
    expect(result).toContain("claude");
  });

  it("ignores a file at a skillsDir path (not a directory)", async () => {
    const { detectAvailableTools } = await import("../detector.js");
    // Create a file named .opencode instead of a directory
    await fs.writeFile(path.join(tmpDir, ".opencode"), "not a dir", "utf-8");
    const result = await detectAvailableTools(tmpDir);
    expect(result).not.toContain("opencode");
  });

  it("does not detect tools whose directories are absent", async () => {
    const { detectAvailableTools } = await import("../detector.js");
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const result = await detectAvailableTools(tmpDir);
    expect(result).not.toContain("cursor");
    expect(result).not.toContain("claude");
  });
});

// ============================================================================
// isToolAvailable — filesystem tests (new)
// ============================================================================

describe("isToolAvailable — filesystem detection", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns false for an unknown toolId", async () => {
    const { isToolAvailable } = await import("../detector.js");
    const result = await isToolAvailable(tmpDir, "not-a-real-tool");
    expect(result).toBe(false);
  });

  it("returns false when directory is absent", async () => {
    const { isToolAvailable } = await import("../detector.js");
    const result = await isToolAvailable(tmpDir, "opencode");
    expect(result).toBe(false);
  });

  it("returns true when directory is present", async () => {
    const { isToolAvailable } = await import("../detector.js");
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const result = await isToolAvailable(tmpDir, "opencode");
    expect(result).toBe(true);
  });

  it("returns false when path is a file instead of directory", async () => {
    const { isToolAvailable } = await import("../detector.js");
    await fs.writeFile(path.join(tmpDir, ".opencode"), "file not dir", "utf-8");
    const result = await isToolAvailable(tmpDir, "opencode");
    expect(result).toBe(false);
  });
});
