import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * After `bun build` runs, the `dist` tree contains the compiled JS/JSON/etc.
 * The skill markdown files live under `src/skills/<skill>/SKILL.md`.
 * This script copies each skill directory that contains a SKILL.md file into the same relative path
 * under `dist/src/skills`, ensuring the published package can load them.
 */
async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const sourceSkillsDir = join(projectRoot, "src", "skills");
  const destinationSkillsDir = join(projectRoot, "dist", "src", "skills");

  await mkdir(destinationSkillsDir, { recursive: true });

  const entries = await readdir(sourceSkillsDir, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory());

  let copiedCount = 0;
  for (const dirEntry of skillDirs) {
    const skillName = dirEntry.name;
    const sourceSkillDir = join(sourceSkillsDir, skillName);
    const skillManifest = join(sourceSkillDir, "SKILL.md");

    try {
      await stat(skillManifest);
    } catch {
      // Not a skill directory; skip it.
      continue;
    }

    const destinationSkillDir = join(destinationSkillsDir, skillName);
    await mkdir(destinationSkillDir, { recursive: true });
    await cp(sourceSkillDir, destinationSkillDir, { recursive: true });
    copiedCount += 1;
  }

  console.log(`Copied ${copiedCount} skill director${copiedCount === 1 ? "y" : "ies"} to dist.`);
}

main().catch((error) => {
  console.error("Failed to copy skills:", error);
  process.exitCode = 1;
});
