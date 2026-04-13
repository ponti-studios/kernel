import type { Command } from "commander";
import { createChange, resolveKernelProject } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerNewCommand(program: Command): void {
  program
    .command("new <change>")
    .description("Create a new kernel change scaffold")
    .action(async (change: string) => {
      const project = await resolveKernelProject(process.cwd(), { createIfMissing: true });
      printOutput(await createChange(project, change));
    });
}
