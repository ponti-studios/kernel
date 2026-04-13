/**
 * Vault skill compiler
 *
 * Transforms VaultSkill[] into GeneratedFile[] for each target platform.
 *
 * Every platform gets SKILL.md + the full references/ directory copied
 * alongside. The model is smart enough to find and read the files it needs
 * as long as they are mentioned in the skill body — no inlining required.
 *
 * The only platform-specific behaviour is reference path *syntax*:
 * most tools keep relative paths as-is; GitHub Copilot rewrites them
 * to `#file:<workspace-path>` so the IDE auto-attaches them.
 */

import * as path from "path";
import type { GeneratedFile, ToolCommandAdapter } from "../adapters/types.js";
import type { VaultSkill, VaultReference } from "./types.js";

// ---------------------------------------------------------------------------
// Reference path rewriting (syntax only — not a gating condition for copying)
// ---------------------------------------------------------------------------

/**
 * Rewrite `references/filename.md` occurrences in a SKILL.md body to the
 * platform's preferred path syntax.
 *
 * Returns the body unchanged for platforms that work fine with relative paths.
 */
function rewriteReferencePaths(
  body: string,
  references: VaultReference[],
  toolId: string,
  skillOutputDir: string, // e.g. ".github/skills/writer-agent"
): string {
  if (references.length === 0) return body;

  if (toolId === "copilot") {
    // Copilot prompt files support `#file:<workspace-relative-path>` which
    // auto-attaches the file when the user loads the prompt.
    let rewritten = body;
    for (const ref of references) {
      const workspacePath = path
        .join(skillOutputDir, "references", ref.filename)
        .replace(/\\/g, "/");
      rewritten = rewritten.replaceAll(`\`${ref.relativePath}\``, `\`#file:${workspacePath}\``);
    }

    // Append an explicit #file: block so Copilot pre-loads every reference.
    const attachments = references
      .map((r) => {
        const wp = path.join(skillOutputDir, "references", r.filename).replace(/\\/g, "/");
        return `#file:${wp}`;
      })
      .join("\n");

    return `${rewritten}\n\n<!-- vault-references -->\n${attachments}`;
  }

  // All other platforms: relative paths work as-is once files are copied alongside.
  return body;
}

// ---------------------------------------------------------------------------
// SKILL.md content builder
// ---------------------------------------------------------------------------

function buildSkillContent(skill: VaultSkill, body: string): string {
  const fmLines: string[] = [];
  for (const [key, value] of Object.entries(skill.frontmatter)) {
    if (typeof value === "string") {
      fmLines.push(`${key}: ${value}`);
    } else if (value !== null && value !== undefined) {
      fmLines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }

  const frontmatterBlock = fmLines.length > 0 ? `---\n${fmLines.join("\n")}\n---\n\n` : "";

  return `${frontmatterBlock}${body}`;
}

// ---------------------------------------------------------------------------
// Compiler
// ---------------------------------------------------------------------------

/**
 * Compile a single vault skill for a single adapter.
 * Always emits SKILL.md + all reference files.
 */
export function compileSkillForAdapter(
  skill: VaultSkill,
  adapter: ToolCommandAdapter,
): GeneratedFile[] {
  const skillOutputPath = adapter.getSkillPath(skill.name);
  const skillOutputDir = path.dirname(skillOutputPath);

  const rewrittenBody = rewriteReferencePaths(
    skill.body,
    skill.references,
    adapter.toolId,
    skillOutputDir,
  );

  const files: GeneratedFile[] = [
    {
      path: skillOutputPath,
      content: buildSkillContent(skill, rewrittenBody),
    },
  ];

  for (const ref of skill.references) {
    files.push({
      path: path.join(skillOutputDir, "references", ref.filename),
      content: ref.content,
    });
  }

  return files;
}

/**
 * Compile all vault skills for all given adapters.
 */
export function compileVaultSkills(
  skills: VaultSkill[],
  adapters: ToolCommandAdapter[],
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  for (const skill of skills) {
    for (const adapter of adapters) {
      files.push(...compileSkillForAdapter(skill, adapter));
    }
  }
  return files;
}
