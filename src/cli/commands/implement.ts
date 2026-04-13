import type { Command } from "commander";
import { implementFeature } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerImplementCommand(program: Command): void {
  program
    .command("implement")
    .description("Show the next implementation task for the active feature")
    .action(async () => {
      printOutput(await implementFeature(process.cwd()));
    });
}
