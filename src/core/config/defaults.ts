/**
 * Default configuration values
 */

import type { Config } from "./schema.js";

/**
 * Default values for optional config fields.
 * `tools` is required and must be supplied by the caller.
 */
export const DEFAULT_CONFIG: Omit<Config, "tools"> = {
  version: "1.0.0",
};

/**
 * Default configuration filename
 */
export const DEFAULT_CONFIG_FILENAME = "config.yaml";

/**
 * Config directory name
 */
export const CONFIG_DIR_NAME = ".kernel";

/**
 * Current configuration schema version
 */
export const CONFIG_VERSION = "1.0.0";
