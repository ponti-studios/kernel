import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

function isCompiledMode(metaPath: string): boolean {
  return metaPath.startsWith("/$bunfs") || metaPath === "/";
}

function normalizeRefsPath(refsPath: string): string {
  const normalized = normalize(refsPath);
  let stripped = normalized;
  while (stripped.startsWith("../")) {
    stripped = stripped.slice(3);
  }
  return stripped;
}

export function createTemplateReferenceReader(
  metaUrl: string,
  referenceDirectoryName: string = "references",
): (filename: string) => string {
  const metaPath = fileURLToPath(metaUrl);

  if (isCompiledMode(metaPath)) {
    const baseDir = dirname(process.execPath);
    const refsPath = normalizeRefsPath(referenceDirectoryName);
    const fullPath = join(baseDir, refsPath);
    return (filename: string) => readFileSync(join(fullPath, filename), "utf-8");
  }

  const templateDirectory = dirname(metaPath);
  return (filename: string) =>
    readFileSync(join(templateDirectory, referenceDirectoryName, filename), "utf-8");
}
