import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../src/integration/shared/frontmatter";
import { AGENT_MODEL_REQUIREMENTS, CATEGORY_MODEL_REQUIREMENTS } from "../src/orchestration/agents/model-requirements";
import { BUILTIN_COMMAND_DEFINITIONS } from "../src/execution/features/commands/commands";
import YAML from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const AGENTS_DIR = join(PROJECT_ROOT, "src/orchestration/agents");
const AGENTS_YML_PATH = join(PROJECT_ROOT, "docs/agents.yml");
const COMMANDS_YML_PATH = join(PROJECT_ROOT, "docs/commands.yml");

/**
 * Sync agents.yml with source code and markdown definitions
 */
async function syncAgents() {
  console.log("Syncing agents.yml...");

  const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));
  const agentsList = [];

  for (const file of files) {
    const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
    const { data: metadata } = parseFrontmatter(content);

    if (!metadata || !metadata.id) continue;

    const id = metadata.id;
    const requirements = AGENT_MODEL_REQUIREMENTS[id];

    const agentEntry: any = {
      id,
      display_name: id, // Consistent with AGENT_DISPLAY_NAMES logic
      model: metadata.models?.primary === "inherit"
        ? (requirements?.fallbackChain?.[0]?.providers?.[0] + "/" + requirements?.fallbackChain?.[0]?.model) || "unknown"
        : metadata.models?.primary || "unknown",
      purpose: metadata.purpose || "",
    };

    if (requirements?.fallbackChain) {
      agentEntry.fallback_chain = requirements.fallbackChain.map((entry: any) => ({
        providers: entry.providers,
        model: entry.model,
        ...(entry.variant ? { variant: entry.variant } : {}),
      }));
    }

    agentsList.push(agentEntry);
  }

  // Sort agents by category if possible, or just ID
  agentsList.sort((a, b) => a.id.localeCompare(b.id));

  const categories = Object.entries(CATEGORY_MODEL_REQUIREMENTS).map(([id, req]) => ({
    id,
    ...(req.requiresModel ? { requires_model: req.requiresModel } : {}),
    fallback_chain: req.fallbackChain.map((entry: any) => ({
      providers: entry.providers,
      model: entry.model,
      ...(entry.variant ? { variant: entry.variant } : {}),
    })),
  }));

  const yamlContent = {
    version: 1,
    source: "src/orchestration/agents/",
    description: "Canonical source of truth for agent metadata, synchronized from source code.",
    metadata: {
      generated: new Date().toISOString().split("T")[0],
      notes: [
        "All agents organized by functional category",
        "Display names match agent IDs for consistency",
        "Fallback chains synchronized from src/orchestration/agents/model-requirements.ts",
      ],
    },
    agents: agentsList,
    categories,
    notes: [
      "Keep synchronized with src/integration/shared/agent-display-names.ts",
      "Command and skill catalogs are stored in docs/commands.yml and docs/skills.yml",
    ],
  };

  writeFileSync(AGENTS_YML_PATH, YAML.dump(yamlContent, { indent: 2, lineWidth: -1 }));
  console.log(`Updated: ${AGENTS_YML_PATH}`);
}

/**
 * Sync commands.yml with BUILTIN_COMMAND_DEFINITIONS
 */
async function syncCommands() {
  console.log("Syncing commands.yml...");

  const commandsList = Object.entries(BUILTIN_COMMAND_DEFINITIONS).map(([name, def]: [string, any]) => ({
    name,
    description: def.description,
    category: name.includes(":") ? name.split(":")[1] : "core", // Heuristic for category
  }));

  const yamlContent = {
    version: 1,
    source: "src/execution/features/builtin-commands/commands.ts",
    description: "Canonical command metadata for Ghostwire, synchronized from source code.",
    metadata: {
      generated: new Date().toISOString().split("T")[0],
      notes: [
        "Categories derived from command namespace",
        "Keep in sync with docs/AGENTS-COMMANDS-SKILLS.md",
      ],
    },
    commands: commandsList,
  };

  writeFileSync(COMMANDS_YML_PATH, YAML.dump(yamlContent, { indent: 2, lineWidth: -1 }));
  console.log(`Updated: ${COMMANDS_YML_PATH}`);
}

async function main() {
  try {
    await syncAgents();
    await syncCommands();
    console.log("Documentation sync complete!");
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}

main();
