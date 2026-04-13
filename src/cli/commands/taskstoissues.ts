import type { Command } from "commander";
import { taskstoissues } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerTasksToIssuesCommand(program: Command): void {
  program
    .command("taskstoissues")
    .description("Convert feature tasks into issue-ready markdown")
    .action(async () => {
      printOutput(await taskstoissues(process.cwd()));
    });
}
