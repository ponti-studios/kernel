/**
 * Command adapters index
 *
 * Re-exports all tool command adapters and creates a populated registry.
 */

export { claudeAdapter } from "./claude.js";
export { codexAdapter } from "./codex.js";
export { githubCopilotAdapter } from "./github-copilot.js";
export { opencodeAdapter } from "./opencode.js";
export { piAdapter } from "./pi.js";

export { createAdapterRegistry } from "./registry.js";
export type { AdapterRegistry, GeneratedFile, ToolCommandAdapter } from "./types.js";

import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { githubCopilotAdapter } from "./github-copilot.js";
import { opencodeAdapter } from "./opencode.js";
import { piAdapter } from "./pi.js";
import { createAdapterRegistry } from "./registry.js";
import type { AdapterRegistry } from "./types.js";

/**
 * Create a fully populated adapter registry with all supported tools
 */
export function createPopulatedAdapterRegistry(): AdapterRegistry {
  const registry = createAdapterRegistry();

  registry.register(claudeAdapter);
  registry.register(codexAdapter);
  registry.register(githubCopilotAdapter);
  registry.register(opencodeAdapter);
  registry.register(piAdapter);

  return registry;
}
