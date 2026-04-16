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
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerHostCommand } from "./commands/host.js";
import { registerInitCommand } from "./commands/init.js";
import { registerInitiativeCommand } from "./commands/initiative.js";
import { registerMilestoneCommand } from "./commands/milestone.js";
import { registerProjectCommand } from "./commands/project.js";
import { registerSyncCommand } from "./commands/sync.js";
import { registerWorkCommand } from "./commands/work.js";

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
  .description("Local brain and workflow OS for coding agents")
  .version(getVersion())
  .option("--json", "Emit JSON output instead of human-readable output")
  .showHelpAfterError();

registerInitCommand(program);
registerSyncCommand(program);
registerDoctorCommand(program);
registerHostCommand(program);
registerInitiativeCommand(program);
registerProjectCommand(program);
registerMilestoneCommand(program);
registerWorkCommand(program);

export { program };
