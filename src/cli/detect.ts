/**
 * Kernel detect command
 *
 * Detects available AI tools in the project.
 */

import { detectAvailableTools } from "../core/discovery/detector.js";
import { getAllToolDefinitions } from "../core/discovery/definitions.js";

export interface DetectOptions {
  projectPath?: string;
}

export async function executeDetect(options: DetectOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();

  const availableTools = await detectAvailableTools(projectPath);
  const allTools = getAllToolDefinitions();

  console.log(`\nFound ${availableTools.length} of ${allTools.length} tools:\n`);

  const detected = allTools.filter((t) => availableTools.includes(t.id));
  const notDetected = allTools.filter((t) => !availableTools.includes(t.id));

  if (detected.length > 0) {
    console.log("✓ Installed");
    for (const tool of detected) {
      console.log(`  ✓ ${tool.name} (${tool.skillsDir})`);
    }
  }

  if (notDetected.length > 0) {
    console.log("\n○ Not installed");
    for (const tool of notDetected) {
      console.log(`  ○ ${tool.name} (${tool.skillsDir})`);
    }
  }

  console.log("");
}
