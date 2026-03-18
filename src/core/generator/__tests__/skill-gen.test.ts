import { describe, it, expect } from 'bun:test';
import { generateSkillForTool, generateSkillsForTool, generateSkillsForAllTools } from '../skill-gen.js';
import { opencodeAdapter, claudeAdapter, cursorAdapter } from '../../adapters/index.js';
import type { SkillTemplate } from '../../templates/types.js';

const testSkill: SkillTemplate = {
  name: 'jinn-test-skill',
  description: 'A test skill for unit testing',
  instructions: 'You are a test skill.',
  license: 'MIT',
  compatibility: 'Requires jinn CLI.',
  metadata: {
    author: 'jinn',
    version: '1.0',
    category: 'Testing',
    tags: ['test'],
  },
};

const testSkill2: SkillTemplate = {
  name: 'jinn-second-skill',
  description: 'Another test skill',
  instructions: 'You are another skill.',
  license: 'MIT',
  compatibility: 'Requires jinn CLI.',
};

describe('generateSkillForTool', () => {
  it('path comes from adapter.getSkillPath(template.name)', () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, '1.0.0');
    expect(result.path).toBe(opencodeAdapter.getSkillPath(testSkill.name));
  });

  it('content comes from adapter.formatSkill(template, version)', () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, '1.0.0');
    expect(result.content).toBe(opencodeAdapter.formatSkill(testSkill, '1.0.0'));
  });

  it('version string appears as generatedBy in output', () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, '2.3.4');
    expect(result.content).toContain('generatedBy: "2.3.4"');
  });

  it('returns a GeneratedFile with path and content', () => {
    const result = generateSkillForTool(testSkill, opencodeAdapter, '1.0.0');
    expect(result).toHaveProperty('path');
    expect(result).toHaveProperty('content');
  });

  it('works with claude adapter', () => {
    const result = generateSkillForTool(testSkill, claudeAdapter, '1.0.0');
    expect(result.path).toBe('.claude/skills/jinn-test-skill/SKILL.md');
  });
});

describe('generateSkillsForTool', () => {
  const templates = [testSkill, testSkill2];

  it('returns one file per template', () => {
    const results = generateSkillsForTool(templates, opencodeAdapter, '1.0.0');
    expect(results).toHaveLength(templates.length);
  });

  it('each file uses the correct skill path', () => {
    const results = generateSkillsForTool(templates, opencodeAdapter, '1.0.0');
    expect(results[0].path).toBe(opencodeAdapter.getSkillPath(testSkill.name));
    expect(results[1].path).toBe(opencodeAdapter.getSkillPath(testSkill2.name));
  });

  it('returns empty array for empty templates list', () => {
    const results = generateSkillsForTool([], opencodeAdapter, '1.0.0');
    expect(results).toHaveLength(0);
  });
});

describe('generateSkillsForAllTools', () => {
  const templates = [testSkill, testSkill2];
  const adapters = [opencodeAdapter, claudeAdapter, cursorAdapter];

  it('returns templates.length × adapters.length files', () => {
    const results = generateSkillsForAllTools(templates, adapters, '1.0.0');
    expect(results).toHaveLength(templates.length * adapters.length);
  });

  it('returns empty array when adapters is empty', () => {
    const results = generateSkillsForAllTools(templates, [], '1.0.0');
    expect(results).toHaveLength(0);
  });

  it('returns empty array when templates is empty', () => {
    const results = generateSkillsForAllTools([], adapters, '1.0.0');
    expect(results).toHaveLength(0);
  });

  it('each file has a non-empty path and content', () => {
    const results = generateSkillsForAllTools(templates, adapters, '1.0.0');
    for (const file of results) {
      expect(file.path.length).toBeGreaterThan(0);
      expect(file.content.length).toBeGreaterThan(0);
    }
  });
});
