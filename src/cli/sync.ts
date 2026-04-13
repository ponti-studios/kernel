/**
 * Sync command
 *
 * Installs agents, skills, and commands to user-level directories.
 *
 * Design:
 * - Skills: written to ~/.agents/skills/ (shared catalog, open agent skills format).
 *   Each supported tool's skills directory is symlinked to that catalog.
 *   Skills are format-compatible across tools — extra YAML frontmatter fields
 *   are safely ignored by tools that use the base schema.
 *
 * - Agents: written per-tool using each tool's native adapter.
 *   Tools use different file formats (Markdown vs TOML) and different filename
 *   extensions (.md / .agent.md / .toml), so symlinking a single source file
 *   cannot work. Each tool gets its own properly formatted agent files.
 *   Reference files are written directly alongside every tool's agent directory.
 *
 * Tool home directories:
 *   Claude     → ~/.claude/agents/   (*.md)
 *   Codex      → ~/.codex/agents/    (*.toml)
 *   Copilot    → ~/.copilot/agents/  (*.agent.md)  ← user-level dir differs from project .github/
 *   OpenCode   → ~/.config/opencode/agents/ (*.md)
 */

import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { claudeAdapter } from "../core/adapters/claude.js";
import { codexAdapter } from "../core/adapters/codex.js";
import { githubCopilotAdapter } from "../core/adapters/github-copilot.js";
import { opencodeAdapter } from "../core/adapters/opencode.js";
import type { ToolCommandAdapter } from "../core/adapters/types.js";
import { CONFIG_VERSION } from "../core/config/defaults.js";
import {
    getDefaultAgentTemplates,
    getDefaultSkillTemplates,
} from "../templates/catalog.js";

export interface SyncOptions {
  homePath?: string;
}

const SKILL_LINK_TARGETS: Array<{ toolHomeDir: string }> = [
  { toolHomeDir: ".claude" },
  { toolHomeDir: ".codex" },
  { toolHomeDir: ".copilot" },
  { toolHomeDir: ".config/opencode" },
  { toolHomeDir: ".pi" },
];

// Per-tool agent installation config.
// toolHomeDir: the dot-directory under homePath where agents are written.
// Copilot: project-level path prefix is .github/ (used by the adapter's getAgentPath),
// but the user-level installation target is ~/.copilot/agents/.
const AGENT_ADAPTERS: Array<{ adapter: ToolCommandAdapter; toolHomeDir: string }> = [
  { adapter: claudeAdapter, toolHomeDir: ".claude" },
  { adapter: codexAdapter, toolHomeDir: ".codex" },
  { adapter: githubCopilotAdapter, toolHomeDir: ".copilot" },
  { adapter: opencodeAdapter, toolHomeDir: ".config/opencode" },
];

export async function executeSync(options: SyncOptions): Promise<void> {
  await installGlobalCatalog(options.homePath);
}

async function installGlobalCatalog(homePath = homedir()): Promise<void> {
  const skillsSourceDir = join(homePath, ".agents", "skills");
  mkdirSync(skillsSourceDir, { recursive: true });

  const agents = getDefaultAgentTemplates("extended");
  const skillTemplates = getDefaultSkillTemplates("extended");

  // --- Shared skills catalog: ~/.agents/skills/<name>/SKILL.md ---
  for (const template of skillTemplates) {
    const skillDir = join(skillsSourceDir, template.name);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, "SKILL.md"),
      githubCopilotAdapter.formatSkill!(template, CONFIG_VERSION),
    );
    for (const ref of template.references ?? []) {
      const refPath = join(skillDir, ref.relativePath);
      mkdirSync(dirname(refPath), { recursive: true });
      writeFileSync(refPath, ref.content);
    }
  }

  // --- Per-tool agent files using each tool's native adapter format ---
  for (const { adapter, toolHomeDir } of AGENT_ADAPTERS) {
    if (!adapter.getAgentPath || !adapter.formatAgent) continue;

    const toolAgentsDir = join(homePath, toolHomeDir, "agents");
    mkdirSync(toolAgentsDir, { recursive: true });

    // Remove stale files from all known agent extensions before writing
    for (const agent of agents) {
      for (const ext of [".md", ".agent.md", ".toml"]) {
        rmSync(join(toolAgentsDir, `${agent.name}${ext}`), { force: true });
      }
    }
    // Remove any stale reference side-files from the previous approach
    rmSync(join(toolAgentsDir, "references"), { force: true, recursive: true });

    for (const agent of agents) {
      // Derive the native filename from the adapter (e.g. "kernel-plan.md" / "kernel-plan.toml")
      // References are embedded inline by each adapter's formatAgent — no side-files written.
      const agentFileName = basename(adapter.getAgentPath(agent.name));
      writeFileSync(join(toolAgentsDir, agentFileName), adapter.formatAgent(agent, CONFIG_VERSION));
    }
  }

  // --- Skill symlinks: ~/.{tool}/skills/<name> → ~/.agents/skills/<name> ---
  for (const { toolHomeDir } of SKILL_LINK_TARGETS) {
    const toolSkillsDir = join(homePath, toolHomeDir, "skills");
    mkdirSync(toolSkillsDir, { recursive: true });

    for (const template of skillTemplates) {
      const linkPath = join(toolSkillsDir, template.name);
      rmSync(linkPath, { force: true, recursive: true });
      symlinkSync(join(skillsSourceDir, template.name), linkPath, "dir");
    }
  }

  console.log(`\n✓ Installed ${skillTemplates.length} skills to ~/.agents/skills/`);
  console.log(
    `✓ Installed ${agents.length} agents to: ${AGENT_ADAPTERS.map((a) => a.toolHomeDir).join(", ")}`,
  );
  console.log(`✓ Linked skills to: ${SKILL_LINK_TARGETS.map((a) => a.toolHomeDir).join(", ")}`);
}
