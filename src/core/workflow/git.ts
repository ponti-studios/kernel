import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveKernelProject, readFeaturePointer } from "./project.js";
import type { GitCommandResult } from "./types.js";

const execFileAsync = promisify(execFile);

async function runGit(args: string[], cwd = process.cwd()): Promise<GitCommandResult> {
  const { stdout, stderr } = await execFileAsync("git", args, { cwd });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

export async function initializeGitRepository(cwd = process.cwd()): Promise<GitCommandResult> {
  return runGit(["init"], cwd);
}

export async function createFeatureBranch(cwd = process.cwd()): Promise<GitCommandResult> {
  const project = await resolveKernelProject(cwd);
  const pointer = await readFeaturePointer(project);
  if (!pointer) {
    throw new Error("No active kernel feature. Run `kernel specify <feature-description>` first.");
  }
  const slug = pointer.featureDirectory.split("/").at(-1);
  if (!slug) {
    throw new Error("Unable to derive feature branch name.");
  }
  return runGit(["checkout", "-b", `kernel/${slug}`], project.rootDir);
}

export async function validateGitRepository(cwd = process.cwd()): Promise<GitCommandResult> {
  return runGit(["status", "--short"], cwd);
}

export async function showGitRemotes(cwd = process.cwd()): Promise<GitCommandResult> {
  return runGit(["remote", "-v"], cwd);
}

export async function createGitCommit(
  message: string,
  cwd = process.cwd(),
): Promise<GitCommandResult> {
  await runGit(["add", "-A"], cwd);
  return runGit(["commit", "-m", message], cwd);
}
