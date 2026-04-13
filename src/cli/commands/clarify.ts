import type { Command } from "commander";
import { clarifyFeature } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerClarifyCommand(program: Command): void {
  program
    .command("clarify")
    .description("Create or update clarifications for the active feature")
    .action(async () => {
      printOutput(await clarifyFeature(process.cwd()));
    });
}
