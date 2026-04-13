import type { Command } from "commander";
import {
  createFeatureBranch,
  createGitCommit,
  initializeGitRepository,
  showGitRemotes,
  validateGitRepository,
} from "../../core/workflow/index.js";
import { printOutput } from "./output.js";

export function registerGitCommand(program: Command): void {
  const git = program.command("git").description("Kernel git helpers");

  git
    .command("feature")
    .description("Create and switch to a kernel feature branch")
    .action(async () => {
      printOutput(await createFeatureBranch(process.cwd()));
    });

  git
    .command("initialize")
    .description("Initialize a git repository")
    .action(async () => {
      printOutput(await initializeGitRepository(process.cwd()));
    });

  git
    .command("remote")
    .description("Show git remotes")
    .action(async () => {
      printOutput(await showGitRemotes(process.cwd()));
    });

  git
    .command("validate")
    .description("Show git status validation output")
    .action(async () => {
      printOutput(await validateGitRepository(process.cwd()));
    });

  git
    .command("commit")
    .description("Create a git commit")
    .requiredOption("-m, --message <message>", "Commit message")
    .action(async (options: { message: string }) => {
      printOutput(await createGitCommit(options.message, process.cwd()));
    });
}
