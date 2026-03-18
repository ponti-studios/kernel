import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { generateFiles } from '../index.js';
import type { Config } from '../../config/schema.js';

// Helpers
async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'jinn-integ-'));
}

async function countFilesInDir(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).length;
  } catch {
    return 0;
  }
}

async function countDirsInDir(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).length;
  } catch {
    return 0;
  }
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function readFileContent(p: string): Promise<string> {
  return fs.readFile(p, 'utf-8');
}

// ============================================================================
// opencode — delivery: 'both'
// ============================================================================

describe('Generator integration — opencode, delivery: both', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: '1.0.0',
    tools: ['opencode'],
    profile: 'core',
    delivery: 'both',
  };

  it('result has no failures', async () => {
    const result = await generateFiles(config, tmpDir);
    expect(result.failed).toHaveLength(0);
  });

  it('generates 32 command files under .opencode/commands/', async () => {
    await generateFiles(config, tmpDir);
    const count = await countFilesInDir(path.join(tmpDir, '.opencode', 'commands'));
    expect(count).toBe(32);
  });

  it('generates skill directories under .opencode/skills/', async () => {
    await generateFiles(config, tmpDir);
    // 7 skill templates
    const count = await countDirsInDir(path.join(tmpDir, '.opencode', 'skills'));
    expect(count).toBe(7);
  });

  it('generates agent files under .opencode/agents/', async () => {
    await generateFiles(config, tmpDir);
    // 10 agent templates → 10 .md files
    const agentDir = path.join(tmpDir, '.opencode', 'agents');
    const count = await countFilesInDir(agentDir);
    expect(count).toBe(10);
  });

  it('each command file starts with --- and has a description: line', async () => {
    await generateFiles(config, tmpDir);
    const cmdDir = path.join(tmpDir, '.opencode', 'commands');
    const files = await fs.readdir(cmdDir);
    expect(files.length).toBeGreaterThan(0);

    // Spot-check a few files
    for (const file of files.slice(0, 3)) {
      const content = await readFileContent(path.join(cmdDir, file));
      expect(content.startsWith('---')).toBe(true);
      expect(content).toContain('description:');
    }
  });

  it('skill SKILL.md files contain generatedBy: "1.0.0"', async () => {
    await generateFiles(config, tmpDir);
    const skillsDir = path.join(tmpDir, '.opencode', 'skills');
    const subdirs = await fs.readdir(skillsDir);
    expect(subdirs.length).toBeGreaterThan(0);

    const firstSkillFile = path.join(skillsDir, subdirs[0], 'SKILL.md');
    const content = await readFileContent(firstSkillFile);
    expect(content).toContain('generatedBy: "1.0.0"');
  });
});

// ============================================================================
// claude — delivery: 'both'
// ============================================================================

describe('Generator integration — claude, delivery: both', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: '1.0.0',
    tools: ['claude'],
    profile: 'core',
    delivery: 'both',
  };

  it('commands land in .claude/commands/jinn/ (nested jinn subdir)', async () => {
    await generateFiles(config, tmpDir);
    const ok = await dirExists(path.join(tmpDir, '.claude', 'commands', 'jinn'));
    expect(ok).toBe(true);
  });

  it('generates 32 command files under .claude/commands/jinn/', async () => {
    await generateFiles(config, tmpDir);
    const count = await countFilesInDir(path.join(tmpDir, '.claude', 'commands', 'jinn'));
    expect(count).toBe(32);
  });

  it('command files contain name:, category:, tags: fields', async () => {
    await generateFiles(config, tmpDir);
    const cmdDir = path.join(tmpDir, '.claude', 'commands', 'jinn');
    const files = await fs.readdir(cmdDir);
    const content = await readFileContent(path.join(cmdDir, files[0]));
    expect(content).toContain('name:');
    expect(content).toContain('category:');
    expect(content).toContain('tags:');
  });

  it('generates 10 agent files under .claude/agents/', async () => {
    await generateFiles(config, tmpDir);
    const count = await countFilesInDir(path.join(tmpDir, '.claude', 'agents'));
    expect(count).toBe(10);
  });

  it('agent files contain tools: and model: sonnet', async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    const files = await fs.readdir(agentsDir);
    const content = await readFileContent(path.join(agentsDir, files[0]));
    expect(content).toContain('tools:');
    expect(content).toContain('model: sonnet');
  });

  it('specific agent file exists at .claude/agents/plan.md', async () => {
    await generateFiles(config, tmpDir);
    const ok = await fileExists(path.join(tmpDir, '.claude', 'agents', 'plan.md'));
    expect(ok).toBe(true);
  });
});

// ============================================================================
// cursor
// ============================================================================

describe('Generator integration — cursor', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: '1.0.0',
    tools: ['cursor'],
    profile: 'core',
    delivery: 'commands',
  };

  it('command files contain name: /jinn-<id> and id: jinn-<id>', async () => {
    await generateFiles(config, tmpDir);
    const cmdDir = path.join(tmpDir, '.cursor', 'commands');
    const files = await fs.readdir(cmdDir);
    const content = await readFileContent(path.join(cmdDir, files[0]));
    expect(content).toMatch(/name: \/jinn-/);
    expect(content).toMatch(/id: jinn-/);
  });
});

// ============================================================================
// github-copilot
// ============================================================================

describe('Generator integration — github-copilot', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: '1.0.0',
    tools: ['github-copilot'],
    profile: 'core',
    delivery: 'commands',
  };

  it('command files land in .github/prompts/ with .prompt.md extension', async () => {
    await generateFiles(config, tmpDir);
    const promptsDir = path.join(tmpDir, '.github', 'prompts');
    const ok = await dirExists(promptsDir);
    expect(ok).toBe(true);
    const files = await fs.readdir(promptsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toMatch(/\.prompt\.md$/);
  });

  it('agent files land in .github/agents/ with .agent.md extension', async () => {
    await generateFiles(config, tmpDir);
    const agentsDir = path.join(tmpDir, '.github', 'agents');
    const ok = await dirExists(agentsDir);
    expect(ok).toBe(true);
    const files = await fs.readdir(agentsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toMatch(/\.agent\.md$/);
  });
});

// ============================================================================
// continue
// ============================================================================

describe('Generator integration — continue', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: '1.0.0',
    tools: ['continue'],
    profile: 'core',
    delivery: 'commands',
  };

  it('command files land in .continue/prompts/ with .prompt extension (not .prompt.md)', async () => {
    await generateFiles(config, tmpDir);
    const promptsDir = path.join(tmpDir, '.continue', 'prompts');
    const ok = await dirExists(promptsDir);
    expect(ok).toBe(true);
    const files = await fs.readdir(promptsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toMatch(/\.prompt$/);
    expect(files[0]).not.toMatch(/\.prompt\.md$/);
  });
});

// ============================================================================
// Delivery modes
// ============================================================================

describe('Generator integration — delivery modes', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("delivery: 'commands' — command files and agents exist, no skill files", async () => {
    const config: Config = {
      version: '1.0.0',
      tools: ['opencode'],
      profile: 'core',
      delivery: 'commands',
    };
    await generateFiles(config, tmpDir);

    const cmdCount = await countFilesInDir(path.join(tmpDir, '.opencode', 'commands'));
    expect(cmdCount).toBeGreaterThan(0);

    const skillDirExists = await dirExists(path.join(tmpDir, '.opencode', 'skills'));
    expect(skillDirExists).toBe(false);

    const agentCount = await countFilesInDir(path.join(tmpDir, '.opencode', 'agents'));
    expect(agentCount).toBeGreaterThan(0);
  });

  it("delivery: 'skills' — skill files exist, no command or agent files", async () => {
    const config: Config = {
      version: '1.0.0',
      tools: ['opencode'],
      profile: 'core',
      delivery: 'skills',
    };
    await generateFiles(config, tmpDir);

    const cmdDirExists = await dirExists(path.join(tmpDir, '.opencode', 'commands'));
    expect(cmdDirExists).toBe(false);

    const skillCount = await countDirsInDir(path.join(tmpDir, '.opencode', 'skills'));
    expect(skillCount).toBeGreaterThan(0);

    const agentDirExists = await dirExists(path.join(tmpDir, '.opencode', 'agents'));
    expect(agentDirExists).toBe(false);
  });

  it("delivery: 'both' — commands, skills, and agents all generated", async () => {
    const config: Config = {
      version: '1.0.0',
      tools: ['claude'],
      profile: 'core',
      delivery: 'both',
    };
    await generateFiles(config, tmpDir);

    const cmdCount = await countFilesInDir(path.join(tmpDir, '.claude', 'commands', 'jinn'));
    expect(cmdCount).toBeGreaterThan(0);

    const skillCount = await countDirsInDir(path.join(tmpDir, '.claude', 'skills'));
    expect(skillCount).toBeGreaterThan(0);

    const agentCount = await countFilesInDir(path.join(tmpDir, '.claude', 'agents'));
    expect(agentCount).toBeGreaterThan(0);
  });
});

// ============================================================================
// Multi-tool
// ============================================================================

describe('Generator integration — multi-tool', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const config: Config = {
    version: '1.0.0',
    tools: ['opencode', 'claude', 'cursor'],
    profile: 'core',
    delivery: 'commands',
  };

  it('creates all three tool directories with commands and agents', async () => {
    await generateFiles(config, tmpDir);
    expect(await dirExists(path.join(tmpDir, '.opencode', 'commands'))).toBe(true);
    expect(await dirExists(path.join(tmpDir, '.claude', 'commands', 'jinn'))).toBe(true);
    expect(await dirExists(path.join(tmpDir, '.cursor', 'commands'))).toBe(true);
    expect(await dirExists(path.join(tmpDir, '.opencode', 'agents'))).toBe(true);
    expect(await dirExists(path.join(tmpDir, '.claude', 'agents'))).toBe(true);
  });

  it('no cross-contamination between tool directories', async () => {
    await generateFiles(config, tmpDir);
    // Claude commands should only be in .claude, not in .opencode
    const opencodeDir = path.join(tmpDir, '.opencode', 'commands');
    const opencodeFiles = await fs.readdir(opencodeDir);
    for (const f of opencodeFiles) {
      // opencode files use .md extension with jinn- prefix
      expect(f).toMatch(/^jinn-.*\.md$/);
    }
    // Cursor commands have the same naming convention
    const cursorDir = path.join(tmpDir, '.cursor', 'commands');
    const cursorFiles = await fs.readdir(cursorDir);
    for (const f of cursorFiles) {
      expect(f).toMatch(/^jinn-.*\.md$/);
    }
  });
});

// ============================================================================
// Idempotency
// ============================================================================

describe('Generator integration — idempotency', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('second call overwrites cleanly with same file count', async () => {
    const config: Config = {
      version: '1.0.0',
      tools: ['opencode'],
      profile: 'core',
      delivery: 'commands',
    };

    await generateFiles(config, tmpDir);
    const countFirst = await countFilesInDir(path.join(tmpDir, '.opencode', 'commands'));
    const agentCountFirst = await countFilesInDir(path.join(tmpDir, '.opencode', 'agents'));

    await generateFiles(config, tmpDir);
    const countSecond = await countFilesInDir(path.join(tmpDir, '.opencode', 'commands'));
    const agentCountSecond = await countFilesInDir(path.join(tmpDir, '.opencode', 'agents'));

    expect(countFirst).toBe(countSecond);
    expect(agentCountFirst).toBe(agentCountSecond);
    expect(countFirst).toBe(32);
    expect(agentCountFirst).toBe(10);
  });
});
