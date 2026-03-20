/**
 * Vault skill types
 *
 * A vault skill is a SKILL.md + references/ directory read from
 * a personal knowledge vault (e.g. ~/.codex/skills/<name>/).
 * The compiler transforms these into GeneratedFile[] for each platform.
 */

/**
 * A single reference file discovered in a vault skill's references/ directory.
 */
export interface VaultReference {
  /** Filename without directory, e.g. "writing-doctrine.md" */
  filename: string;
  /** Relative path as it appears in SKILL.md body, e.g. "references/writing-doctrine.md" */
  relativePath: string;
  /** Raw file content */
  content: string;
}

/**
 * A fully-loaded vault skill, ready to be compiled for target platforms.
 */
export interface VaultSkill {
  /** Skill directory name, e.g. "writer-agent" */
  name: string;
  /** Description extracted from SKILL.md frontmatter */
  description: string;
  /** Absolute path to the skill directory in the vault */
  skillDir: string;
  /** Absolute path to SKILL.md */
  skillPath: string;
  /** Parsed SKILL.md frontmatter as key-value map */
  frontmatter: Record<string, unknown>;
  /** SKILL.md body (everything after the closing --- delimiter) */
  body: string;
  /** All reference files found in references/ */
  references: VaultReference[];
}

/**
 * Options for the vault compiler.
 */
export interface VaultCompileOptions {
  /** Absolute path to vault root (the directory containing .codex/skills/) */
  vaultPath: string;
  /** Project root to write generated files into */
  outputPath: string;
  /**
   * Subset of tool IDs to compile for.
   * If omitted, uses whatever tools are in the project's .spec/config.yaml.
   */
  tools?: string[];
}
