import { describe, it, expect } from 'bun:test';
import { generateCommandsForTool, generateCommandsForAllTools } from '../command-gen.js';
import { opencodeAdapter, claudeAdapter, cursorAdapter } from '../../adapters/index.js';
import type { CommandTemplate } from '../../templates/types.js';
import type { CommandContent } from '../../adapters/types.js';

const testTemplate: CommandTemplate = {
  name: 'Test Command',
  description: 'A test command',
  category: 'Testing',
  tags: ['test', 'example'],
  content: 'Do the test thing.',
};

describe('generateCommandsForTool', () => {
  it('path comes from adapter.getCommandPath(commandId)', () => {
    const result = generateCommandsForTool(testTemplate, 'test', opencodeAdapter, '1.0.0');
    expect(result.path).toBe(opencodeAdapter.getCommandPath('test'));
  });

  it('content comes from adapter.formatCommand', () => {
    const expected: CommandContent = {
      id: 'test',
      fullId: 'jinn:test',
      name: 'Test Command',
      description: 'A test command',
      category: 'Testing',
      tags: ['test', 'example'],
      body: 'Do the test thing.',
    };
    const result = generateCommandsForTool(testTemplate, 'test', opencodeAdapter, '1.0.0');
    expect(result.content).toBe(opencodeAdapter.formatCommand(expected));
  });

  it('sets fullId as jinn:<commandId>', () => {
    const result = generateCommandsForTool(testTemplate, 'propose', opencodeAdapter, '1.0.0');
    // fullId is jinn:propose — verify content is formed from the same CommandContent
    const content: CommandContent = {
      id: 'propose',
      fullId: 'jinn:propose',
      name: 'Test Command',
      description: 'A test command',
      category: 'Testing',
      tags: ['test', 'example'],
      body: 'Do the test thing.',
    };
    expect(result.content).toBe(opencodeAdapter.formatCommand(content));
  });

  it('returns a GeneratedFile with path and content', () => {
    const result = generateCommandsForTool(testTemplate, 'test', opencodeAdapter, '1.0.0');
    expect(result).toHaveProperty('path');
    expect(result).toHaveProperty('content');
    expect(typeof result.path).toBe('string');
    expect(typeof result.content).toBe('string');
  });

  it('works with claude adapter — path is in .claude/commands/jinn/', () => {
    const result = generateCommandsForTool(testTemplate, 'test', claudeAdapter, '1.0.0');
    expect(result.path).toBe('.claude/commands/jinn/test.md');
  });

  it('works with cursor adapter — content has /jinn-<id> name', () => {
    const result = generateCommandsForTool(testTemplate, 'test', cursorAdapter, '1.0.0');
    expect(result.content).toContain('name: /jinn-test');
    expect(result.content).toContain('id: jinn-test');
  });
});

describe('generateCommandsForAllTools', () => {
  const adapters = [opencodeAdapter, claudeAdapter, cursorAdapter];

  it('returns one file per adapter', () => {
    const results = generateCommandsForAllTools(testTemplate, 'test', adapters, '1.0.0');
    expect(results).toHaveLength(adapters.length);
  });

  it('each file has the correct path for its adapter', () => {
    const results = generateCommandsForAllTools(testTemplate, 'test', adapters, '1.0.0');
    expect(results[0].path).toBe(opencodeAdapter.getCommandPath('test'));
    expect(results[1].path).toBe(claudeAdapter.getCommandPath('test'));
    expect(results[2].path).toBe(cursorAdapter.getCommandPath('test'));
  });

  it('returns empty array for empty adapters list', () => {
    const results = generateCommandsForAllTools(testTemplate, 'test', [], '1.0.0');
    expect(results).toHaveLength(0);
  });
});
