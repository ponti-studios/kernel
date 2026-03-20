/**
 * Init command
 *
 * Initializes spec in the current project.
 */

import type { Config } from "../../core/config/schema.js";
import { createDefaultConfig } from "../../core/config/loader.js";
import { generateFiles } from "../../core/generator/index.js";
import { detectAvailableTools } from "../../core/discovery/detector.js";

export interface InitOptions {
  tools?: string;
  profile?: string;
  delivery?: string;
  yes?: boolean;
  projectPath?: string;
}

export async function executeInit(options: InitOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();

  console.log("Initializing spec...\n");

  const availableTools = await detectAvailableTools(projectPath);

  let selectedTools: string[];

  if (options.tools) {
    if (options.tools === "all") {
      selectedTools = availableTools.length > 0 ? availableTools : [];
    } else {
      selectedTools = options.tools.split(",").map((t) => t.trim());
    }
  } else if (availableTools.length === 0) {
    console.log("No AI tools detected. Install a tool first (e.g., OpenCode, Cursor).");
    console.log("\nSpec supports:");
    console.log("  - OpenCode (.opencode/)");
    console.log("  - Cursor (.cursor/)");
    console.log("  - Claude Code (.claude/)");
    console.log("  - GitHub Copilot (.github/)");
    console.log("  - And 20+ more tools\n");
    return;
  } else if (options.yes) {
    selectedTools = availableTools;
  } else {
    console.log("Available tools:", availableTools.join(", "));
    console.log("Use --tools to specify or --yes to use all detected.");
    selectedTools = availableTools;
  }

  if (selectedTools.length === 0) {
    console.log("No tools specified. Use --tools to specify tools to configure.");
    return;
  }

  console.log(`Configured tools: ${selectedTools.join(", ")}\n`);

  const config: Config = await createDefaultConfig(projectPath, {
    tools: selectedTools as any,
    profile: (options.profile as any) || "core",
    delivery: (options.delivery as any) || "both",
  });

  console.log("Generating spec files...");
  const result = await generateFiles(config, projectPath);

  console.log(`\nGenerated ${result.generated.length} files`);

  if (result.failed.length > 0) {
    console.log(`\nFailed to generate ${result.failed.length} files:`);
    for (const { path: filePath, error } of result.failed) {
      console.log(`  - ${filePath}: ${error}`);
    }
  }

  console.log("\n✓ Spec initialized successfully!");
  console.log(`\nConfigured tools: ${selectedTools.join(", ")}`);
  console.log(`Profile: ${config.profile}`);
  console.log("\nTry running one of these commands in your AI tool:");
  console.log("  /propose");
  console.log("  /explore");
  console.log("  /plan");
}
