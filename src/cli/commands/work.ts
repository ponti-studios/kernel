import type { Command } from "commander";
import {
  archiveWork,
  completeWorkTask,
  createWork,
  listArchivedWork,
  listWork,
  nextWorkTask,
  planWork,
  restoreWork,
  workStatus,
} from "../../core/work/index.js";
import { printOutput } from "./output.js";

export function registerWorkCommand(program: Command): void {
  const work = program.command("work").description("Local work management inside kernel/work/");

  work
    .command("new <goal>")
    .description("Create a new local work item")
    .option("--milestone <milestoneId>", "Milestone ID")
    .option("--project <projectId>", "Project ID")
    .option("--initiative <initiativeId>", "Initiative ID")
    .action(
      async (goal: string, options: { milestone?: string; project?: string; initiative?: string }) => {
        printOutput(
          await createWork(goal, {
            milestoneId: options.milestone,
            projectId: options.project,
            initiativeId: options.initiative,
          }),
          program.opts() as { json?: boolean },
        );
      },
    );

  work
    .command("plan [workId]")
    .description("Refresh the plan and task view for a local work item")
    .action(async (workId?: string) => {
      printOutput(await planWork(workId), program.opts() as { json?: boolean });
    });

  work
    .command("next [workId]")
    .description("Show the next unchecked task for a local work item")
    .action(async (workId?: string) => {
      printOutput(await nextWorkTask(workId), program.opts() as { json?: boolean });
    });

  work
    .command("status [workId]")
    .description("Show status for a local work item")
    .action(async (workId?: string) => {
      printOutput(await workStatus(workId), program.opts() as { json?: boolean });
    });

  work
    .command("done <taskId>")
    .description("Mark a task complete in the active local work item")
    .option("--work <workId>", "Work id")
    .action(async (taskId: string, options: { work?: string }) => {
      printOutput(await completeWorkTask(taskId, options.work), program.opts() as { json?: boolean });
    });

  work
    .command("list")
    .description("List local work items")
    .option("--archived", "List archived items instead of active ones")
    .action(async (options: { archived?: boolean }) => {
      if (options.archived) {
        printOutput(await listArchivedWork(), program.opts() as { json?: boolean });
      } else {
        printOutput(await listWork(), program.opts() as { json?: boolean });
      }
    });

  work
    .command("archive [workId]")
    .description("Archive a completed local work item")
    .action(async (workId?: string) => {
      printOutput(await archiveWork(workId), program.opts() as { json?: boolean });
    });

  work
    .command("restore <workId>")
    .description("Restore an archived work item to active")
    .action(async (workId: string) => {
      printOutput(await restoreWork(workId), program.opts() as { json?: boolean });
    });
}
