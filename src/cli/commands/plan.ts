import type { Command } from "commander";
import { planFeature } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerPlanCommand(program: Command): void {
  program
    .command("plan")
    .description("Create or update the implementation plan for the active feature")
    .action(async () => {
      printOutput(await planFeature(process.cwd()));
    });
}
