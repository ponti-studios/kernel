import { describe, it, expect } from 'bun:test';
import {
  opencodeAdapter,
  cursorAdapter,
  claudeAdapter,
  githubCopilotAdapter,
  continueAdapter,
  clineAdapter,
  amazonQAdapter,
  windsurfAdapter,
  augmentAdapter,
  supermavenAdapter,
  tabnineAdapter,
  codeiumAdapter,
  sourcegraphCodyAdapter,
  geminiAdapter,
  mistralAdapter,
  ollamaAdapter,
  lmStudioAdapter,
  textGenerationWebuiAdapter,
  koboldcppAdapter,
  tabbyAdapter,
  gpt4allAdapter,
  janAdapter,
  huggingfaceChatAdapter,
  phindAdapter,
  type ToolCommandAdapter,
} from '../index.js';
import type { CommandContent } from '../types.js';
import type { AgentTemplate } from '../../templates/types.js';

const allAdapters: ToolCommandAdapter[] = [
  opencodeAdapter,
  cursorAdapter,
  claudeAdapter,
  githubCopilotAdapter,
  continueAdapter,
  clineAdapter,
  amazonQAdapter,
  windsurfAdapter,
  augmentAdapter,
  supermavenAdapter,
  tabnineAdapter,
  codeiumAdapter,
  sourcegraphCodyAdapter,
  geminiAdapter,
  mistralAdapter,
  ollamaAdapter,
  lmStudioAdapter,
  textGenerationWebuiAdapter,
  koboldcppAdapter,
  tabbyAdapter,
  gpt4allAdapter,
  janAdapter,
  huggingfaceChatAdapter,
  phindAdapter,
];

const testCommandContent: CommandContent = {
  id: 'propose',
  fullId: 'jinn:propose',
  name: 'Jinn: Propose',
  description: 'Propose a new change',
  category: 'Workflow',
  tags: ['planning', 'workflow'],
  body: '# Propose a New Change\n\nStart a new change proposal.',
};

const testSkillTemplate = {
  name: 'jinn-planner',
  description: 'Planning agent',
  instructions: 'You are a planner agent.',
  license: 'MIT',
  compatibility: 'Works with jinn CLI',
  metadata: {
    author: 'jinn',
    version: '1.0.0',
    category: 'Orchestration',
    tags: ['planning'],
  },
};

describe('Adapter Registry', () => {
  it('has all 24 adapters', () => {
    expect(allAdapters).toHaveLength(24);
  });

  it('each adapter has unique toolId', () => {
    const toolIds = allAdapters.map((a) => a.toolId);
    const uniqueIds = new Set(toolIds);
    expect(uniqueIds.size).toBe(24);
  });
});

describe('OpenCode Adapter', () => {
  it('uses .opencode directory', () => {
    expect(opencodeAdapter.skillsDir).toBe('.opencode');
    expect(opencodeAdapter.getCommandPath('test')).toBe('.opencode/commands/jinn-test.md');
  });

  it('generates correct skill path', () => {
    const path = opencodeAdapter.getSkillPath('jinn-planner');
    expect(path).toBe('.opencode/skills/jinn-planner/SKILL.md');
  });

  it('formats command with frontmatter', () => {
    const result = opencodeAdapter.formatCommand(testCommandContent);
    expect(result).toContain('---');
    expect(result).toContain('description: Propose a new change');
    expect(result).toContain('# Propose a New Change');
  });

  it('formats skill with frontmatter', () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    expect(result).toContain('---');
    expect(result).toContain('name: jinn-planner');
    expect(result).toContain('generatedBy: "1.0.0"');
  });
});

describe('Cursor Adapter', () => {
  it('uses .cursor directory', () => {
    expect(cursorAdapter.skillsDir).toBe('.cursor');
    expect(cursorAdapter.getCommandPath('test')).toBe('.cursor/commands/jinn-test.md');
  });

  it('generates correct skill path', () => {
    const path = cursorAdapter.getSkillPath('jinn-planner');
    expect(path).toBe('.cursor/skills/jinn-planner/SKILL.md');
  });

  it('formats command with frontmatter', () => {
    const result = cursorAdapter.formatCommand(testCommandContent);
    expect(result).toContain('---');
    expect(result).toContain('description: Propose a new change');
  });
});

describe('Claude Adapter', () => {
  it('uses .claude directory', () => {
    expect(claudeAdapter.skillsDir).toBe('.claude');
    expect(claudeAdapter.getCommandPath('test')).toBe('.claude/commands/jinn/test.md');
  });

  it('generates correct skill path', () => {
    const path = claudeAdapter.getSkillPath('jinn-planner');
    expect(path).toBe('.claude/skills/jinn-planner/SKILL.md');
  });
});

describe('GitHub Copilot Adapter', () => {
  it('uses .github directory with prompt extension', () => {
    expect(githubCopilotAdapter.skillsDir).toBe('.github');
    expect(githubCopilotAdapter.getCommandPath('test')).toBe('.github/prompts/jinn-test.prompt.md');
  });

  it('generates correct skill path', () => {
    const path = githubCopilotAdapter.getSkillPath('jinn-planner');
    expect(path).toBe('.github/skills/jinn-planner/SKILL.md');
  });
});

describe('Continue Adapter', () => {
  it('uses .continue directory', () => {
    expect(continueAdapter.skillsDir).toBe('.continue');
  });
});

describe('Cline Adapter', () => {
  it('uses .cline directory', () => {
    expect(clineAdapter.skillsDir).toBe('.cline');
  });
});

describe('Amazon Q Adapter', () => {
  it('uses .amazonq directory', () => {
    expect(amazonQAdapter.skillsDir).toBe('.amazonq');
  });
});

describe('Windsurf Adapter', () => {
  it('uses .windsurf directory', () => {
    expect(windsurfAdapter.skillsDir).toBe('.windsurf');
  });
});

describe('Augment Adapter', () => {
  it('uses .augment directory', () => {
    expect(augmentAdapter.skillsDir).toBe('.augment');
  });
});

describe('Supermaven Adapter', () => {
  it('uses .supermaven directory', () => {
    expect(supermavenAdapter.skillsDir).toBe('.supermaven');
  });
});

describe('Tabnine Adapter', () => {
  it('uses .tabnine directory', () => {
    expect(tabnineAdapter.skillsDir).toBe('.tabnine');
  });
});

describe('Codeium Adapter', () => {
  it('uses .codeium directory', () => {
    expect(codeiumAdapter.skillsDir).toBe('.codeium');
  });
});

describe('Sourcegraph Cody Adapter', () => {
  it('uses .cody directory', () => {
    expect(sourcegraphCodyAdapter.skillsDir).toBe('.cody');
  });
});

describe('Gemini Adapter', () => {
  it('uses .gemini directory', () => {
    expect(geminiAdapter.skillsDir).toBe('.gemini');
  });
});

describe('Mistral Adapter', () => {
  it('uses .mistral directory', () => {
    expect(mistralAdapter.skillsDir).toBe('.mistral');
  });
});

describe('Ollama Adapter', () => {
  it('uses .ollama directory', () => {
    expect(ollamaAdapter.skillsDir).toBe('.ollama');
  });
});

describe('LM Studio Adapter', () => {
  it('uses .lmstudio directory', () => {
    expect(lmStudioAdapter.skillsDir).toBe('.lmstudio');
  });
});

describe('Text Generation WebUI Adapter', () => {
  it('uses .webui directory', () => {
    expect(textGenerationWebuiAdapter.skillsDir).toBe('.webui');
  });
});

describe('KoboldCpp Adapter', () => {
  it('uses .koboldcpp directory', () => {
    expect(koboldcppAdapter.skillsDir).toBe('.koboldcpp');
  });
});

describe('Tabby Adapter', () => {
  it('uses .tabby directory', () => {
    expect(tabbyAdapter.skillsDir).toBe('.tabby');
  });
});

describe('GPT4All Adapter', () => {
  it('uses .gpt4all directory', () => {
    expect(gpt4allAdapter.skillsDir).toBe('.gpt4all');
  });
});

describe('Jan Adapter', () => {
  it('uses .jan directory', () => {
    expect(janAdapter.skillsDir).toBe('.jan');
  });
});

describe('Hugging Face Chat Adapter', () => {
  it('uses .hfchat directory', () => {
    expect(huggingfaceChatAdapter.skillsDir).toBe('.hfchat');
  });
});

describe('Phind Adapter', () => {
  it('uses .phind directory', () => {
    expect(phindAdapter.skillsDir).toBe('.phind');
  });
});

// ============================================================================
// formatCommand — data-driven loop for all 24 adapters
// ============================================================================

describe('formatCommand — all adapters', () => {
  for (const adapter of allAdapters) {
    it(`${adapter.toolId}: output contains --- delimiter and description`, () => {
      const result = adapter.formatCommand(testCommandContent);
      expect(result).toContain('---');
      expect(result).toContain('Propose a new change');
      expect(result).toContain('# Propose a New Change');
    });
  }
});

// ============================================================================
// Claude adapter — detailed formatting
// ============================================================================

describe('Claude formatCommand', () => {
  it('includes name, description, category, tags fields', () => {
    const result = claudeAdapter.formatCommand(testCommandContent);
    expect(result).toContain('name:');
    expect(result).toContain('description:');
    expect(result).toContain('category:');
    expect(result).toContain('tags:');
  });

  it('includes the body after frontmatter', () => {
    const result = claudeAdapter.formatCommand(testCommandContent);
    expect(result).toContain('# Propose a New Change');
  });
});

describe('Claude formatAgent', () => {
  const testAgentTemplate: AgentTemplate = {
    name: 'plan',
    description: 'Pre-implementation planning agent',
    instructions: 'You are a planning agent.',
    license: 'MIT',
    compatibility: 'Works with all jinn workflows',
    metadata: { author: 'jinn', version: '1.0', category: 'Orchestration', tags: ['planning'] },
    defaultTools: ['read', 'search'],
  };

  it('includes name, description, tools, model fields', () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    expect(result).toContain('name:');
    expect(result).toContain('description:');
    expect(result).toContain('tools:');
    expect(result).toContain('model: sonnet');
  });

  it('maps read → Read', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: ['read'] }, '1.0.0');
    expect(result).toContain('Read');
  });

  it('maps search → Grep, Glob', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: ['search'] }, '1.0.0');
    expect(result).toContain('Grep');
    expect(result).toContain('Glob');
  });

  it('maps edit → Edit, Write', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: ['edit'] }, '1.0.0');
    expect(result).toContain('Edit');
    expect(result).toContain('Write');
  });

  it('maps web → WebSearch, WebFetch', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: ['web'] }, '1.0.0');
    expect(result).toContain('WebSearch');
    expect(result).toContain('WebFetch');
  });

  it('maps task → Bash', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: ['task'] }, '1.0.0');
    expect(result).toContain('Bash');
  });

  it('falls back to Read, Grep, Glob when defaultTools is empty', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, defaultTools: [] }, '1.0.0');
    expect(result).toContain('Read, Grep, Glob');
  });

  it('falls back to Read, Grep, Glob when defaultTools is undefined', () => {
    const { defaultTools: _, ...rest } = testAgentTemplate;
    const result = claudeAdapter.formatAgent!(rest, '1.0.0');
    expect(result).toContain('Read, Grep, Glob');
  });

  it('includes instructions in body', () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    expect(result).toContain('You are a planning agent.');
  });
});

describe('Claude getAgentPath', () => {
  it('returns .claude/agents/<name>.md', () => {
    expect(claudeAdapter.getAgentPath!('plan')).toBe('.claude/agents/plan.md');
    expect(claudeAdapter.getAgentPath!('review')).toBe('.claude/agents/review.md');
  });
});

// ============================================================================
// Cursor adapter — specific formatCommand fields
// ============================================================================

describe('Cursor formatCommand', () => {
  it('includes name: /jinn-<id> format', () => {
    const result = cursorAdapter.formatCommand(testCommandContent);
    expect(result).toContain('name: /jinn-propose');
  });

  it('includes id: jinn-<id> format', () => {
    const result = cursorAdapter.formatCommand(testCommandContent);
    expect(result).toContain('id: jinn-propose');
  });

  it('includes category field', () => {
    const result = cursorAdapter.formatCommand(testCommandContent);
    expect(result).toContain('category:');
  });

  it('includes description field', () => {
    const result = cursorAdapter.formatCommand(testCommandContent);
    expect(result).toContain('description:');
  });
});

// ============================================================================
// GitHub Copilot — command path ends in .prompt.md
// ============================================================================

describe('GitHub Copilot command path', () => {
  it('command path ends in .prompt.md', () => {
    const path = githubCopilotAdapter.getCommandPath('test');
    expect(path).toMatch(/\.prompt\.md$/);
  });

  it('command path uses prompts directory', () => {
    const path = githubCopilotAdapter.getCommandPath('test');
    expect(path).toContain('prompts');
  });
});

// ============================================================================
// Continue — command path ends in .prompt (no .md)
// ============================================================================

describe('Continue command path', () => {
  it('command path ends in .prompt', () => {
    const path = continueAdapter.getCommandPath('test');
    expect(path).toMatch(/\.prompt$/);
    expect(path).not.toMatch(/\.prompt\.md$/);
  });
});

// ============================================================================
// formatSkill — shared behavior via opencode adapter
// ============================================================================

describe('formatSkill shared behavior', () => {
  it('includes name, description, license, compatibility fields', () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    expect(result).toContain('name:');
    expect(result).toContain('description:');
    expect(result).toContain('license: MIT');
    expect(result).toContain('compatibility:');
  });

  it('includes metadata.generatedBy with version', () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    expect(result).toContain('generatedBy: "1.0.0"');
  });

  it('wraps content with --- delimiters', () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    const parts = result.split('---');
    expect(parts.length).toBeGreaterThanOrEqual(3);
  });

  it('includes instructions after second ---', () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    const afterFrontmatter = result.split('---').slice(2).join('---');
    expect(afterFrontmatter).toContain('You are a planner agent.');
  });
});

// ============================================================================
// YAML escaping edge cases (tested via claudeAdapter.formatCommand)
// ============================================================================

describe('YAML escaping edge cases', () => {
  function fmtDesc(desc: string): string {
    return claudeAdapter.formatCommand({ ...testCommandContent, description: desc });
  }

  it('double-quotes description with colon', () => {
    const result = fmtDesc('key: value');
    expect(result).toContain('description: "key: value"');
  });

  it('double-quotes description with hash', () => {
    const result = fmtDesc('has # hash');
    expect(result).toContain('"has # hash"');
  });

  it('double-quotes description with opening bracket', () => {
    const result = fmtDesc('array [item]');
    expect(result).toContain('"array [item]"');
  });

  it('double-quotes description with opening brace', () => {
    const result = fmtDesc('map {key}');
    expect(result).toContain('"map {key}"');
  });

  it('double-quotes description with leading whitespace', () => {
    const result = fmtDesc(' leading space');
    expect(result).toContain('" leading space"');
  });

  it('does not quote plain text descriptions', () => {
    const result = fmtDesc('plain text without special chars');
    expect(result).toContain('description: plain text without special chars');
    expect(result).not.toContain('"plain text');
  });
});
