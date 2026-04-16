import type { Command } from "commander";
import {
  createMilestone,
  doneMilestone,
  listMilestones,
  milestoneStatus,
  planMilestone,
} from "../../core/milestone/index.js";
import { printOutput } from "./output.js";

export function registerMilestoneCommand(program: Command): void {
  const milestone = program
    .command("milestone")
    .description("Milestone management under kernel/milestones/");

  milestone
    .command("new <goal>")
    .description("Create a new milestone")
    .option("--project <projectId>", "Project ID")
    .action(async (goal: string, options: { project?: string }) => {
      printOutput(
        await createMilestone(goal, { projectId: options.project }),
        program.opts() as { json?: boolean },
      );
    });

  milestone
    .command("plan [milestoneId]")
    .description("Refresh the plan for a milestone")
    .action(async (milestoneId?: string) => {
      printOutput(await planMilestone(milestoneId), program.opts() as { json?: boolean });
    });

  milestone
    .command("status [milestoneId]")
    .description("Show status for a milestone")
    .action(async (milestoneId?: string) => {
      printOutput(await milestoneStatus(milestoneId), program.opts() as { json?: boolean });
    });

  milestone
    .command("list")
    .description("List all milestones")
    .action(async () => {
      printOutput(await listMilestones(), program.opts() as { json?: boolean });
    });

  milestone
    .command("done [milestoneId]")
    .description("Mark a milestone as done")
    .action(async (milestoneId?: string) => {
      printOutput(await doneMilestone(milestoneId), program.opts() as { json?: boolean });
    });
}
