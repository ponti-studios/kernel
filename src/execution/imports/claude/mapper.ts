import { existsSync, readFileSync } from "fs";
import { basename, join } from "path";
import {
  loadPluginCommands,
  loadPluginSkillsAsCommands,
  loadPluginAgents,
  loadPluginMcpServers,
  loadPluginHooksConfigs,
  type LoadedPlugin,
  type PluginManifest,
  type PluginComponentsResult,
} from "../../plugin-loader";
import type { ClaudeImportOptions, ClaudeImportResult } from "./types";
import { buildNamespacedName, shouldIncludeComponent } from "./security";

function buildEmptyComponents(): PluginComponentsResult {
  return {
    commands: {},
    skills: {},
    agents: {},
    mcpServers: {},
    hooksConfigs: [],
    plugins: [],
    errors: [],
  };
}

function loadManifest(pluginRoot: string): PluginManifest | null {
  const manifestPath = join(pluginRoot, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) return null;
  try {
    const content = readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as PluginManifest;
  } catch {
    return null;
  }
}

function buildLoadedPlugin(pluginRoot: string, pluginName?: string): LoadedPlugin {
  const manifest = loadManifest(pluginRoot);
  const name = manifest?.name || pluginName || basename(pluginRoot);
  const version = manifest?.version || "local";

  const loaded: LoadedPlugin = {
    name,
    version,
    scope: "local",
    installPath: pluginRoot,
    pluginKey: `${name}@local`,
    manifest: manifest ?? undefined,
  };

  const commandsDir = join(pluginRoot, "commands");
  if (existsSync(commandsDir)) loaded.commandsDir = commandsDir;
  const agentsDir = join(pluginRoot, "agents");
  if (existsSync(agentsDir)) loaded.agentsDir = agentsDir;
  const skillsDir = join(pluginRoot, "skills");
  if (existsSync(skillsDir)) loaded.skillsDir = skillsDir;

  const hooksPath = join(pluginRoot, "hooks", "hooks.json");
  if (existsSync(hooksPath)) loaded.hooksPath = hooksPath;

  const mcpPath = join(pluginRoot, ".mcp.json");
  if (existsSync(mcpPath)) loaded.mcpPath = mcpPath;

  return loaded;
}

/**
 * Applies namespace to component names with conflict resolution
 */
function applyNamespace<T extends Record<string, unknown>>(
  components: T,
  namespace: string,
  overrides: Record<string, string> = {},
  include?: string[],
  exclude?: string[],
): { namespaced: T; warnings: string[]; skipped: number } {
  const namespaced = {} as T;
  const warnings: string[] = [];
  let skipped = 0;

  for (const [name, component] of Object.entries(components)) {
    const normalizedName = name.includes(":") ? name.slice(name.indexOf(":") + 1) : name;

    // Check include/exclude filters
    if (!shouldIncludeComponent(normalizedName, include, exclude)) {
      skipped++;
      continue;
    }

    const namespacedName = buildNamespacedName(namespace, normalizedName, overrides);

    // Check for conflicts
    if (namespacedName !== name && namespaced[namespacedName as keyof T]) {
      warnings.push(`Namespace conflict for "${name}": "${namespacedName}" already exists`);
    }

    (namespaced as Record<string, unknown>)[namespacedName] = component;
  }

  return { namespaced, warnings, skipped };
}

/**
 * Imports a Claude Code plugin from a path with security validation,
 * namespace conflict resolution, and dry-run support.
 */
export async function importClaudePluginFromPath(
  options: ClaudeImportOptions,
): Promise<ClaudeImportResult> {
  const pluginPath = options.path;
  const pluginName = options.pluginName || basename(pluginPath);
  const warnings: string[] = [];
  const errors: string[] = [];

  // Security: reject obvious traversal/null-byte patterns even before path existence checks.
  if (pluginPath.includes("..") || pluginPath.includes("\0")) {
    return {
      components: buildEmptyComponents(),
      report: {
        pluginName,
        path: pluginPath,
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: ["Security error: Path contains potentially dangerous patterns"],
      },
    };
  }
  if (pluginPath.includes("/etc/") || pluginPath.includes("\\etc\\passwd")) {
    return {
      components: buildEmptyComponents(),
      report: {
        pluginName,
        path: pluginPath,
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: ["Security error: Path targets a sensitive system location"],
      },
    };
  }

  // Validate path exists
  if (!existsSync(pluginPath)) {
    return {
      components: buildEmptyComponents(),
      report: {
        pluginName,
        path: pluginPath,
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [`Plugin path does not exist: ${pluginPath}`],
        errors: [],
      },
    };
  }

  const plugin = buildLoadedPlugin(pluginPath, options.pluginName);

  // Get configuration options
  const namespace = options.namespacePrefix || pluginName;
  const overrides = options.namespaceOverrides || {};
  const include = options.include;
  const exclude = options.exclude;
  const dryRun = options.dryRun || false;

  // Load components
  const [rawCommands, rawSkills, rawAgents, rawMcpServers, hooksConfigs] = await Promise.all([
    Promise.resolve(loadPluginCommands([plugin])),
    Promise.resolve(loadPluginSkillsAsCommands([plugin])),
    Promise.resolve(loadPluginAgents([plugin])),
    loadPluginMcpServers([plugin]),
    Promise.resolve(loadPluginHooksConfigs([plugin])),
  ]);

  // Apply namespace and filtering
  const {
    namespaced: commands,
    warnings: commandWarnings,
    skipped: commandsSkipped,
  } = applyNamespace(rawCommands, namespace, overrides, include, exclude);
  warnings.push(...commandWarnings);

  const {
    namespaced: skills,
    warnings: skillWarnings,
    skipped: skillsSkipped,
  } = applyNamespace(rawSkills, namespace, overrides, include, exclude);
  warnings.push(...skillWarnings);

  const {
    namespaced: agents,
    warnings: agentWarnings,
    skipped: agentsSkipped,
  } = applyNamespace(rawAgents, namespace, overrides, include, exclude);
  warnings.push(...agentWarnings);

  // MCP servers don't get namespaced (they have their own identity)
  const mcpServers = rawMcpServers;

  // Handle atomic mode: if any errors, don't return partial results
  if (options.atomic && errors.length > 0) {
    return {
      components: buildEmptyComponents(),
      report: {
        pluginName: plugin.name,
        path: pluginPath,
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings,
        errors,
      },
    };
  }

  // Build final components (or empty if dry-run)
  const components: PluginComponentsResult = dryRun
    ? buildEmptyComponents()
    : {
        commands,
        skills,
        agents,
        mcpServers,
        hooksConfigs,
        plugins: [plugin],
        errors: [],
      };

  // Add dry-run notice to warnings
  if (dryRun) {
    warnings.push("DRY RUN: No components were actually imported");
  }

  // Add filtering notice
  const totalSkipped = commandsSkipped + skillsSkipped + agentsSkipped;
  if (totalSkipped > 0) {
    warnings.push(`${totalSkipped} component(s) skipped due to include/exclude filters`);
  }

  // Handle strict mode after all warning generation.
  if (options.strict && warnings.length > 0) {
    return {
      components: buildEmptyComponents(),
      report: {
        pluginName: plugin.name,
        path: pluginPath,
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [
          `Strict mode: Import failed with ${warnings.length} warning(s): ${warnings.join(", ")}`,
        ],
      },
    };
  }

  return {
    components,
    report: {
      pluginName: plugin.name,
      path: pluginPath,
      converted: {
        commands: Object.keys(commands).length,
        skills: Object.keys(skills).length,
        agents: Object.keys(agents).length,
        mcps: Object.keys(mcpServers).length,
        hooks: hooksConfigs.length,
      },
      warnings,
      errors,
    },
  };
}
