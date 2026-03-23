/**
 * Update command
 *
 * Updates and regenerates project files.
 */

import type { Config } from "../core/config/schema.js";

import { loadConfig } from "../core/config/loader.js";
import { generateFiles } from "../core/generator/index.js";

export interface UpdateOptions {
  force?: boolean;
  tool?: string;
  projectPath?: string;
  configRootPath?: string;
}

export async function executeUpdate(options: UpdateOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();

  console.log("Updating project files...\n");

  try {
    const loaded = await loadConfig(options.configRootPath);

    if (!loaded) {
      console.log("No kernel configuration found.");
      console.log('\nRun "kernel init" first to initialize kernel.');
      return;
    }

    const config: Config = options.tool ? { ...loaded, tools: [options.tool] as any } : loaded;

    console.log(`Tools: ${config.tools.join(", ")}`);
    console.log(`Profile: ${config.profile}`);
    console.log(`Delivery: ${config.delivery}\n`);

    const result = await generateFiles(config, projectPath);

    console.log(`Generated ${result.generated.length} files`);

    if (result.failed.length > 0) {
      console.log(`\nFailed to generate ${result.failed.length} files:`);
      for (const { path: filePath, error } of result.failed) {
        console.log(`  - ${filePath}: ${error}`);
      }
    }

    console.log("\n✓ Project files updated successfully!");
  } catch (error) {
    console.error("Error:", error);
    console.log('\nRun "kernel init" first to initialize kernel.');
  }
}
