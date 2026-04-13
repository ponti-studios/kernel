import type { Command } from "commander";
import { listChanges, resolveKernelProject } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerListCommand(program: Command): void {
  program
    .command("list")
    .description("List active kernel changes")
    .action(async () => {
      const project = await resolveKernelProject(process.cwd());
      printOutput({ changes: await listChanges(project) });
    });
}
