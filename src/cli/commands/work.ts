import type { Command } from "commander";
import {
  archiveWork,
  completeWorkTask,
  createWork,
  nextWorkTask,
  planWork,
  workStatus,
} from "../../core/workv2/index.js";
import { printOutput } from "./output.js";

export function registerWorkCommand(program: Command): void {
  const work = program.command("work").description("Local work management inside kernel/work/");

  work
    .command("new <goal>")
    .description("Create a new local work item")
    .action(async (goal: string) => {
      printOutput(await createWork(goal));
    });

  work
    .command("plan [workId]")
    .description("Refresh the plan and task view for a local work item")
    .action(async (workId?: string) => {
      printOutput(await planWork(workId));
    });

  work
    .command("next [workId]")
    .description("Show the next unchecked task for a local work item")
    .action(async (workId?: string) => {
      printOutput(await nextWorkTask(workId));
    });

  work
    .command("status [workId]")
    .description("Show status for a local work item")
    .action(async (workId?: string) => {
      printOutput(await workStatus(workId));
    });

  work
    .command("done <taskId>")
    .description("Mark a task complete in the active local work item")
    .option("--work <workId>", "Work id")
    .action(async (taskId: string, options: { work?: string }) => {
      printOutput(await completeWorkTask(taskId, options.work));
    });

  work
    .command("archive [workId]")
    .description("Archive a completed local work item")
    .action(async (workId?: string) => {
      printOutput(await archiveWork(workId));
    });
}
