import type { Command } from "commander";
import { analyzeFeature } from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerAnalyzeCommand(program: Command): void {
  program
    .command("analyze")
    .description("Analyze the active feature for readiness and gaps")
    .action(async () => {
      printOutput(await analyzeFeature(process.cwd()));
    });
}
