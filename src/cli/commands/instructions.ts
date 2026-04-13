import type { Command } from "commander";
import {
  getApplyInstructions,
  getArtifactInstruction,
  resolveKernelProject,
} from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerInstructionsCommand(program: Command): void {
  program
    .command("instructions <target>")
    .description("Generate workflow instructions for a change artifact or apply")
    .requiredOption("--change <name>", "Change name")
    .option("--json", "Emit JSON output")
    .action(async (target: string, options: { change: string; json?: boolean }) => {
      const project = await resolveKernelProject(process.cwd());
      if (target === "apply") {
        printOutput(await getApplyInstructions(project, options.change));
        return;
      }
      printOutput(await getArtifactInstruction(project, options.change, target));
    });
}
