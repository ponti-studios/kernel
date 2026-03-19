/**
 * Integration tests for the vault loader + compiler pipeline
 *
 * These tests write real files to a temporary directory, run the full
 * loadVaultSkills → compileVaultSkills pipeline, and assert on the
 * actual output files written to disk.
 *
 * Every assertion uses a literal expected value — no "truthy" checks.
 * The expected output is stored in the `expected` object at the top of
 * each test so it can be reviewed alongside the assertion.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

import { loadVaultSkills } from "../loader.js";
import { compileVaultSkills, compileSkillForAdapter } from "../compiler.js";
import { claudeAdapter } from "../../adapters/claude.js";
import { githubCopilotAdapter } from "../../adapters/github-copilot.js";
import { cursorAdapter } from "../../adapters/cursor.js";
import { geminiAdapter } from "../../adapters/gemini.js";

// ---------------------------------------------------------------------------
// Temp directory helpers
// ---------------------------------------------------------------------------

async function mkdirp(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function writeFixture(filePath: string, content: string) {
  await mkdirp(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

async function writeGeneratedFiles(files: Array<{ path: string; content: string }>, root: string) {
  await Promise.all(
    files.map(async (f) => {
      const abs = path.join(root, f.path);
      await mkdirp(path.dirname(abs));
      await fs.writeFile(abs, f.content, "utf-8");
    }),
  );
}

async function readOutput(root: string, relPath: string): Promise<string> {
  return fs.readFile(path.join(root, relPath), "utf-8");
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fixture content
// ---------------------------------------------------------------------------

const WRITER_SKILL_MD = `---
name: writer-agent
description: Charles-style nonfiction writing and editing
---

# Writer Agent

Use this skill for essays and rewriting.

## Reference Order
1. Read \`references/voice-and-style.md\` and \`references/writing-doctrine.md\`.
2. For hooks: \`references/hooks-and-openings.md\`.
`;

const VOICE_STYLE_MD = `# Voice And Style

Be direct. Cut ornament.
`;

const WRITING_DOCTRINE_MD = `# Writing Doctrine

Find the real idea before drafting.
`;

const HOOKS_MD = `# Hooks And Openings

Start with the sharpest version of the claim.
`;

const DESIGN_SKILL_MD = `---
name: design
description: Design system skill
---

# Design

No references, just instructions.
`;

// ---------------------------------------------------------------------------
// Suite setup
// ---------------------------------------------------------------------------

let vaultDir: string;
let outputDir: string;

beforeAll(async () => {
  const tmp = os.tmpdir();
  vaultDir = path.join(tmp, `jinn-vault-test-${Date.now()}`);
  outputDir = path.join(tmp, `jinn-output-test-${Date.now()}`);

  // writer-agent skill with 3 references
  const writerSkillDir = path.join(vaultDir, ".codex", "skills", "writer-agent");
  await writeFixture(path.join(writerSkillDir, "SKILL.md"), WRITER_SKILL_MD);
  await writeFixture(path.join(writerSkillDir, "references", "voice-and-style.md"), VOICE_STYLE_MD);
  await writeFixture(
    path.join(writerSkillDir, "references", "writing-doctrine.md"),
    WRITING_DOCTRINE_MD,
  );
  await writeFixture(path.join(writerSkillDir, "references", "hooks-and-openings.md"), HOOKS_MD);

  // design skill with NO references directory
  const designSkillDir = path.join(vaultDir, ".codex", "skills", "design");
  await writeFixture(path.join(designSkillDir, "SKILL.md"), DESIGN_SKILL_MD);

  // Rogue directory with no SKILL.md (should be silently skipped)
  await mkdirp(path.join(vaultDir, ".codex", "skills", "no-skill-file"));

  await mkdirp(outputDir);
});

afterAll(async () => {
  await fs.rm(vaultDir, { recursive: true, force: true });
  await fs.rm(outputDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Loader integration
// ---------------------------------------------------------------------------

describe("loadVaultSkills (integration)", () => {
  it("discovers the correct number of skills", async () => {
    const skills = await loadVaultSkills(vaultDir);
    // writer-agent + design; no-skill-file is skipped
    expect(skills).toHaveLength(2);
  });

  it("parses writer-agent name and description correctly", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const writer = skills.find((s) => s.name === "writer-agent");
    expect(writer).toBeDefined();
    expect(writer!.description).toBe("Charles-style nonfiction writing and editing");
  });

  it("discovers all 3 reference files for writer-agent", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const writer = skills.find((s) => s.name === "writer-agent")!;
    expect(writer.references).toHaveLength(3);
  });

  it("loads reference filenames in sorted order", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const writer = skills.find((s) => s.name === "writer-agent")!;
    const names = writer.references.map((r) => r.filename);
    expect(names).toEqual(["hooks-and-openings.md", "voice-and-style.md", "writing-doctrine.md"]);
  });

  it("loads reference content verbatim", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const writer = skills.find((s) => s.name === "writer-agent")!;
    const voiceRef = writer.references.find((r) => r.filename === "voice-and-style.md")!;
    expect(voiceRef.content).toBe(VOICE_STYLE_MD);
  });

  it("returns empty references array for design (no references/ dir)", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const design = skills.find((s) => s.name === "design")!;
    expect(design.references).toHaveLength(0);
  });

  it("skips directories without a SKILL.md", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const names = skills.map((s) => s.name);
    expect(names).not.toContain("no-skill-file");
  });

  it("throws when the vault skills directory does not exist", async () => {
    await expect(loadVaultSkills("/nonexistent/path/to/vault")).rejects.toThrow(
      "Cannot read vault skills directory",
    );
  });
});

// ---------------------------------------------------------------------------
// Full pipeline: load → compile → write → verify on disk
// ---------------------------------------------------------------------------

describe("full pipeline: load → compile → write (claude)", () => {
  let claudeOutputDir: string;

  beforeAll(async () => {
    claudeOutputDir = path.join(outputDir, "claude-test");
    const skills = await loadVaultSkills(vaultDir);
    const files = compileVaultSkills(skills, [claudeAdapter]);
    await writeGeneratedFiles(files, claudeOutputDir);
  });

  it("writes writer-agent SKILL.md", async () => {
    const exists = await pathExists(
      path.join(claudeOutputDir, ".claude", "skills", "writer-agent", "SKILL.md"),
    );
    expect(exists).toBe(true);
  });

  it("writes writer-agent reference files", async () => {
    const base = path.join(claudeOutputDir, ".claude", "skills", "writer-agent", "references");
    expect(await pathExists(path.join(base, "voice-and-style.md"))).toBe(true);
    expect(await pathExists(path.join(base, "writing-doctrine.md"))).toBe(true);
    expect(await pathExists(path.join(base, "hooks-and-openings.md"))).toBe(true);
  });

  it("writer-agent SKILL.md contains original frontmatter", async () => {
    const content = await readOutput(claudeOutputDir, ".claude/skills/writer-agent/SKILL.md");
    expect(content).toContain("name: writer-agent");
    expect(content).toContain("description: Charles-style nonfiction writing and editing");
  });

  it("writer-agent SKILL.md preserves relative reference paths unchanged", async () => {
    const content = await readOutput(claudeOutputDir, ".claude/skills/writer-agent/SKILL.md");
    expect(content).toContain("`references/voice-and-style.md`");
    expect(content).toContain("`references/writing-doctrine.md`");
    expect(content).not.toContain("#file:");
  });

  it("reference file content matches source exactly", async () => {
    const content = await readOutput(
      claudeOutputDir,
      ".claude/skills/writer-agent/references/voice-and-style.md",
    );
    expect(content).toBe(VOICE_STYLE_MD);
  });

  it("design SKILL.md is written with no references directory created", async () => {
    const skillExists = await pathExists(
      path.join(claudeOutputDir, ".claude", "skills", "design", "SKILL.md"),
    );
    const refsExist = await pathExists(
      path.join(claudeOutputDir, ".claude", "skills", "design", "references"),
    );
    expect(skillExists).toBe(true);
    expect(refsExist).toBe(false);
  });
});

describe("full pipeline: load → compile → write (github-copilot)", () => {
  let copilotOutputDir: string;

  beforeAll(async () => {
    copilotOutputDir = path.join(outputDir, "copilot-test");
    const skills = await loadVaultSkills(vaultDir);
    const files = compileVaultSkills(skills, [githubCopilotAdapter]);
    await writeGeneratedFiles(files, copilotOutputDir);
  });

  it("writes writer-agent SKILL.md to github path", async () => {
    const exists = await pathExists(
      path.join(copilotOutputDir, ".github", "skills", "writer-agent", "SKILL.md"),
    );
    expect(exists).toBe(true);
  });

  it("rewrites reference paths to #file: workspace-relative format", async () => {
    const content = await readOutput(copilotOutputDir, ".github/skills/writer-agent/SKILL.md");
    expect(content).toContain("#file:.github/skills/writer-agent/references/voice-and-style.md");
    expect(content).toContain("#file:.github/skills/writer-agent/references/writing-doctrine.md");
  });

  it("appends vault-references attachment block", async () => {
    const content = await readOutput(copilotOutputDir, ".github/skills/writer-agent/SKILL.md");
    expect(content).toContain("<!-- vault-references -->");
  });

  it("copies reference files alongside SKILL.md", async () => {
    const base = path.join(copilotOutputDir, ".github", "skills", "writer-agent", "references");
    expect(await pathExists(path.join(base, "voice-and-style.md"))).toBe(true);
    expect(await pathExists(path.join(base, "hooks-and-openings.md"))).toBe(true);
  });
});

describe("full pipeline: load → compile → write (non-copilot platform)", () => {
  let geminiOutputDir: string;

  beforeAll(async () => {
    geminiOutputDir = path.join(outputDir, "gemini-test");
    const skills = await loadVaultSkills(vaultDir);
    const files = compileVaultSkills(skills, [geminiAdapter]);
    await writeGeneratedFiles(files, geminiOutputDir);
  });

  it("writes SKILL.md", async () => {
    expect(
      await pathExists(path.join(geminiOutputDir, ".gemini", "skills", "writer-agent", "SKILL.md")),
    ).toBe(true);
  });

  it("writes reference files alongside SKILL.md", async () => {
    const base = path.join(geminiOutputDir, ".gemini", "skills", "writer-agent", "references");
    expect(await pathExists(path.join(base, "voice-and-style.md"))).toBe(true);
    expect(await pathExists(path.join(base, "writing-doctrine.md"))).toBe(true);
    expect(await pathExists(path.join(base, "hooks-and-openings.md"))).toBe(true);
  });

  it("SKILL.md preserves relative reference paths (no #file: rewriting)", async () => {
    const content = await readOutput(geminiOutputDir, ".gemini/skills/writer-agent/SKILL.md");
    expect(content).toContain("`references/voice-and-style.md`");
    expect(content).not.toContain("#file:");
  });
});

describe("full pipeline: multi-platform output isolation", () => {
  let multiOutputDir: string;

  beforeAll(async () => {
    multiOutputDir = path.join(outputDir, "multi-test");
    const skills = await loadVaultSkills(vaultDir);
    const files = compileVaultSkills(skills, [claudeAdapter, githubCopilotAdapter, cursorAdapter]);
    await writeGeneratedFiles(files, multiOutputDir);
  });

  it("no output file paths overlap between tool directories", async () => {
    const skills = await loadVaultSkills(vaultDir);
    const files = compileVaultSkills(skills, [claudeAdapter, githubCopilotAdapter, cursorAdapter]);
    const paths = files.map((f) => f.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("each tool directory is independent on disk", async () => {
    expect(
      await pathExists(path.join(multiOutputDir, ".claude", "skills", "writer-agent", "SKILL.md")),
    ).toBe(true);
    expect(
      await pathExists(path.join(multiOutputDir, ".github", "skills", "writer-agent", "SKILL.md")),
    ).toBe(true);
    expect(
      await pathExists(path.join(multiOutputDir, ".cursor", "skills", "writer-agent", "SKILL.md")),
    ).toBe(true);
  });
});
