import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { getDefaultAgentTemplates } from "../../../templates/catalog.js";
import { AGENT_NAMES } from "../../../templates/constants.js";
import type { Config } from "../../config/schema.js";
import { generateFiles } from "../index.js";

const defaultAgentFileNames = getDefaultAgentTemplates()
  .map((template) => `${template.name}.md`)
  .sort();

// Helpers
async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "template-integ-"));
}

async function countFilesInDir(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).length;
  } catch {
    return 0;
  }
}

async function countFilesInDirBySuffix(dir: string, suffix: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && e.name.endsWith(suffix)).length;
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
    const count = await countFilesInDirBySuffix(path.join(tmpDir, ".claude", "agents"), ".md");
    expect(count).toBe(8);
  });

  it("generates the expected agent file names under .claude/agents/", async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, ".claude", "agents");
    const files = (await fs.readdir(agentsDir)).filter((file) => file.endsWith(".md")).sort();

    expect(files).toEqual(defaultAgentFileNames);
  });

  it("agent files contain tools: field (model omitted, defaults to inherit)", async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, ".claude", "agents");
    const files = (await fs.readdir(agentsDir)).filter((file) => file.endsWith(".md"));
    const content = await readFileContent(path.join(agentsDir, files[0]));
    expect(content).toContain("tools:");
    expect(content).not.toContain("model: sonnet");
  });

  it("specific planning agent file exists at .claude/agents/kernel-plan.md", async () => {
    await generateFiles(config, tmpDir);
    const ok = await fileExists(path.join(tmpDir, ".claude", "agents", `${AGENT_NAMES.PLAN}.md`));
    expect(ok).toBe(true);
  });
});

// ============================================================================
// opencode
// ============================================================================

describe("Generator integration — opencode", () => {
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

  it("skill directories created under .opencode/skills/", async () => {
    await generateFiles(config, tmpDir);
    const count = await countDirsInDir(path.join(tmpDir, ".opencode", "skills"));
    expect(count).toBeGreaterThan(0);
  });

  it("creates agent files under .config/opencode/agents/", async () => {
    await generateFiles(config, tmpDir);
    expect(await dirExists(path.join(tmpDir, ".config", "opencode", "agents"))).toBe(true);
  });
});

// ============================================================================
// copilot
// ============================================================================

describe("Generator integration — copilot", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["copilot"],
    profile: "core",
    delivery: "both",
  };

  it("agent files land in .github/agents/ with .agent.md extension", async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, ".github", "agents");
    const ok = await dirExists(agentsDir);
    expect(ok).toBe(true);
    const files = await fs.readdir(agentsDir);
    const agentFiles = files.filter((file) => file.endsWith(".agent.md"));
    expect(agentFiles.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// pi
// ============================================================================

describe("Generator integration — pi", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: "1.0.0",
    tools: ["pi"],
    profile: "core",
    delivery: "skills",
  };

  it("skill directories created under .pi/skills/", async () => {
    await generateFiles(config, tmpDir);
    const count = await countDirsInDir(path.join(tmpDir, ".pi", "skills"));
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
      tools: ["claude"],
      profile: "core",
      delivery: "skills",
    };
    await generateFiles(config, tmpDir);

    const cmdDirExists = await dirExists(path.join(tmpDir, ".claude", "commands"));
    expect(cmdDirExists).toBe(false);

    const skillCount = await countDirsInDir(path.join(tmpDir, ".claude", "skills"));
    expect(skillCount).toBeGreaterThan(0);

    const agentDirExists = await dirExists(path.join(tmpDir, ".claude", "agents"));
    expect(agentDirExists).toBe(false);
  });

  it("delivery: 'both' — skills and agents are generated", async () => {
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
    tools: ["claude", "copilot", "opencode", "pi"],
    profile: "core",
    delivery: "both",
  };

  it("creates skills for all tools and agents only for native-agent tools", async () => {
    await generateFiles(config, tmpDir);
    expect(await dirExists(path.join(tmpDir, ".claude", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".github", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".opencode", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".pi", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".claude", "agents"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".github", "agents"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".config", "opencode", "agents"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".pi", "agents"))).toBe(false);
  });

  it("no cross-contamination between tool directories", async () => {
    await generateFiles(config, tmpDir);
    for (const toolDir of [".claude", ".github", ".opencode", ".pi"]) {
      const skillsDir = path.join(tmpDir, toolDir, "skills");
      const skills = await fs.readdir(skillsDir);
      expect(skills.length).toBeGreaterThan(0);
      for (const entry of skills) {
        const stat = await fs.stat(path.join(skillsDir, entry));
        expect(stat.isDirectory()).toBe(true);
      }
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

  it.skip("second call overwrites cleanly with same file count", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["claude"],
      profile: "core",
      delivery: "both",
    };

    await generateFiles(config, tmpDir);
    const skillCountFirst = await countDirsInDir(path.join(tmpDir, ".claude", "skills"));
    const agentCountFirst = await countFilesInDirBySuffix(
      path.join(tmpDir, ".claude", "agents"),
      ".md",
    );

    await generateFiles(config, tmpDir);
    const skillCountSecond = await countDirsInDir(path.join(tmpDir, ".claude", "skills"));
    const agentCountSecond = await countFilesInDirBySuffix(
      path.join(tmpDir, ".claude", "agents"),
      ".md",
    );

    expect(skillCountFirst).toBe(skillCountSecond);
    expect(agentCountFirst).toBe(agentCountSecond);
    expect(skillCountFirst).toBe(28);
    expect(agentCountFirst).toBe(8);
  });
});
