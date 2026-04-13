import type { Command } from "commander";
import { specifyFeature } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerSpecifyCommand(program: Command): void {
  program
    .command("specify <featureDescription>")
    .description("Create a new feature specification")
    .action(async (featureDescription: string) => {
      printOutput(await specifyFeature(featureDescription, process.cwd()));
    });
}
