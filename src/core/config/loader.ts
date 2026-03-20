/**
 * Configuration loader
 *
 * Load and save spec configuration files.
 */

import * as path from "path";
import * as yaml from "yaml";
import { fileExists, readFile, writeFile, ensureDir } from "../utils/file-system.js";
import { ConfigSchema, type Config } from "./schema.js";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILENAME, JINN_DIR_NAME } from "./defaults.js";

/**
 * Get the spec configuration directory path
 */
export function getConfigDir(projectPath: string): string {
  return path.join(projectPath, JINN_DIR_NAME);
}

/**
 * Get the full path to the configuration file
 */
export function getConfigPath(projectPath: string): string {
  return path.join(getConfigDir(projectPath), DEFAULT_CONFIG_FILENAME);
}

/**
 * Load configuration from file
 *
 * @param projectPath - Path to project root
 * @returns Configuration object or null if not found
 */
export async function loadConfig(projectPath: string): Promise<Config | null> {
  const configPath = getConfigPath(projectPath);

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
 * @param projectPath - Path to project root
 */
export async function saveConfig(config: Config, projectPath: string): Promise<void> {
  const configPath = getConfigPath(projectPath);
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
 * @param projectPath - Path to project root
 * @param overrides - Configuration overrides (must include `tools`)
 * @returns Created configuration
 */
export async function createDefaultConfig(
  projectPath: string,
  overrides: Pick<Config, "tools"> & Partial<Config>,
): Promise<Config> {
  const config: Config = {
    ...DEFAULT_CONFIG,
    ...overrides,
  };

  await saveConfig(config, projectPath);
  return config;
}

/**
 * Check if spec is configured in a project
 *
 * @param projectPath - Path to project root
 * @returns True if configuration exists
 */
export async function hasConfig(projectPath: string): Promise<boolean> {
  const configPath = getConfigPath(projectPath);
  return fileExists(configPath);
}

/**
 * Update specific configuration values
 *
 * @param projectPath - Path to project root
 * @param updates - Configuration updates
 * @returns Updated configuration
 */
export async function updateConfig(projectPath: string, updates: Partial<Config>): Promise<Config> {
  const current = await loadConfig(projectPath);

  if (!current) {
    throw new Error("No existing configuration found. Run init first.");
  }

  const updated: Config = {
    ...current,
    ...updates,
  };

  await saveConfig(updated, projectPath);
  return updated;
}
