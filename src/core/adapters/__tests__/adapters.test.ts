import { describe, it, expect } from 'bun:test';
import {
  opencodeAdapter,
  cursorAdapter,
  claudeAdapter,
  codexAdapter,
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
  codexAdapter,
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

const testAgentTemplate: AgentTemplate = {
  name: 'plan',
  description: 'Pre-implementation planning agent',
  instructions: 'You are a planning agent.',
  license: 'MIT',
  compatibility: 'Works with all jinn workflows',
  metadata: { author: 'jinn', version: '1.0', category: 'Orchestration', tags: ['planning'] },
  defaultTools: ['read', 'search'],
  availableCommands: ['propose', 'explore'],
  availableSkills: ['jinn-git-master', 'jinn-frontend-design'],
};

describe('Adapter Registry', () => {
  it('has all 25 adapters', () => {
    expect(allAdapters).toHaveLength(25);
  });

  it('each adapter has unique toolId', () => {
    const toolIds = allAdapters.map((a) => a.toolId);
    const uniqueIds = new Set(toolIds);
    expect(uniqueIds.size).toBe(25);
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

  it('uses .opencode/agents/<name>.md path for agents', () => {
    expect(opencodeAdapter.getAgentPath!('plan')).toBe('.opencode/agents/plan.md');
  });

  it('generates YAML frontmatter with description for agents', () => {
    const result = opencodeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const frontmatter = result.split('---')[1];
    expect(frontmatter).toContain('description:');
    expect(frontmatter).toContain('Pre-implementation planning agent');
  });

  it('maps availableCommands to ## Available commands in body', () => {
    const result = opencodeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const body = result.split('---')[2];
    expect(body).toContain('## Available commands');
    expect(body).toContain('- propose');
    expect(body).toContain('- explore');
  });

  it('maps availableSkills to ## Related skills in body', () => {
    const result = opencodeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const body = result.split('---')[2];
    expect(body).toContain('## Related skills');
    expect(body).toContain('- jinn-git-master');
    expect(body).toContain('- jinn-frontend-design');
  });

  it('omits ## sections when fields are empty', () => {
    const result = opencodeAdapter.formatAgent!(
      { ...testAgentTemplate, availableCommands: [], availableSkills: [] },
      '1.0.0',
    );
    const body = result.split('---')[2];
    expect(body).not.toContain('## Available commands');
    expect(body).not.toContain('## Related skills');
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
// formatCommand — data-driven loop for all 25 adapters
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

  it('maps availableSkills to skills: YAML frontmatter', () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const frontmatter = result.split('---')[1];
    expect(frontmatter).toContain('skills:');
    expect(frontmatter).toContain('jinn-git-master');
    expect(frontmatter).toContain('jinn-frontend-design');
  });

  it('maps availableCommands to ## Available commands in body', () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const body = result.split('---')[2];
    expect(body).toContain('## Available commands');
    expect(body).toContain('- propose');
    expect(body).toContain('- explore');
  });

  it('maps availableSkills to ## Related skills in body', () => {
    const result = claudeAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const body = result.split('---')[2];
    expect(body).toContain('## Related skills');
    expect(body).toContain('- jinn-git-master');
    expect(body).toContain('- jinn-frontend-design');
  });

  it('omits skills: frontmatter when availableSkills is empty', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, availableSkills: [] }, '1.0.0');
    const frontmatter = result.split('---')[1];
    expect(frontmatter).not.toContain('skills:');
  });

  it('omits Available commands section when availableCommands is empty', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, availableCommands: [] }, '1.0.0');
    const body = result.split('---')[2];
    expect(body).not.toContain('## Available commands');
  });

  it('omits Related skills section when availableSkills is empty', () => {
    const result = claudeAdapter.formatAgent!({ ...testAgentTemplate, availableSkills: [] }, '1.0.0');
    const body = result.split('---')[2];
    expect(body).not.toContain('## Related skills');
  });
});

describe('Claude getAgentPath', () => {
  it('returns .claude/agents/<name>.md', () => {
    expect(claudeAdapter.getAgentPath!('plan')).toBe('.claude/agents/plan.md');
    expect(claudeAdapter.getAgentPath!('review')).toBe('.claude/agents/review.md');
  });
});

// ============================================================================
// Codex adapter — TOML agent format
// ============================================================================

describe('Codex formatAgent', () => {
  it('uses .codex/agents/<name>.toml path', () => {
    expect(codexAdapter.getAgentPath!('plan')).toBe('.codex/agents/plan.toml');
    expect(codexAdapter.getAgentPath!('review')).toBe('.codex/agents/review.toml');
  });

  it('generates TOML with name and description', () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    expect(result).toContain('name = "plan"');
    expect(result).toContain('description = "Pre-implementation planning agent"');
  });

  it('wraps instructions in ``` code fence as developer_instructions', () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    expect(result).toContain('```');
    expect(result).toContain('You are a planning agent.');
  });

  it('maps availableSkills to [[skills.config]] entries', () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    expect(result).toContain('[[skills.config]]');
    expect(result).toContain('.agents/skills/jinn-git-master/SKILL.md');
    expect(result).toContain('.agents/skills/jinn-frontend-design/SKILL.md');
  });

  it('maps availableCommands to ## Available commands section', () => {
    const result = codexAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    expect(result).toContain('## Available commands');
    expect(result).toContain('- propose');
    expect(result).toContain('- explore');
  });

  it('omits [[skills.config]] when availableSkills is empty', () => {
    const result = codexAdapter.formatAgent!({ ...testAgentTemplate, availableSkills: [] }, '1.0.0');
    expect(result).not.toContain('[[skills.config]]');
  });

  it('omits ## Available commands when availableCommands is empty', () => {
    const result = codexAdapter.formatAgent!({ ...testAgentTemplate, availableCommands: [] }, '1.0.0');
    expect(result).not.toContain('## Available commands');
  });
});

describe('Codex formatSkill', () => {
  it('uses .agents/skills/<name>/SKILL.md path', () => {
    expect(codexAdapter.getSkillPath('jinn-git-master')).toBe('.agents/skills/jinn-git-master/SKILL.md');
  });

  it('includes name and description in frontmatter', () => {
    const result = codexAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    expect(result).toContain('name: jinn-planner');
    expect(result).toContain('description: Planning agent');
  });

  it('includes generatedBy version', () => {
    const result = codexAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    expect(result).toContain('generatedBy: "1.0.0"');
  });
});

// ============================================================================
// GitHub Copilot adapter — .agent.md format
// ============================================================================

describe('GitHub Copilot formatAgent', () => {
  it('uses .github/agents/<name>.agent.md path', () => {
    expect(githubCopilotAdapter.getAgentPath!('plan')).toBe('.github/agents/plan.agent.md');
    expect(githubCopilotAdapter.getAgentPath!('review')).toBe('.github/agents/review.agent.md');
  });

  it('generates YAML frontmatter with name and description', () => {
    const result = githubCopilotAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const frontmatter = result.split('---')[1];
    expect(frontmatter).toContain('name: plan');
    expect(frontmatter).toContain('description:');
  });

  it('maps availableCommands to ## Available commands in body', () => {
    const result = githubCopilotAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const body = result.split('---')[2];
    expect(body).toContain('## Available commands');
    expect(body).toContain('- propose');
    expect(body).toContain('- explore');
  });

  it('maps availableSkills to ## Related skills in body', () => {
    const result = githubCopilotAdapter.formatAgent!(testAgentTemplate, '1.0.0');
    const body = result.split('---')[2];
    expect(body).toContain('## Related skills');
    expect(body).toContain('- jinn-git-master');
    expect(body).toContain('- jinn-frontend-design');
  });

  it('omits ## Available commands when availableCommands is empty', () => {
    const result = githubCopilotAdapter.formatAgent!({ ...testAgentTemplate, availableCommands: [] }, '1.0.0');
    const body = result.split('---')[2];
    expect(body).not.toContain('## Available commands');
  });

  it('omits ## Related skills when availableSkills is empty', () => {
    const result = githubCopilotAdapter.formatAgent!({ ...testAgentTemplate, availableSkills: [] }, '1.0.0');
    const body = result.split('---')[2];
    expect(body).not.toContain('## Related skills');
  });
});

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
