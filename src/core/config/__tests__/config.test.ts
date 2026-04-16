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

describe("getConfigPath", () => {
  it("returns the config path for an override root", () => {
    expect(getConfigPath("/some/project")).toBe(path.join("/some/project", DEFAULT_CONFIG_FILENAME));
  });

  it("defaults to ~/.kernel/config.yaml", () => {
    expect(getConfigPath()).toBe(path.join(os.homedir(), CONFIG_DIR_NAME, DEFAULT_CONFIG_FILENAME));
  });
});

describe("config loader", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("detects whether config exists", async () => {
    expect(await hasConfig(tmpDir)).toBe(false);
    await createDefaultConfig(tmpDir, { tools: ["claude"] });
    expect(await hasConfig(tmpDir)).toBe(true);
  });

  it("creates default config with only version and tools", async () => {
    const config = await createDefaultConfig(tmpDir, { tools: ["copilot"] });
    expect(config).toEqual({ version: "1.0.0", tools: ["copilot"] });
  });

  it("roundtrips with saveConfig and loadConfig", async () => {
    const original: Config = {
      version: "1.0.0",
      tools: ["claude", "codex", "opencode"],
    };

    await saveConfig(original, tmpDir);
    const loaded = await loadConfig(tmpDir);

    expect(loaded).toEqual(original);
  });

  it("writes valid YAML", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["copilot", "pi"],
    };

    await saveConfig(config, tmpDir);
    const raw = await fs.readFile(getConfigPath(tmpDir), "utf-8");
    const parsed = yaml.parse(raw);

    expect(parsed.version).toBe("1.0.0");
    expect(parsed.tools).toEqual(["copilot", "pi"]);
    expect(parsed.profile).toBeUndefined();
    expect(parsed.delivery).toBeUndefined();
  });

  it("updates only specified fields", async () => {
    await createDefaultConfig(tmpDir, { tools: ["claude"] });
    const updated = await updateConfig(tmpDir, { tools: ["claude", "codex"] });
    expect(updated).toEqual({ version: "1.0.0", tools: ["claude", "codex"] });
  });

  it("throws on malformed YAML", async () => {
    const configPath = getConfigPath(tmpDir);
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, "invalid: yaml: content: [unclosed", "utf-8");
    await expect(loadConfig(tmpDir)).rejects.toThrow();
  });
});

describe("ConfigSchema", () => {
  it("rejects empty tools array", () => {
    expect(() => ConfigSchema.parse({ tools: [] })).toThrow();
  });

  it("rejects unknown tool id", () => {
    expect(() => ConfigSchema.parse({ tools: ["not-a-real-tool"] })).toThrow();
  });

  it("defaults version to 1.0.0", () => {
    expect(ConfigSchema.parse({ tools: ["claude"] }).version).toBe("1.0.0");
  });

  it("accepts all supported tools", () => {
    const result = ConfigSchema.parse({
      tools: ["claude", "codex", "copilot", "opencode", "pi"],
    });

    expect(result.tools).toHaveLength(5);
  });
});
