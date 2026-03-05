/**
 * Ghostwire detect command
 *
 * Detects available AI tools in the project with beautiful TUI.
 */

import { detectAvailableTools } from '../../core/discovery/detector.js';
import { getAllToolDefinitions } from '../../core/discovery/definitions.js';
import { colors } from '../ui/colors.js';

export interface DetectOptions {
  projectPath?: string;
}

export async function executeDetect(options: DetectOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();

  console.log(colors.cyan('\n🔍 Detecting AI Tools...\n'));

  const availableTools = await detectAvailableTools(projectPath);
  const allTools = getAllToolDefinitions();

  console.log(colors.cyan('Found ') + colors.success(String(availableTools.length)) + colors.cyan(' of ') + colors.primary(String(allTools.length)) + colors.cyan(' tools:\n'));

  const detected = allTools.filter((t) => availableTools.includes(t.id));
  const notDetected = allTools.filter((t) => !availableTools.includes(t.id));

  if (detected.length > 0) {
    console.log(colors.success('✓ Installed'));
    for (const tool of detected) {
      console.log(colors.success(`  ${colors.icon.check} ${tool.name}`) + colors.dim(` (${tool.skillsDir})`));
    }
  }

  if (notDetected.length > 0) {
    console.log(colors.dim('\n○ Not installed'));
    for (const tool of notDetected) {
      console.log(colors.dim(`  ○ ${tool.name}`) + colors.dim(` (${tool.skillsDir})`));
    }
  }

  console.log('');
}
