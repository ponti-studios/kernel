import type { Command } from "commander";
import {
  createProject,
  doneProject,
  listProjects,
  planProject,
  projectStatus,
} from "../../core/project/index.js";
import { printOutput } from "./output.js";

export function registerProjectCommand(program: Command): void {
  const project = program
    .command("project")
    .description("Project management under kernel/projects/");

  project
    .command("new <goal>")
    .description("Create a new project")
    .option("--initiative <initiativeId>", "Initiative ID")
    .option("--target-date <date>", "Target completion date (e.g. 2025-06-30)")
    .action(async (goal: string, options: { initiative?: string; targetDate?: string }) => {
      printOutput(
        await createProject(goal, { initiativeId: options.initiative, targetDate: options.targetDate }),
        program.opts() as { json?: boolean },
      );
    });

  project
    .command("plan [projectId]")
    .description("Refresh the plan for a project")
    .action(async (projectId?: string) => {
      printOutput(await planProject(projectId), program.opts() as { json?: boolean });
    });

  project
    .command("status [projectId]")
    .description("Show status for a project")
    .action(async (projectId?: string) => {
      printOutput(await projectStatus(projectId), program.opts() as { json?: boolean });
    });

  project
    .command("list")
    .description("List all projects")
    .action(async () => {
      printOutput(await listProjects(), program.opts() as { json?: boolean });
    });

  project
    .command("done [projectId]")
    .description("Mark a project as done")
    .action(async (projectId?: string) => {
      printOutput(await doneProject(projectId), program.opts() as { json?: boolean });
    });
}
