import type { Command } from "commander";
import { ensureConstitution } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerConstitutionCommand(program: Command): void {
  program
    .command("constitution")
    .description("Create or ensure the kernel constitution exists")
    .action(async () => {
      printOutput(await ensureConstitution(process.cwd()));
    });
}
