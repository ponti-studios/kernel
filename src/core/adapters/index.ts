/**
 * Command adapters index
 *
 * Re-exports all tool command adapters and creates a populated registry.
 */

export { opencodeAdapter } from "./opencode.js";
export { claudeAdapter } from "./claude.js";
export { codexAdapter } from "./codex.js";
export { githubCopilotAdapter } from "./github-copilot.js";
export { geminiAdapter } from "./gemini.js";
export { cursorAdapter } from "./cursor.js";

export { createAdapterRegistry, adapterRegistry } from "./registry.js";
export type { ToolCommandAdapter, GeneratedFile, AdapterRegistry } from "./types.js";

import { createAdapterRegistry } from "./registry.js";
import { opencodeAdapter } from "./opencode.js";
import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { githubCopilotAdapter } from "./github-copilot.js";
import { geminiAdapter } from "./gemini.js";
import { cursorAdapter } from "./cursor.js";
import type { AdapterRegistry } from "./types.js";

/**
 * Create a fully populated adapter registry with all 6 supported tools
 */
export function createPopulatedAdapterRegistry(): AdapterRegistry {
  const registry = createAdapterRegistry();

  registry.register(opencodeAdapter);
  registry.register(claudeAdapter);
  registry.register(codexAdapter);
  registry.register(githubCopilotAdapter);
  registry.register(geminiAdapter);
  registry.register(cursorAdapter);

  return registry;
}
