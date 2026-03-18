/**
 * Tool detector
 *
 * Detects which AI coding assistants are installed in a project.
 */

import * as path from 'path';
import { directoryExists } from '../utils/file-system.js';
import { TOOL_DEFINITIONS } from './definitions.js';
import type { ToolId } from '../config/schema.js';

/**
 * Detect which AI tools are available in a project
 * by scanning for their configuration directories.
 *
 * @param projectPath - Path to the project root
 * @returns Array of detected tool IDs
 */
export async function detectAvailableTools(projectPath: string): Promise<ToolId[]> {
  const detected: ToolId[] = [];

  for (const tool of TOOL_DEFINITIONS) {
    if (!tool.available) continue;

    const toolDir = path.join(projectPath, tool.skillsDir);
    if (await directoryExists(toolDir)) {
      detected.push(tool.id);
    }
  }

  return detected;
}

/**
 * Check if a specific tool is available
 *
 * @param projectPath - Path to the project root
 * @param toolId - Tool identifier to check
 * @returns True if tool is available
 */
export async function isToolAvailable(projectPath: string, toolId: string): Promise<boolean> {
  const tool = TOOL_DEFINITIONS.find((t) => t.id === toolId);
  if (!tool || !tool.available) return false;

  const toolDir = path.join(projectPath, tool.skillsDir);
  return directoryExists(toolDir);
}

