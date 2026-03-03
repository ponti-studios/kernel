import * as fs from "fs";
import * as path from "path";
import { GhostwireConfigSchema, type GhostwireConfig } from "./platform/config";
import { log } from "./integration/shared/logger";
import { deepMerge } from "./integration/shared/deep-merge";
import { addConfigLoadError } from "./integration/shared/config-errors";
import { parseJsonc, detectConfigFile } from "./integration/shared/jsonc-parser";
import { getOpenCodeConfigDir } from "./platform/opencode/config-dir";

export function loadConfigFromPath(configPath: string, ctx: unknown): GhostwireConfig | null {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const rawConfig = parseJsonc<Record<string, unknown>>(content);

      const result = GhostwireConfigSchema.safeParse(rawConfig);

      if (!result.success) {
        const errorMsg = result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
        log(`Config validation error in ${configPath}:`, result.error.issues);
        addConfigLoadError({
          path: configPath,
          error: `Validation error: ${errorMsg}`,
        });
        return null;
      }

      log(`Config loaded from ${configPath}`, { agents: result.data.agents });
      return result.data;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log(`Error loading config from ${configPath}:`, err);
    addConfigLoadError({ path: configPath, error: errorMsg });
  }
  return null;
}

export function mergeConfigs(base: GhostwireConfig, override: GhostwireConfig): GhostwireConfig {
  return {
    ...base,
    ...override,
    agents: deepMerge(base.agents, override.agents),
    categories: deepMerge(base.categories, override.categories),
    disabled_agents: [
      ...new Set([...(base.disabled_agents ?? []), ...(override.disabled_agents ?? [])]),
    ],
    disabled_mcps: [...new Set([...(base.disabled_mcps ?? []), ...(override.disabled_mcps ?? [])])],
    disabled_hooks: [
      ...new Set([...(base.disabled_hooks ?? []), ...(override.disabled_hooks ?? [])]),
    ],
    disabled_commands: [
      ...new Set([...(base.disabled_commands ?? []), ...(override.disabled_commands ?? [])]),
    ],
    disabled_skills: [
      ...new Set([...(base.disabled_skills ?? []), ...(override.disabled_skills ?? [])]),
    ],
    claude_code: deepMerge(base.claude_code, override.claude_code),
  };
}

export function loadPluginConfig(directory: string, ctx: unknown): GhostwireConfig {
  // User-level config path - prefer .jsonc over .json
  const configDir = getOpenCodeConfigDir({ binary: "opencode" });
  const userBasePath = path.join(configDir, "ghostwire");
  const userDetected = detectConfigFile(userBasePath);
  const userConfigPath =
    userDetected.format !== "none" ? userDetected.path : userBasePath + ".json";

  // Project-level config path - prefer .jsonc over .json
  const projectBasePath = path.join(directory, ".opencode", "ghostwire");
  const projectDetected = detectConfigFile(projectBasePath);
  const projectConfigPath =
    projectDetected.format !== "none" ? projectDetected.path : projectBasePath + ".json";

  // Load user config first (base)
  let config: GhostwireConfig = loadConfigFromPath(userConfigPath, ctx) ?? {};

  // Override with project config
  const projectConfig = loadConfigFromPath(projectConfigPath, ctx);
  if (projectConfig) {
    config = mergeConfigs(config, projectConfig);
  }

  log("Final merged config", {
    agents: config.agents,
    disabled_agents: config.disabled_agents,
    disabled_mcps: config.disabled_mcps,
    disabled_hooks: config.disabled_hooks,
    claude_code: config.claude_code,
  });
  return config;
}
