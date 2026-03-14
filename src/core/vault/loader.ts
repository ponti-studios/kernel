/**
 * Vault skill loader
 *
 * Scans a vault's .codex/skills/ directory, parses each skill's SKILL.md
 * (frontmatter + body) and discovers its reference files.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import type { VaultSkill, VaultReference } from './types.js';

/** Relative path inside the vault where skills live */
const SKILLS_DIR = path.join('.codex', 'skills');

/** Delimiter used by SKILL.md YAML frontmatter */
const FM_DELIMITER = '---';

/**
 * Parse a SKILL.md string into frontmatter and body.
 * Returns empty frontmatter and the full string as body if no frontmatter is found.
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  if (!content.startsWith(FM_DELIMITER)) {
    return { frontmatter: {}, body: content };
  }

  const end = content.indexOf(`\n${FM_DELIMITER}`, FM_DELIMITER.length);
  if (end === -1) {
    return { frontmatter: {}, body: content };
  }

  const raw = content.slice(FM_DELIMITER.length, end).trim();
  const body = content.slice(end + FM_DELIMITER.length + 1).trimStart();

  let frontmatter: Record<string, unknown> = {};
  try {
    frontmatter = yaml.parse(raw) ?? {};
  } catch {
    // Malformed frontmatter — treat as empty
  }

  return { frontmatter, body };
}

/**
 * Load all reference files from a skill's references/ subdirectory.
 */
async function loadReferences(skillDir: string): Promise<VaultReference[]> {
  const refsDir = path.join(skillDir, 'references');

  let entries: string[];
  try {
    const dirents = await fs.readdir(refsDir, { withFileTypes: true });
    entries = dirents
      .filter((d) => d.isFile() && d.name.endsWith('.md'))
      .map((d) => d.name)
      .sort();
  } catch {
    // references/ directory doesn't exist — fine, skill just has no references
    return [];
  }

  const refs: VaultReference[] = [];
  for (const filename of entries) {
    const filePath = path.join(refsDir, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      refs.push({
        filename,
        relativePath: `references/${filename}`,
        content,
      });
    } catch {
      // Skip unreadable files
    }
  }

  return refs;
}

/**
 * Load a single vault skill from its directory.
 * Returns null if SKILL.md is missing or unreadable.
 */
async function loadSkill(skillDir: string): Promise<VaultSkill | null> {
  const skillPath = path.join(skillDir, 'SKILL.md');

  let raw: string;
  try {
    raw = await fs.readFile(skillPath, 'utf-8');
  } catch {
    return null;
  }

  const { frontmatter, body } = parseFrontmatter(raw);
  const name = path.basename(skillDir);
  const description =
    typeof frontmatter.description === 'string'
      ? frontmatter.description
      : '';

  const references = await loadReferences(skillDir);

  return { name, description, skillDir, skillPath, frontmatter, body, references };
}

/**
 * Load all vault skills from `vaultPath/.codex/skills/`.
 *
 * @param vaultPath - Absolute path to vault root
 * @returns Array of loaded vault skills (skills with missing SKILL.md are skipped)
 */
export async function loadVaultSkills(vaultPath: string): Promise<VaultSkill[]> {
  const skillsDir = path.join(vaultPath, SKILLS_DIR);

  let dirents: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    dirents = await fs.readdir(skillsDir, { withFileTypes: true });
  } catch {
    throw new Error(`Cannot read vault skills directory: ${skillsDir}`);
  }

  const skillDirs = dirents
    .filter((d) => d.isDirectory())
    .map((d) => path.join(skillsDir, d.name));

  const results = await Promise.all(skillDirs.map(loadSkill));
  return results.filter((s): s is VaultSkill => s !== null);
}
