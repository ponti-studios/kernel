/**
 * Adapter registry
 *
 * Central registry for managing tool adapters.
 */

import type { ToolCommandAdapter, AdapterRegistry } from "./types.js";

/**
 * Implementation of the adapter registry
 */
class AdapterRegistryImpl implements AdapterRegistry {
  private adapters: Map<string, ToolCommandAdapter>;

  constructor() {
    this.adapters = new Map();
  }

  register(adapter: ToolCommandAdapter): void {
    this.adapters.set(adapter.toolId, adapter);
  }

  get(toolId: string): ToolCommandAdapter {
    const adapter = this.adapters.get(toolId);
    if (!adapter) {
      throw new Error(`No adapter registered for tool: ${toolId}`);
    }
    return adapter;
  }

  has(toolId: string): boolean {
    return this.adapters.has(toolId);
  }

  getAll(): ToolCommandAdapter[] {
    return Array.from(this.adapters.values());
  }

  getRegisteredToolIds(): string[] {
    return Array.from(this.adapters.keys());
  }
}

/**
 * Create a new adapter registry instance
 */
export function createAdapterRegistry(): AdapterRegistry {
  return new AdapterRegistryImpl();
}
