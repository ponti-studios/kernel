import type { Command } from "commander";
import {
  createInitiative,
  doneInitiative,
  initiativeStatus,
  listInitiatives,
  planInitiative,
} from "../../core/initiative/index.js";
import { printOutput } from "./output.js";

export function registerInitiativeCommand(program: Command): void {
  const initiative = program
    .command("initiative")
    .description("Strategic initiative management under kernel/initiatives/");

  initiative
    .command("new <goal>")
    .description("Create a new initiative")
    .action(async (goal: string) => {
      printOutput(await createInitiative(goal), program.opts() as { json?: boolean });
    });

  initiative
    .command("plan [initiativeId]")
    .description("Refresh the plan for an initiative")
    .action(async (initiativeId?: string) => {
      printOutput(await planInitiative(initiativeId), program.opts() as { json?: boolean });
    });

  initiative
    .command("status [initiativeId]")
    .description("Show status for an initiative")
    .action(async (initiativeId?: string) => {
      printOutput(await initiativeStatus(initiativeId), program.opts() as { json?: boolean });
    });

  initiative
    .command("list")
    .description("List all initiatives")
    .action(async () => {
      printOutput(await listInitiatives(), program.opts() as { json?: boolean });
    });

  initiative
    .command("done [initiativeId]")
    .description("Mark an initiative as done")
    .action(async (initiativeId?: string) => {
      printOutput(await doneInitiative(initiativeId), program.opts() as { json?: boolean });
    });
}
