import type { Command } from "commander";
import { generateTasks } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerTasksCommand(program: Command): void {
  program
    .command("tasks")
    .description("Generate tasks for the active feature")
    .action(async () => {
      printOutput(await generateTasks(process.cwd()));
    });
}
