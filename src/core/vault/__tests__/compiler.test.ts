/**
 * Unit tests for the vault compiler
 *
 * All inputs are in-memory VaultSkill objects — no file I/O.
 * Expected outputs are literal strings so failures produce exact diffs.
 */

import { describe, it, expect } from 'bun:test';
import { compileSkillForAdapter, compileVaultSkills } from '../compiler.js';
import { claudeAdapter } from '../../adapters/claude.js';
import { githubCopilotAdapter } from '../../adapters/github-copilot.js';
import { cursorAdapter } from '../../adapters/cursor.js';
import { createAdapter } from '../../adapters/base.js';
import type { VaultSkill, VaultReference } from '../types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const REF_ONE: VaultReference = {
  filename: 'voice-and-style.md',
  relativePath: 'references/voice-and-style.md',
  content: '# Voice And Style\n\nBe direct.\n',
};

const REF_TWO: VaultReference = {
  filename: 'writing-doctrine.md',
  relativePath: 'references/writing-doctrine.md',
  content: '# Writing Doctrine\n\nFind the real idea.\n',
};

function makeSkill(overrides: Partial<VaultSkill> = {}): VaultSkill {
  return {
    name: 'writer-agent',
    description: 'A writing skill',
    skillDir: '/vault/.codex/skills/writer-agent',
    skillPath: '/vault/.codex/skills/writer-agent/SKILL.md',
    frontmatter: { name: 'writer-agent', description: 'A writing skill' },
    body: [
      '# Writer Agent',
      '',
      'Use this skill for writing.',
      '',
      '## Reference Order',
      '1. Read `references/voice-and-style.md` and `references/writing-doctrine.md`.',
    ].join('\n'),
    references: [REF_ONE, REF_TWO],
    ...overrides,
  };
}

const anyAdapter = createAdapter({
  toolId: 'gemini' as any,
  toolName: 'Gemini',
  skillsDir: '.gemini',
});

// ---------------------------------------------------------------------------
// compileSkillForAdapter — file counts
// ---------------------------------------------------------------------------

describe('compileSkillForAdapter — file counts', () => {
  it('emits SKILL.md + N reference files for every platform', () => {
    // claude
    expect(compileSkillForAdapter(makeSkill(), claudeAdapter)).toHaveLength(3);
    // github-copilot
    expect(compileSkillForAdapter(makeSkill(), githubCopilotAdapter)).toHaveLength(3);
    // cursor
    expect(compileSkillForAdapter(makeSkill(), cursorAdapter)).toHaveLength(3);
    // any other platform
    expect(compileSkillForAdapter(makeSkill(), anyAdapter)).toHaveLength(3);
  });

  it('emits only SKILL.md when skill has no references, for every platform', () => {
    const skill = makeSkill({ references: [] });
    expect(compileSkillForAdapter(skill, claudeAdapter)).toHaveLength(1);
    expect(compileSkillForAdapter(skill, githubCopilotAdapter)).toHaveLength(1);
    expect(compileSkillForAdapter(skill, anyAdapter)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// compileSkillForAdapter — output paths
// ---------------------------------------------------------------------------

describe('compileSkillForAdapter — output paths', () => {
  it('writes SKILL.md to the correct claude path', () => {
    const files = compileSkillForAdapter(makeSkill(), claudeAdapter);
    expect(files.find((f) => f.path.endsWith('SKILL.md'))?.path)
      .toBe('.claude/skills/writer-agent/SKILL.md');
  });

  it('writes reference files under the claude skill directory', () => {
    const files = compileSkillForAdapter(makeSkill(), claudeAdapter);
    expect(files.find((f) => f.path.includes('voice-and-style'))?.path)
      .toBe('.claude/skills/writer-agent/references/voice-and-style.md');
  });

  it('writes SKILL.md to the correct github-copilot path', () => {
    const files = compileSkillForAdapter(makeSkill(), githubCopilotAdapter);
    expect(files.find((f) => f.path.endsWith('SKILL.md'))?.path)
      .toBe('.github/skills/writer-agent/SKILL.md');
  });

  it('writes reference files under the github-copilot skill directory', () => {
    const files = compileSkillForAdapter(makeSkill(), githubCopilotAdapter);
    expect(files.find((f) => f.path.includes('writing-doctrine'))?.path)
      .toBe('.github/skills/writer-agent/references/writing-doctrine.md');
  });

  it('writes SKILL.md to the correct cursor path', () => {
    const files = compileSkillForAdapter(makeSkill(), cursorAdapter);
    expect(files.find((f) => f.path.endsWith('SKILL.md'))?.path)
      .toBe('.cursor/skills/writer-agent/SKILL.md');
  });

  it('writes SKILL.md and references for any other platform', () => {
    const files = compileSkillForAdapter(makeSkill(), anyAdapter);
    expect(files.find((f) => f.path.endsWith('SKILL.md'))?.path)
      .toBe('.gemini/skills/writer-agent/SKILL.md');
    expect(files.find((f) => f.path.includes('voice-and-style'))?.path)
      .toBe('.gemini/skills/writer-agent/references/voice-and-style.md');
  });
});

// ---------------------------------------------------------------------------
// compileSkillForAdapter — reference file content
// ---------------------------------------------------------------------------

describe('compileSkillForAdapter — reference file content', () => {
  it('copies reference content verbatim for claude', () => {
    const files = compileSkillForAdapter(makeSkill(), claudeAdapter);
    expect(files.find((f) => f.path.includes('voice-and-style'))?.content)
      .toBe(REF_ONE.content);
  });

  it('copies reference content verbatim for any other platform', () => {
    const files = compileSkillForAdapter(makeSkill(), anyAdapter);
    expect(files.find((f) => f.path.includes('writing-doctrine'))?.content)
      .toBe(REF_TWO.content);
  });
});

// ---------------------------------------------------------------------------
// compileSkillForAdapter — reference path rewriting
// ---------------------------------------------------------------------------

describe('compileSkillForAdapter — reference path rewriting', () => {
  it('preserves relative reference paths for claude', () => {
    const skill = compileSkillForAdapter(makeSkill(), claudeAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!;
    expect(skill.content).toContain('`references/voice-and-style.md`');
    expect(skill.content).toContain('`references/writing-doctrine.md`');
    expect(skill.content).not.toContain('#file:');
  });

  it('rewrites inline reference paths to #file: for github-copilot', () => {
    const skill = compileSkillForAdapter(makeSkill(), githubCopilotAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!;
    expect(skill.content).toContain(
      '#file:.github/skills/writer-agent/references/voice-and-style.md'
    );
    expect(skill.content).toContain(
      '#file:.github/skills/writer-agent/references/writing-doctrine.md'
    );
  });

  it('appends a vault-references attachment block for github-copilot', () => {
    const skill = compileSkillForAdapter(makeSkill(), githubCopilotAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!;
    expect(skill.content).toContain('<!-- vault-references -->');
    const attachmentLines = skill.content.split('\n').filter((l) => l.startsWith('#file:'));
    expect(attachmentLines).toHaveLength(2);
    expect(attachmentLines[0]).toBe(
      '#file:.github/skills/writer-agent/references/voice-and-style.md'
    );
    expect(attachmentLines[1]).toBe(
      '#file:.github/skills/writer-agent/references/writing-doctrine.md'
    );
  });

  it('preserves relative paths for cursor', () => {
    const skill = compileSkillForAdapter(makeSkill(), cursorAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!;
    expect(skill.content).toContain('`references/voice-and-style.md`');
    expect(skill.content).not.toContain('#file:');
  });

  it('preserves relative paths for any other platform', () => {
    const skill = compileSkillForAdapter(makeSkill(), anyAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!;
    expect(skill.content).toContain('`references/voice-and-style.md`');
    expect(skill.content).not.toContain('#file:');
  });
});

// ---------------------------------------------------------------------------
// compileSkillForAdapter — frontmatter preservation
// ---------------------------------------------------------------------------

describe('compileSkillForAdapter — frontmatter preservation', () => {
  it('preserves frontmatter fields in SKILL.md output', () => {
    const content = compileSkillForAdapter(makeSkill(), claudeAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!.content;
    expect(content).toContain('name: writer-agent');
    expect(content).toContain('description: A writing skill');
  });

  it('emits no frontmatter block when frontmatter is empty', () => {
    const content = compileSkillForAdapter(makeSkill({ frontmatter: {} }), claudeAdapter)
      .find((f) => f.path.endsWith('SKILL.md'))!.content;
    expect(content.startsWith('---')).toBe(false);
    expect(content).toContain('# Writer Agent');
  });

  it('omits null and undefined frontmatter values', () => {
    const content = compileSkillForAdapter(
      makeSkill({ frontmatter: { name: 'x', nully: null, undef: undefined } }),
      claudeAdapter
    ).find((f) => f.path.endsWith('SKILL.md'))!.content;
    expect(content).toContain('name: x');
    expect(content).not.toContain('nully');
    expect(content).not.toContain('undef');
  });
});

// ---------------------------------------------------------------------------
// compileVaultSkills — cross-product
// ---------------------------------------------------------------------------

describe('compileVaultSkills', () => {
  it('returns empty array for empty skills', () => {
    expect(compileVaultSkills([], [claudeAdapter])).toHaveLength(0);
  });

  it('returns empty array for empty adapters', () => {
    expect(compileVaultSkills([makeSkill()], [])).toHaveLength(0);
  });

  it('generates files for every skill × adapter combination', () => {
    const skills = [makeSkill(), makeSkill({ name: 'design', references: [] })];
    const adapters = [claudeAdapter, anyAdapter];
    const files = compileVaultSkills(skills, adapters);
    // writer-agent on claude:  1 SKILL.md + 2 refs = 3
    // writer-agent on gemini:  1 SKILL.md + 2 refs = 3
    // design on claude:        1 SKILL.md
    // design on gemini:        1 SKILL.md
    expect(files).toHaveLength(8);
  });

  it('each adapter produces files only in its own skills directory', () => {
    const files = compileVaultSkills([makeSkill()], [claudeAdapter, githubCopilotAdapter]);
    expect(files.filter((f) => f.path.startsWith('.claude/'))).toHaveLength(3);
    expect(files.filter((f) => f.path.startsWith('.github/'))).toHaveLength(3);
    expect(files).toHaveLength(6);
  });

  it('produces no duplicate paths across adapters', () => {
    const files = compileVaultSkills(
      [makeSkill()],
      [claudeAdapter, githubCopilotAdapter, cursorAdapter]
    );
    const paths = files.map((f) => f.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
