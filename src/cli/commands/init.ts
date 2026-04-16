import type { Command } from "commander";
import { initializeKernel } from "../../core/brain/init.js";
import { printOutput } from "./output.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize the local Kernel brain and sync enabled hosts")
    .action(async () => {
      printOutput(await initializeKernel(), program.opts() as { json?: boolean });
    });
}
