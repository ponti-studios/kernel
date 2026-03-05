import { describe, it, expect } from 'bun:test';

describe('Tool Definitions', () => {
  it('has tools defined', async () => {
    const { TOOL_DEFINITIONS } = await import('../definitions.js');
    expect(TOOL_DEFINITIONS.length).toBeGreaterThanOrEqual(24);
  });

  it('each tool has unique id', async () => {
    const { TOOL_DEFINITIONS } = await import('../definitions.js');
    const ids = TOOL_DEFINITIONS.map((t: any) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('each tool has skillsDir', async () => {
    const { TOOL_DEFINITIONS } = await import('../definitions.js');
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.skillsDir).toBeDefined();
    }
  });

  it('opencode tool exists', async () => {
    const { TOOL_DEFINITIONS } = await import('../definitions.js');
    const opencode = TOOL_DEFINITIONS.find((t: any) => t.id === 'opencode');
    expect(opencode).toBeDefined();
    expect(opencode!.skillsDir).toBe('.opencode');
  });

  it('cursor tool exists', async () => {
    const { TOOL_DEFINITIONS } = await import('../definitions.js');
    const cursor = TOOL_DEFINITIONS.find((t: any) => t.id === 'cursor');
    expect(cursor).toBeDefined();
    expect(cursor!.skillsDir).toBe('.cursor');
  });
});

describe('Adapter Registry', () => {
  it('creates registry successfully', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    expect(registry).toBeDefined();
  });

  it('has getAll method', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    expect(Array.isArray(adapters)).toBe(true);
    expect(adapters.length).toBe(24);
  });

  it('throws on unknown tool', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    expect(() => registry.get('nonexistent-tool')).toThrow();
  });

  it('has registered tool ids', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const ids = registry.getRegisteredToolIds();
    expect(ids).toContain('opencode');
    expect(ids).toContain('cursor');
    expect(ids).toContain('claude');
  });
});
