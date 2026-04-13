import type { Command } from "commander";
import { syncKernelBrain } from "../../core/brain/sync.js";
import { printOutput } from "./output.js";

export function registerSyncCommand(program: Command): void {
  program
    .command("sync")
    .description("Sync the local Kernel brain into enabled host directories")
    .action(async () => {
      printOutput(await syncKernelBrain());
    });
}
