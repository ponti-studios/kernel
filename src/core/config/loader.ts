/**
 * Configuration loader
 *
 * Load and save kernel configuration files.
 */

import * as os from "os";
import * as path from "path";
import * as yaml from "yaml";
import { fileExists, readFile, writeFile, ensureDir } from "../utils/file-system.js";
import { ConfigSchema, type Config } from "./schema.js";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILENAME, CONFIG_DIR_NAME } from "./defaults.js";

/**
 * Get the configuration directory path.
 */
export function getConfigDir(configRoot?: string): string {
  return configRoot ?? path.join(os.homedir(), CONFIG_DIR_NAME);
}

/**
 * Get the full path to the configuration file
 */
export function getConfigPath(configRoot?: string): string {
  return path.join(getConfigDir(configRoot), DEFAULT_CONFIG_FILENAME);
}

/**
 * Load configuration from file
 *
 * @param configRoot - Optional config directory override used for tests
 * @returns Configuration object or null if not found
 */
export async function loadConfig(configRoot?: string): Promise<Config | null> {
  const configPath = getConfigPath(configRoot);

  if (!(await fileExists(configPath))) {
    return null;
  }

  try {
    const content = await readFile(configPath);
    const parsed = yaml.parse(content);
    return ConfigSchema.parse(parsed);
  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${error}`);
  }
}

/**
 * Save configuration to file
 *
 * @param config - Configuration to save
 * @param configRoot - Optional config directory override used for tests
 */
export async function saveConfig(config: Config, configRoot?: string): Promise<void> {
  const configPath = getConfigPath(configRoot);
  await ensureDir(path.dirname(configPath));

  const content = yaml.stringify(config, {
    indent: 2,
    sortMapEntries: true,
  });

  await writeFile(configPath, content);
}

/**
 * Create a default configuration
 *
 * @param configRoot - Optional config directory override used for tests
 * @param overrides - Configuration overrides (must include `tools`)
 * @returns Created configuration
 */
export async function createDefaultConfig(
  configRoot: string | undefined,
  overrides: Pick<Config, "tools"> & Partial<Config>,
): Promise<Config> {
  const config: Config = {
    ...DEFAULT_CONFIG,
    ...overrides,
  };

  await saveConfig(config, configRoot);
  return config;
}

/**
 * Check if configuration exists
 *
 * @param configRoot - Optional config directory override used for tests
 * @returns True if configuration exists
 */
export async function hasConfig(configRoot?: string): Promise<boolean> {
  return fileExists(getConfigPath(configRoot));
}

/**
 * Update specific configuration values
 *
 * @param configRoot - Optional config directory override used for tests
 * @param updates - Configuration updates
 * @returns Updated configuration
 */
export async function updateConfig(
  configRoot: string | undefined,
  updates: Partial<Config>,
): Promise<Config> {
  const current = await loadConfig(configRoot);

  if (!current) {
    throw new Error("No existing configuration found. Run init first.");
  }

  const updated: Config = {
    ...current,
    ...updates,
  };

  await saveConfig(updated, configRoot);
  return updated;
}
