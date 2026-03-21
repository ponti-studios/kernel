/**
 * kernel vault compile
 *
 * Compiles vault skills from a personal knowledge vault into each configured
 * AI tool's native format, writing the output files into the current project.
 *
 * Usage:
 *   kernel vault compile                          # uses vaultPath from .kernel/config.yaml
 *   kernel vault compile --vault ~/path/to/vault  # explicit override
 *   kernel vault compile --tools claude,github-copilot
 *   kernel vault compile --dry-run
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

import { loadConfig } from "../core/config/loader.js";
import { createPopulatedAdapterRegistry } from "../core/adapters/index.js";
import { loadVaultSkills, compileVaultSkills } from "../core/vault/index.js";
import type { GeneratedFile } from "../core/adapters/types.js";

export interface VaultCompileCommandOptions {
  vault?: string;
  tools?: string;
  dryRun?: boolean;
}

/** Expand ~ in paths */
function expandHome(filePath: string): string {
  if (filePath.startsWith("~/") || filePath === "~") {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

async function writeFilesBatch(
  files: GeneratedFile[],
  projectPath: string,
  dryRun: boolean,
): Promise<{ written: string[]; failed: Array<{ path: string; error: string }> }> {
  const written: string[] = [];
  const failed: Array<{ path: string; error: string }> = [];

  if (dryRun) {
    return { written: files.map((f) => f.path), failed };
  }

  const dirs = [...new Set(files.map((f) => path.dirname(path.join(projectPath, f.path))))];
  await Promise.all(dirs.map((d) => fs.mkdir(d, { recursive: true })));

  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.writeFile(path.join(projectPath, file.path), file.content, "utf-8");
        written.push(file.path);
      } catch (err) {
        failed.push({ path: file.path, error: String(err) });
      }
    }),
  );

  return { written, failed };
}

export async function executeVaultCompile(options: VaultCompileCommandOptions): Promise<void> {
  const projectPath = process.cwd();
  const dryRun = options.dryRun ?? false;

  // 1. Load kernel config
  const config = await loadConfig(projectPath);
  if (!config) {
    console.error("No .kernel/config.yaml found. Run `kernel init` first.");
    process.exit(1);
  }

  // 2. Resolve vault path: CLI flag > config field
  const rawVaultPath = options.vault ?? config.vaultPath;
  if (!rawVaultPath) {
    console.error(
      "No vault path found. Either pass --vault <path> or set vaultPath in .kernel/config.yaml.",
    );
    process.exit(1);
  }
  const vaultPath = expandHome(rawVaultPath);

  // 3. Determine which tools to compile for
  const requestedTools = options.tools
    ? options.tools.split(",").map((t) => t.trim())
    : config.tools;

  const registry = createPopulatedAdapterRegistry();
  const adapters = requestedTools
    .filter((id) => {
      if (!registry.has(id)) {
        console.warn(`Unknown tool "${id}" — skipping.`);
        return false;
      }
      return true;
    })
    .map((id) => registry.get(id));

  if (adapters.length === 0) {
    console.error("No valid adapters found for the requested tools.");
    process.exit(1);
  }

  // 4. Load vault skills
  let skills;
  try {
    skills = await loadVaultSkills(vaultPath);
  } catch (err) {
    console.error(`Failed to load vault skills: ${err}`);
    process.exit(1);
  }

  if (skills.length === 0) {
    console.log("No skills found in vault.");
    return;
  }

  // 5. Compile
  const files = compileVaultSkills(skills, adapters);

  // 6. Write (or dry-run)
  const { written, failed } = await writeFilesBatch(files, projectPath, dryRun);

  // 7. Report
  console.log(`\nVault skill compilation (dry-run=${dryRun})\n`);
  console.log(`  Vault:           ${vaultPath}`);
  console.log(`  Skills loaded:   ${skills.length}`);
  console.log(`  Tools targeted:  ${adapters.map((a) => a.toolId).join(", ")}`);
  console.log(`  Files ${dryRun ? "would write" : "wrote"}: ${written.length}`);

  if (dryRun) {
    console.log("\nFiles that would be written:");
    for (const p of written) {
      console.log(`  ${p}`);
    }
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} file(s) failed to write:`);
    for (const f of failed) {
      console.error(`  ${f.path}: ${f.error}`);
    }
    process.exit(1);
  }

  if (!dryRun) {
    console.log(
      "\nDone. Run `kernel update` to regenerate kernel-native skills alongside vault skills.",
    );
  }
}
