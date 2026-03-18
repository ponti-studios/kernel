import { describe, it, expect } from 'bun:test';
import { generateAgentForTool, generateAgentsForTool, generateAgentsForAllTools } from '../agent-gen.js';
import { opencodeAdapter, claudeAdapter, cursorAdapter } from '../../adapters/index.js';
import type { AgentTemplate } from '../../templates/types.js';

const testAgent: AgentTemplate = {
  name: 'plan',
  description: 'Pre-implementation planning agent',
  instructions: 'You are a planning agent.',
  license: 'MIT',
  compatibility: 'Works with all jinn workflows',
  metadata: { author: 'jinn', version: '1.0', category: 'Orchestration', tags: ['planning'] },
  defaultTools: ['read', 'search'],
};

const testAgent2: AgentTemplate = {
  name: 'review',
  description: 'Quality review agent',
  instructions: 'You are a review agent.',
  license: 'MIT',
  compatibility: 'Works with all projects',
  metadata: { author: 'jinn', version: '1.0', category: 'Orchestration', tags: ['review'] },
  defaultTools: ['read'],
};

describe('generateAgentForTool — claude (has getAgentPath + formatAgent)', () => {
  it('uses getAgentPath for the file path', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, claudeAdapter, '1.0.0');
    expect(result.path).toBe(claudeAdapter.getAgentPath!(testAgent.name));
  });

  it('claude agents land at .claude/agents/<name>.md', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, claudeAdapter, '1.0.0');
    expect(result.path).toBe('.claude/agents/plan.md');
  });

  it('uses formatAgent for the file content', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, claudeAdapter, '1.0.0');
    expect(result.content).toBe(claudeAdapter.formatAgent!(testAgent, '1.0.0'));
  });

  it('claude agent content contains tools: and model: sonnet', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, claudeAdapter, '1.0.0');
    expect(result.content).toContain('tools:');
    expect(result.content).toContain('model: sonnet');
  });
});

describe('generateAgentForTool — opencode (no getAgentPath, falls back to getSkillPath)', () => {
  it('falls back to getSkillPath when no getAgentPath', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, opencodeAdapter, '1.0.0');
    expect(result.path).toBe(opencodeAdapter.getSkillPath(testAgent.name));
  });

  it('falls back to formatSkill when no formatAgent', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, opencodeAdapter, '1.0.0');
    expect(result.content).toBe(opencodeAdapter.formatSkill(testAgent, '1.0.0'));
  });

  it('opencode agent path is in .opencode/skills/', () => {
    const result = generateAgentForTool(testAgent, testAgent.name, opencodeAdapter, '1.0.0');
    expect(result.path).toBe('.opencode/skills/plan/SKILL.md');
  });
});

describe('generateAgentsForTool', () => {
  const templates = [testAgent, testAgent2];

  it('returns one file per template', () => {
    const results = generateAgentsForTool(templates, claudeAdapter, '1.0.0');
    expect(results).toHaveLength(templates.length);
  });

  it('each claude agent file has correct path', () => {
    const results = generateAgentsForTool(templates, claudeAdapter, '1.0.0');
    expect(results[0].path).toBe('.claude/agents/plan.md');
    expect(results[1].path).toBe('.claude/agents/review.md');
  });

  it('returns empty array for empty templates', () => {
    const results = generateAgentsForTool([], claudeAdapter, '1.0.0');
    expect(results).toHaveLength(0);
  });
});

describe('generateAgentsForAllTools', () => {
  const templates = [testAgent, testAgent2];
  const adapters = [opencodeAdapter, claudeAdapter, cursorAdapter];

  it('returns templates.length × adapters.length files', () => {
    const results = generateAgentsForAllTools(templates, adapters, '1.0.0');
    expect(results).toHaveLength(templates.length * adapters.length);
  });

  it('returns empty array when adapters is empty', () => {
    const results = generateAgentsForAllTools(templates, [], '1.0.0');
    expect(results).toHaveLength(0);
  });

  it('returns empty array when templates is empty', () => {
    const results = generateAgentsForAllTools([], adapters, '1.0.0');
    expect(results).toHaveLength(0);
  });
});
