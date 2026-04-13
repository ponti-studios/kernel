import type { Command } from "commander";
import { getChangeStatus, listChanges, resolveKernelProject } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Show change status")
    .option("--change <name>", "Change name")
    .option("--json", "Emit JSON output")
    .action(async (options: { change?: string; json?: boolean }) => {
      const project = await resolveKernelProject(process.cwd());
      if (options.change) {
        printOutput(await getChangeStatus(project, options.change));
        return;
      }
      const changes = await listChanges(project);
      printOutput({
        changes: await Promise.all(changes.map((change) => getChangeStatus(project, change))),
      });
    });
}
