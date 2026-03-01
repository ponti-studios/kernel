import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * After `bun build` runs, the `dist` tree contains the compiled JS/JSON/etc.
 * The command template files live under `src/execution/commands/templates/`.
 * This script copies the .ts template files (not .d.ts declarations) to dist,
 * ensuring the export command can read them for prompt generation.
 */
async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const sourceTemplatesDir = join(projectRoot, "src", "execution", "commands", "templates");
  const destinationTemplatesDir = join(
    projectRoot,
    "dist",
    "src",
    "execution",
    "commands",
    "templates",
  );

  await mkdir(destinationTemplatesDir, { recursive: true });

  const entries = await readdir(sourceTemplatesDir, { withFileTypes: true });

  let copiedCount = 0;
  for (const entry of entries) {
    const fullPath = join(sourceTemplatesDir, entry.name);

    // Skip directories - we only want .ts files (not .d.ts or .test.ts)
    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      await cp(fullPath, join(destinationTemplatesDir, entry.name), { recursive: true });
      copiedCount++;
      continue;
    }

    // Only copy .ts files, skip .d.ts and .test.ts
    if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      await cp(fullPath, join(destinationTemplatesDir, entry.name));
      copiedCount++;
    }
  }

  console.log(`Copied ${copiedCount} template files to dist.`);
}

main().catch((error) => {
  console.error("Failed to copy templates:", error);
  process.exitCode = 1;
});
