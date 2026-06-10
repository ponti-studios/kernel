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
import { registerSyncCommand } from "./commands/sync.js";

const program = new Command();

program
  .name("kernel")
  .description("Local catalog and workflow OS for coding agents")
  .version(packageJson.version)
  .option("--json", "Emit JSON output instead of human-readable output")
  .showHelpAfterError();

registerSyncCommand(program);
registerDoctorCommand(program);
registerHostCommand(program);

export { program };
