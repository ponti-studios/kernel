import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { generateFiles } from "../index.js";
import type { Config } from "../../config/schema.js";

// Helpers
async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "jinn-integ-"));
}

async function countFilesInDir(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).length;
  } catch {
    return 0;
  }
}

async function countDirsInDir(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).length;
  } catch {
    return 0;
  }
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function readFileContent(p: string): Promise<string> {
  return fs.readFile(p, "utf-8");
}

// ============================================================================
// opencode — delivery: 'both'
// ============================================================================

describe("Generator integration — opencode, delivery: both", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["opencode"],
    profile: "core",
    delivery: "both",
  };

  it("result has no failures", async () => {
    const result = await generateFiles(config, tmpDir);
    expect(result.failed).toHaveLength(0);
  });

  it("generates skill directories under .opencode/skills/", async () => {
    await generateFiles(config, tmpDir);
    // 20 skill templates
    const count = await countDirsInDir(path.join(tmpDir, ".opencode", "skills"));
    expect(count).toBe(20);
  });

  it("generates agent files under .opencode/agents/", async () => {
    await generateFiles(config, tmpDir);
    // 8 agent templates → 8 .md files
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const count = await countFilesInDir(agentDir);
    expect(count).toBe(8);
  });

  it('skill SKILL.md files contain generatedBy: "1.0.0"', async () => {
    await generateFiles(config, tmpDir);
    const skillsDir = path.join(tmpDir, ".opencode", "skills");
    const subdirs = await fs.readdir(skillsDir);
    expect(subdirs.length).toBeGreaterThan(0);

    const firstSkillFile = path.join(skillsDir, subdirs[0], "SKILL.md");
    const content = await readFileContent(firstSkillFile);
    expect(content).toContain('generatedBy: "1.0.0"');
  });
});

// ============================================================================
// claude — delivery: 'both'
// ============================================================================

describe("Generator integration — claude, delivery: both", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["claude"],
    profile: "core",
    delivery: "both",
  };

  it("generates 8 agent files under .claude/agents/", async () => {
    await generateFiles(config, tmpDir);
    const count = await countFilesInDir(path.join(tmpDir, ".claude", "agents"));
    expect(count).toBe(8);
  });

  it("agent files contain tools: field (model omitted, defaults to inherit)", async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, ".claude", "agents");
    const files = await fs.readdir(agentsDir);
    const content = await readFileContent(path.join(agentsDir, files[0]));
    expect(content).toContain("tools:");
    expect(content).not.toContain("model: sonnet");
  });

  it("specific agent file exists at .claude/agents/jinn-plan.md", async () => {
    await generateFiles(config, tmpDir);
    const ok = await fileExists(path.join(tmpDir, ".claude", "agents", "jinn-plan.md"));
    expect(ok).toBe(true);
  });
});

// ============================================================================
// cursor
// ============================================================================

describe("Generator integration — cursor", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["cursor"],
    profile: "core",
    delivery: "both",
  };

  it("skill directories created under .cursor/skills/", async () => {
    await generateFiles(config, tmpDir);
    const count = await countDirsInDir(path.join(tmpDir, ".cursor", "skills"));
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// github-copilot
// ============================================================================

describe("Generator integration — github-copilot", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["github-copilot"],
    profile: "core",
    delivery: "both",
  };

  it("agent files land in .github/agents/ with .agent.md extension", async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, ".github", "agents");
    const ok = await dirExists(agentsDir);
    expect(ok).toBe(true);
    const files = await fs.readdir(agentsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toMatch(/\.agent\.md$/);
  });
});

// ============================================================================
// gemini
// ============================================================================

describe("Generator integration — gemini", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["gemini"],
    profile: "core",
    delivery: "skills",
  };

  it("skill directories created under .gemini/skills/", async () => {
    await generateFiles(config, tmpDir);
    const count = await countDirsInDir(path.join(tmpDir, ".gemini", "skills"));
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// Delivery modes
// ============================================================================

describe("Generator integration — delivery modes", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("delivery: 'skills' — skill files exist, no command or agent files", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["opencode"],
      profile: "core",
      delivery: "skills",
    };
    await generateFiles(config, tmpDir);

    const cmdDirExists = await dirExists(path.join(tmpDir, ".opencode", "commands"));
    expect(cmdDirExists).toBe(false);

    const skillCount = await countDirsInDir(path.join(tmpDir, ".opencode", "skills"));
    expect(skillCount).toBeGreaterThan(0);

    const agentDirExists = await dirExists(path.join(tmpDir, ".opencode", "agents"));
    expect(agentDirExists).toBe(false);
  });

  it("delivery: 'both' — skills and agents generated, no command files", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["claude"],
      profile: "core",
      delivery: "both",
    };
    await generateFiles(config, tmpDir);

    const cmdDirExists = await dirExists(path.join(tmpDir, ".claude", "commands"));
    expect(cmdDirExists).toBe(false);

    const skillCount = await countDirsInDir(path.join(tmpDir, ".claude", "skills"));
    expect(skillCount).toBeGreaterThan(0);

    const agentCount = await countFilesInDir(path.join(tmpDir, ".claude", "agents"));
    expect(agentCount).toBeGreaterThan(0);
  });
});

// ============================================================================
// Multi-tool
// ============================================================================

describe("Generator integration — multi-tool", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["opencode", "claude", "cursor"],
    profile: "core",
    delivery: "both",
  };

  it("creates all three tool directories with skills and agents", async () => {
    await generateFiles(config, tmpDir);
    expect(await dirExists(path.join(tmpDir, ".opencode", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".claude", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".cursor", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".opencode", "agents"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".claude", "agents"))).toBe(true);
  });

  it("no cross-contamination between tool directories", async () => {
    await generateFiles(config, tmpDir);
    // OpenCode skill dirs use slug names
    const opencodeSkillsDir = path.join(tmpDir, ".opencode", "skills");
    const opencodeSkills = await fs.readdir(opencodeSkillsDir);
    expect(opencodeSkills.length).toBeGreaterThan(0);
    // Each entry should be a directory (skill subdirectory)
    for (const entry of opencodeSkills) {
      const stat = await fs.stat(path.join(opencodeSkillsDir, entry));
      expect(stat.isDirectory()).toBe(true);
    }
  });
});

// ============================================================================
// Idempotency
// ============================================================================

describe("Generator integration — idempotency", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("second call overwrites cleanly with same file count", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["opencode"],
      profile: "core",
      delivery: "both",
    };

    await generateFiles(config, tmpDir);
    const skillCountFirst = await countDirsInDir(path.join(tmpDir, ".opencode", "skills"));
    const agentCountFirst = await countFilesInDir(path.join(tmpDir, ".opencode", "agents"));

    await generateFiles(config, tmpDir);
    const skillCountSecond = await countDirsInDir(path.join(tmpDir, ".opencode", "skills"));
    const agentCountSecond = await countFilesInDir(path.join(tmpDir, ".opencode", "agents"));

    expect(skillCountFirst).toBe(skillCountSecond);
    expect(agentCountFirst).toBe(agentCountSecond);
    expect(skillCountFirst).toBe(20);
    expect(agentCountFirst).toBe(8);
  });
});
