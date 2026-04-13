import { dirname, join } from "node:path";
import { access } from "node:fs/promises";
import { ensureDir, fileExists, writeFile } from "../utils/file-system.js";
import { kernelTemplateFiles } from "./templates.js";
import type { FeaturePointer, KernelProject } from "./types.js";

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function findProjectRoot(startDir = process.cwd()): Promise<string> {
  let current = startDir;
  while (true) {
    if (await pathExists(join(current, ".git"))) {
      return current;
    }
    if (await fileExists(join(current, "package.json"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
}

export function buildKernelProject(rootDir: string): KernelProject {
  const kernelDir = join(rootDir, "kernel");
  const dotKernelDir = join(rootDir, ".kernel");
  return {
    rootDir,
    kernelDir,
    dotKernelDir,
    changesDir: join(kernelDir, "changes"),
    archiveDir: join(kernelDir, "changes", "archive"),
    specsDir: join(kernelDir, "specs"),
    templatesDir: join(dotKernelDir, "templates"),
    memoryDir: join(dotKernelDir, "memory"),
    hooksDir: join(dotKernelDir, "hooks"),
    featureFilePath: join(dotKernelDir, "feature.json"),
  };
}

export async function resolveKernelProject(
  startDir = process.cwd(),
  options: { createIfMissing?: boolean } = {},
): Promise<KernelProject> {
  const rootDir = await findProjectRoot(startDir);
  const project = buildKernelProject(rootDir);
  await assertSupportedLayout(project, options.createIfMissing === true);
  if (options.createIfMissing) {
    await ensureKernelLayout(project);
  }
  return project;
}

async function assertSupportedLayout(
  project: KernelProject,
  createIfMissing: boolean,
): Promise<void> {
  if (await pathExists(join(project.rootDir, "openspec"))) {
    throw new Error(
      "Unsupported legacy project layout: openspec/.specify projects are not supported.",
    );
  }
  if (await pathExists(join(project.rootDir, ".specify"))) {
    throw new Error(
      "Unsupported legacy project layout: openspec/.specify projects are not supported.",
    );
  }
  if (createIfMissing) {
    return;
  }
  if (!(await pathExists(project.kernelDir)) || !(await pathExists(project.dotKernelDir))) {
    throw new Error(
      "Kernel project not initialized. Run `kernel new <change>` or `kernel specify <feature>` first.",
    );
  }
}

export async function ensureKernelLayout(project: KernelProject): Promise<void> {
  await ensureDir(project.archiveDir);
  await ensureDir(project.specsDir);
  await ensureDir(project.templatesDir);
  await ensureDir(project.memoryDir);
  await ensureDir(project.hooksDir);

  for (const [relativePath, content] of Object.entries(kernelTemplateFiles)) {
    const target = join(project.dotKernelDir, relativePath);
    if (!(await fileExists(target))) {
      await writeFile(target, content);
    }
  }
}

export async function readFeaturePointer(project: KernelProject): Promise<FeaturePointer | null> {
  if (!(await fileExists(project.featureFilePath))) {
    return null;
  }
  return JSON.parse(await Bun.file(project.featureFilePath).text()) as FeaturePointer;
}

export async function writeFeaturePointer(
  project: KernelProject,
  featureDirectory: string,
): Promise<void> {
  const payload: FeaturePointer = { featureDirectory };
  await writeFile(project.featureFilePath, JSON.stringify(payload, null, 2));
}
