import type { Command } from "commander";
import { archiveChange, listChanges, resolveKernelProject } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

async function resolveChange(change: string | undefined): Promise<string> {
  if (change) {
    return change;
  }
  const project = await resolveKernelProject(process.cwd());
  const changes = await listChanges(project);
  if (changes.length === 1) {
    return changes[0];
  }
  throw new Error("Change name required when multiple active changes exist.");
}

export function registerArchiveCommand(program: Command): void {
  program
    .command("archive [change]")
    .description("Archive a completed change")
    .action(async (change?: string) => {
      const project = await resolveKernelProject(process.cwd());
      printOutput(await archiveChange(project, await resolveChange(change)));
    });
}
