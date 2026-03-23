#!/usr/bin/env bun

/**
 * Command-line interface
 *
 * Harness-agnostic AI agent distribution platform.
 */

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { executeInit } from "./init.js";
import { executeUpdate } from "./update.js";
import { executeConfig } from "./config.js";
import { executeDetect } from "./detect.js";
import { executeVaultCompile } from "./vault.js";

function getVersion(): string {
  const metaPath = fileURLToPath(import.meta.url);
  let baseDir = dirname(metaPath);
  if (baseDir.startsWith("/$bunfs")) {
    baseDir = dirname(process.execPath);
  }
  try {
    const pkg = JSON.parse(readFileSync(join(baseDir, "package.json"), "utf-8"));
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

const program = new Command();

program
  .name("kernel")
  .description("AI-native development workflows for any coding assistant")
  .version(getVersion());

program
  .command("init")
  .description("Initialize the current project")
  .option("-t, --tools <tools>", 'Comma-separated list of tools (or "all")')
  .option("-p, --profile <profile>", "Profile to use (core, extended)", "core")
  .option("-d, --delivery <delivery>", "What to install (skills, both)", "both")
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("--path <path>", "Project path to initialize (default: current directory)")
  .action(async (options) => {
    await executeInit({
      tools: options.tools,
      profile: options.profile,
      delivery: options.delivery,
      yes: options.yes,
      projectPath: options.path,
    });
  });

program
  .command("update")
  .description("Update and regenerate project files")
  .option("-f, --force", "Force regeneration")
  .option("-t, --tool <tool>", "Update specific tool only")
  .option("--path <path>", "Project path (default: current directory)")
  .action(async (options) => {
    await executeUpdate({
      force: options.force,
      tool: options.tool,
      projectPath: options.path,
    });
  });

program
  .command("config")
  .description("Manage global kernel configuration")
  .argument("[action]", "Action: show, add-tool, remove-tool, set")
  .argument("[key]", "Config key (for set)")
  .argument("[value]", "Config value (for set)")
  .action(async (action, key, value) => {
    const validActions = ["show", "add-tool", "remove-tool", "set"];
    const actualAction = validActions.includes(action) ? action : "show";
    const configKey = actualAction === "set" ? key : undefined;
    const configValue = actualAction === "set" ? value : key;

    await executeConfig({
      action: actualAction as any,
      key: configKey,
      value: configValue,
    });
  });

program
  .command("detect")
  .description("Detect available AI tools in the project")
  .option("--path <path>", "Project path (default: current directory)")
  .action(async (options) => {
    await executeDetect({ projectPath: options.path });
  });

const vault = program.command("vault").description("Manage personal knowledge vault skills");

vault
  .command("compile")
  .description("Compile vault skills into each configured AI tool's native format")
  .option(
    "-v, --vault <path>",
    "Path to vault root — overrides vaultPath in ~/.kernel/config.yaml",
  )
  .option(
    "-t, --tools <tools>",
    "Comma-separated tool IDs to compile for (default: all configured tools)",
  )
  .option("--dry-run", "Show what would be written without writing any files")
  .action(async (options) => {
    await executeVaultCompile({
      vault: options.vault,
      tools: options.tools,
      dryRun: options.dryRun,
    });
  });

export { program };
