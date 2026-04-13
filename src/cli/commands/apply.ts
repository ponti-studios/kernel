import type { Command } from "commander";
import {
  getApplyInstructions,
  listChanges,
  resolveKernelProject,
} from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

async function resolveChangeName(change: string | undefined): Promise<string> {
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

export function registerApplyCommand(program: Command): void {
  program
    .command("apply [change]")
    .description("Show apply-state guidance for a change")
    .action(async (change?: string) => {
      const project = await resolveKernelProject(process.cwd());
      printOutput(await getApplyInstructions(project, await resolveChangeName(change)));
    });
}
