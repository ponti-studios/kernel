import type { Command } from "commander";
import { createChecklist } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerChecklistCommand(program: Command): void {
  program
    .command("checklist")
    .description("Generate a checklist for the active feature")
    .action(async () => {
      printOutput(await createChecklist(process.cwd()));
    });
}
