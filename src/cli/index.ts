#!/usr/bin/env bun

/**
 * Command-line interface
 *
 * Harness-agnostic AI agent distribution platform.
 */

import { Command } from "commander";
import packageJson from "../../package.json";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerHostCommand } from "./commands/host.js";
import { registerInitCommand } from "./commands/init.js";
import { registerInitiativeCommand } from "./commands/initiative.js";
import { registerMilestoneCommand } from "./commands/milestone.js";
import { registerProjectCommand } from "./commands/project.js";
import { registerSyncCommand } from "./commands/sync.js";
import { registerWorkCommand } from "./commands/work.js";

const program = new Command();

program
  .name("kernel")
  .description("Local brain and workflow OS for coding agents")
  .version(packageJson.version)
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
