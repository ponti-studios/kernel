import type { Command } from "commander";
import { addPackage, listEnabledPackages, removePackage } from "../../core/brain/packages.js";
import { syncKernelBrain } from "../../core/brain/sync.js";
import { printOutput } from "./output.js";

export function registerPackageCommand(program: Command): void {
  const packageCommand = program.command("package").description("Manage enabled Kernel packages");

  packageCommand
    .command("list")
    .description("List enabled packages")
    .action(async () => {
      printOutput(await listEnabledPackages());
    });

  packageCommand
    .command("add <packageId>")
    .description("Enable a built-in package and resync hosts")
    .action(async (packageId: string) => {
      const result = await addPackage(packageId);
      const sync = await syncKernelBrain();
      printOutput({
        ...result,
        syncedHosts: sync.hosts,
      });
    });

  packageCommand
    .command("remove <packageId>")
    .description("Disable a package and resync hosts")
    .action(async (packageId: string) => {
      const result = await removePackage(packageId);
      const sync = await syncKernelBrain();
      printOutput({
        ...result,
        syncedHosts: sync.hosts,
      });
    });
}
