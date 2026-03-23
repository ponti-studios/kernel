import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "cli-test-"));
}

describe("executeDetect", () => {
  let tmpDir: string;
  let logs: string[];

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    logs = [];
    spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    mock.restore();
  });

  it("reports 0 detected tools in empty dir", async () => {
    const { executeDetect } = await import("../detect.js");
    await executeDetect({ projectPath: tmpDir });
    expect(logs.some((l) => l.includes("Found 0"))).toBe(true);
  });

  it("reports detected tool when directory exists", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeDetect } = await import("../detect.js");
    await executeDetect({ projectPath: tmpDir });
    expect(logs.some((l) => l.includes("OpenCode"))).toBe(true);
  });

  it("lists uninstalled tools", async () => {
    const { executeDetect } = await import("../detect.js");
    await executeDetect({ projectPath: tmpDir });
    expect(logs.some((l) => l.includes("Not installed"))).toBe(true);
  });
});

describe("executeInit", () => {
  let tmpDir: string;
  let configRootDir: string;
  let logs: string[];

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    configRootDir = await mkTmpDir();
    logs = [];
    spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(configRootDir, { recursive: true, force: true });
    mock.restore();
  });

  it("reports no tools when dir is empty and no --tools flag", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("No AI tools detected"))).toBe(true);
  });

  it("initializes with explicit --tools flag", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("initialized successfully"))).toBe(true);
    const configExists = await fs.stat(path.join(configRootDir, "config.yaml")).then(
      () => true,
      () => false,
    );
    expect(configExists).toBe(true);
  });

  it("uses detected tools with --yes flag", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, yes: true, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("initialized successfully"))).toBe(true);
  });

  it("generates files and reports count", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({
      projectPath: tmpDir,
      tools: "opencode",
      delivery: "commands",
      configRootPath: configRootDir,
    });
    const generatedLine = logs.find((l) => l.includes("Generated"));
    expect(generatedLine).toBeDefined();
    const match = generatedLine!.match(/Generated (\d+) files/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1], 10)).toBeGreaterThan(0);
  });

  it('uses "both" delivery by default', async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    const skillsDir = await fs.stat(path.join(tmpDir, ".opencode", "skills")).then(
      () => true,
      () => false,
    );
    expect(skillsDir).toBe(true);
  });

  it("reports no tools when --tools all but none detected", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "all", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("No tools specified"))).toBe(true);
  });
});

describe("executeUpdate", () => {
  let tmpDir: string;
  let configRootDir: string;
  let logs: string[];

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    configRootDir = await mkTmpDir();
    logs = [];
    spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(configRootDir, { recursive: true, force: true });
    mock.restore();
  });

  it("reports no config when not initialized", async () => {
    const { executeUpdate } = await import("../update.js");
    await executeUpdate({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("No kernel configuration found"))).toBe(true);
  });

  it("updates successfully when config exists", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeUpdate } = await import("../update.js");
    await executeUpdate({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("updated successfully"))).toBe(true);
  });

  it("scopes to single tool with --tool flag", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({
      projectPath: tmpDir,
      tools: "opencode,cursor",
      configRootPath: configRootDir,
    });
    logs = [];

    const { executeUpdate } = await import("../update.js");
    await executeUpdate({ projectPath: tmpDir, tool: "opencode", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("opencode"))).toBe(true);
    expect(logs.some((l) => l.includes("updated successfully"))).toBe(true);
  });

  it("reports generated file count after update", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeUpdate } = await import("../update.js");
    await executeUpdate({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => /Generated \d+ files/.test(l))).toBe(true);
  });
});

describe("executeConfig", () => {
  let tmpDir: string;
  let configRootDir: string;
  let logs: string[];

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    configRootDir = await mkTmpDir();
    logs = [];
    spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(configRootDir, { recursive: true, force: true });
    mock.restore();
  });

  it("show reports no config when not initialized", async () => {
    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "show", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("No kernel configuration found"))).toBe(true);
  });

  it("show prints config content after init", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "show", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("opencode"))).toBe(true);
  });

  it("add-tool appends a new tool", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "add-tool", value: "cursor", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("Added tool: cursor"))).toBe(true);

    const { loadConfig } = await import("../../core/config/loader.js");
    const config = await loadConfig(configRootDir);
    expect(config!.tools).toContain("cursor");
  });

  it("add-tool is idempotent (reports already configured)", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "add-tool", value: "opencode", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("already configured"))).toBe(true);
  });

  it("remove-tool removes an existing tool", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({
      projectPath: tmpDir,
      tools: "opencode,cursor",
      configRootPath: configRootDir,
    });
    logs = [];

    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "remove-tool", value: "cursor", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("Removed tool: cursor"))).toBe(true);

    const { loadConfig } = await import("../../core/config/loader.js");
    const config = await loadConfig(configRootDir);
    expect(config!.tools).not.toContain("cursor");
  });

  it("remove-tool reports not found for unknown tool", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "remove-tool", value: "cursor", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("Tool not found"))).toBe(true);
  });

  it("set updates a config key", async () => {
    const { executeInit } = await import("../init.js");
    await executeInit({ projectPath: tmpDir, tools: "opencode", configRootPath: configRootDir });
    logs = [];

    const { executeConfig } = await import("../config.js");
    await executeConfig({
      action: "set",
      key: "profile",
      value: "extended",
      configRootPath: configRootDir,
    });
    expect(logs.some((l) => l.includes("Set profile = extended"))).toBe(true);
  });

  it("add-tool reports no config when not initialized", async () => {
    const { executeConfig } = await import("../config.js");
    await executeConfig({ action: "add-tool", value: "cursor", configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("No kernel configuration found"))).toBe(true);
  });
});
