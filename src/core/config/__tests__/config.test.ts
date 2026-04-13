import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as yaml from "yaml";

import {
  getConfigPath,
  hasConfig,
  createDefaultConfig,
  loadConfig,
  saveConfig,
  updateConfig,
} from "../loader.js";
import { ConfigSchema } from "../schema.js";
import { CONFIG_DIR_NAME, DEFAULT_CONFIG_FILENAME } from "../defaults.js";
import type { Config } from "../schema.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "config-test-"));
}

// ============================================================================
// getConfigPath
// ============================================================================

describe("getConfigPath", () => {
  it("returns the config path for an override root", () => {
    const result = getConfigPath("/some/project");
    expect(result).toBe(path.join("/some/project", DEFAULT_CONFIG_FILENAME));
  });

  it("always ends with config.yaml", () => {
    const result = getConfigPath("/a/b/c");
    expect(result).toMatch(/config\.yaml$/);
  });

  it("defaults to ~/.kernel/config.yaml", () => {
    const result = getConfigPath();
    expect(result).toBe(path.join(os.homedir(), CONFIG_DIR_NAME, DEFAULT_CONFIG_FILENAME));
  });
});

// ============================================================================
// hasConfig
// ============================================================================

describe("hasConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns false before any config is created", async () => {
    const result = await hasConfig(tmpDir);
    expect(result).toBe(false);
  });

  it("returns true after createDefaultConfig", async () => {
    await createDefaultConfig(tmpDir, { tools: ["claude"] });
    const result = await hasConfig(tmpDir);
    expect(result).toBe(true);
  });

  it("returns false when only legacy .spec/config.yaml exists", async () => {
    const legacyConfigPath = path.join(tmpDir, ".spec", "config.yaml");
    await fs.mkdir(path.dirname(legacyConfigPath), { recursive: true });
    await fs.writeFile(
      legacyConfigPath,
      yaml.stringify({ version: "1.0.0", tools: ["claude"] }),
      "utf-8",
    );
    const result = await hasConfig(tmpDir);
    expect(result).toBe(false);
  });
});

// ============================================================================
// createDefaultConfig
// ============================================================================

describe("createDefaultConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("writes the config file to disk", async () => {
    await createDefaultConfig(tmpDir, { tools: ["claude"] });
    const configPath = getConfigPath(tmpDir);
    const stat = await fs.stat(configPath);
    expect(stat.isFile()).toBe(true);
  });

  it("applies overrides to the returned config", async () => {
    const config = await createDefaultConfig(tmpDir, { tools: ["copilot"], profile: "extended" });
    expect(config.tools).toEqual(["copilot"]);
    expect(config.profile).toBe("extended");
  });

  it("written YAML roundtrips via Zod schema parse", async () => {
    await createDefaultConfig(tmpDir, { tools: ["claude"] });
    const configPath = getConfigPath(tmpDir);
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = yaml.parse(raw);
    const validated = ConfigSchema.parse(parsed);
    expect(validated.tools).toEqual(["claude"]);
  });
});

// ============================================================================
// loadConfig
// ============================================================================

describe("loadConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns null when config file does not exist", async () => {
    const result = await loadConfig(tmpDir);
    expect(result).toBeNull();
  });

  it("does not load legacy .spec/config.yaml", async () => {
    const legacyConfigPath = path.join(tmpDir, ".spec", "config.yaml");
    await fs.mkdir(path.dirname(legacyConfigPath), { recursive: true });
    await fs.writeFile(
      legacyConfigPath,
      yaml.stringify({ version: "1.0.0", tools: ["claude"] }),
      "utf-8",
    );
    const result = await loadConfig(tmpDir);
    expect(result).toBeNull();
  });

  it("throws on malformed YAML", async () => {
    const configPath = getConfigPath(tmpDir);
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, "invalid: yaml: content: [unclosed", "utf-8");
    await expect(loadConfig(tmpDir)).rejects.toThrow();
  });

  it("throws on schema violation (empty tools array)", async () => {
    const configPath = getConfigPath(tmpDir);
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, yaml.stringify({ version: "1.0.0", tools: [] }), "utf-8");
    await expect(loadConfig(tmpDir)).rejects.toThrow();
  });

  it("roundtrips with saveConfig", async () => {
    const original: Config = {
      version: "1.0.0",
      tools: ["claude", "claude"],
      profile: "extended",
      delivery: "both",
    };
    await saveConfig(original, tmpDir);
    const loaded = await loadConfig(tmpDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.tools).toEqual(["claude", "claude"]);
    expect(loaded!.profile).toBe("extended");
    expect(loaded!.delivery).toBe("both");
  });
});

// ============================================================================
// saveConfig
// ============================================================================

describe("saveConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("creates parent directories automatically", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["claude"],
      profile: "core",
      delivery: "both",
    };
    await saveConfig(config, tmpDir);
    const configPath = getConfigPath(tmpDir);
    const stat = await fs.stat(configPath);
    expect(stat.isFile()).toBe(true);
  });

  it("writes valid YAML with version, tools, profile, delivery", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["copilot"],
      profile: "extended",
      delivery: "both",
    };
    await saveConfig(config, tmpDir);
    const configPath = getConfigPath(tmpDir);
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = yaml.parse(raw);
    expect(parsed.version).toBe("1.0.0");
    expect(parsed.tools).toContain("copilot");
    expect(parsed.profile).toBe("extended");
    expect(parsed.delivery).toBe("both");
  });
});

// ============================================================================
// updateConfig
// ============================================================================

describe("updateConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("throws when no existing config", async () => {
    await expect(updateConfig(tmpDir, { profile: "extended" })).rejects.toThrow();
  });

  it("merges partial updates", async () => {
    await createDefaultConfig(tmpDir, { tools: ["claude"] });
    const updated = await updateConfig(tmpDir, { profile: "extended" });
    expect(updated.profile).toBe("extended");
  });

  it("preserves untouched fields", async () => {
    await createDefaultConfig(tmpDir, { tools: ["claude"], delivery: "both" });
    const updated = await updateConfig(tmpDir, { profile: "extended" });
    expect(updated.tools).toEqual(["claude"]);
    expect(updated.delivery).toBe("both");
  });
});

// ============================================================================
// ConfigSchema
// ============================================================================

describe("ConfigSchema", () => {
  it("rejects empty tools array", () => {
    expect(() => ConfigSchema.parse({ tools: [] })).toThrow();
  });

  it("rejects unknown toolId", () => {
    expect(() => ConfigSchema.parse({ tools: ["not-a-real-tool"] })).toThrow();
  });

  it("defaults version to 1.0.0", () => {
    const result = ConfigSchema.parse({ tools: ["claude"] });
    expect(result.version).toBe("1.0.0");
  });

  it("defaults profile to core", () => {
    const result = ConfigSchema.parse({ tools: ["claude"] });
    expect(result.profile).toBe("core");
  });

  it("defaults delivery to both", () => {
    const result = ConfigSchema.parse({ tools: ["claude"] });
    expect(result.delivery).toBe("both");
  });

  it("accepts all valid tool IDs", () => {
    const result = ConfigSchema.parse({
      tools: ["claude", "claude", "codex", "copilot", "opencode", "pi"],
    });
    expect(result.tools).toHaveLength(6);
  });

  it("rejects invalid profile", () => {
    expect(() => ConfigSchema.parse({ tools: ["claude"], profile: "invalid" })).toThrow();
  });

  it("rejects invalid delivery", () => {
    expect(() => ConfigSchema.parse({ tools: ["claude"], delivery: "invalid" })).toThrow();
  });

  it("rejects deprecated commands delivery mode", () => {
    expect(() => ConfigSchema.parse({ tools: ["claude"], delivery: "commands" })).toThrow();
  });
});
