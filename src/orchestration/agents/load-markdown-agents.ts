import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { parseFrontmatter } from "../../integration/shared/frontmatter";
import { safeValidateAgentMetadata, AgentMetadata } from "./agent-schema";
import { BUILTIN_AGENTS_MANIFEST } from "../../execution/features/agents-manifest";

/**
 * Agent loaded from markdown file with parsed content
 */
export interface LoadedAgent extends AgentMetadata {
  prompt: string; // Full markdown content (everything after frontmatter)
}

/**
 * Load agents from embedded manifest (generated at build time)
 * This is the primary method and doesn't depend on filesystem
 *
 * @returns Array of loaded agents from manifest
 * @throws Error if manifest cannot be loaded
 */
export async function loadAgentsFromManifest(): Promise<LoadedAgent[]> {
  try {
    // Use static import of the manifest generated at build time
    if (!BUILTIN_AGENTS_MANIFEST || BUILTIN_AGENTS_MANIFEST.length === 0) {
      throw new Error("Manifest is empty");
    }
    return BUILTIN_AGENTS_MANIFEST.slice(); // Convert readonly to mutable array
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot load agents manifest: ${errorMsg}`);
  }
}

/**
 * Load all markdown agent definitions from a directory
 *
 * Scans the directory for .md files, parses YAML frontmatter,
 * validates metadata, and returns agents in format compatible
 * with createBuiltinAgents()
 *
 * @param agentsDir - Path to directory containing agent .md files
 * @returns Array of loaded agents
 * @throws Error if agent definitions are invalid or duplicate IDs found
 */
export async function loadMarkdownAgents(
  agentsDir?: string,
): Promise<LoadedAgent[]> {
  // If directory provided and exists, load from filesystem (used during build/dev)
  if (agentsDir && existsSync(agentsDir)) {
    const files = readdirSync(agentsDir).filter((file) => file.endsWith(".md"));
    const agents: LoadedAgent[] = [];
    const ids = new Set<string>();

    for (const file of files) {
      const agent = loadAgentFromFile(path.join(agentsDir, file));
      if (ids.has(agent.id)) {
        throw new Error(`Duplicate agent ID found: ${agent.id}`);
      }
      ids.add(agent.id);
      agents.push(agent);
    }
    return agents;
  }

  // Otherwise load from embedded manifest (preferred for production)
  try {
    return await loadAgentsFromManifest();
  } catch (manifestError) {
    const errorMsg =
      manifestError instanceof Error
        ? manifestError.message
        : String(manifestError);
    throw new Error(
      `Failed to load agents from embedded manifest (manifestError: ${errorMsg}). ${agentsDir ? `Directory was provided: ${agentsDir}` : "No directory provided"}`,
    );
  }
}

/**
 * Load and parse a single agent markdown file
 *
 * @param filePath - Path to agent .md file
 * @returns Parsed LoadedAgent
 * @throws Error if file is invalid or unreadable
 */
function loadAgentFromFile(filePath: string): LoadedAgent {
  // Read file content
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Cannot read file: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Parse frontmatter and body
  const parsed = parseFrontmatter<Record<string, unknown>>(content);
  if (!parsed.hadFrontmatter) {
    throw new Error("Markdown file is missing YAML frontmatter");
  }
  if (parsed.parseError) {
    throw new Error("Invalid YAML in frontmatter");
  }

  const rawMetadata = parsed.data;
  const body = parsed.body;

  // Validate metadata
  const validation = safeValidateAgentMetadata(rawMetadata);
  if (!validation.success) {
    const issueSummary = validation.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Metadata validation failed: ${issueSummary}`);
  }

  const metadata: AgentMetadata = validation.data;

  // Ensure markdown body has content
  if (!body.trim()) {
    throw new Error("Markdown body is empty");
  }

  // Return loaded agent with prompt content (body only)
  return {
    ...metadata,
    prompt: body,
  };
}

/**
 * Load agents and handle errors gracefully (for CLI/non-critical paths)
 *
 * @param agentsDir - Path to directory containing agent .md files
 * @returns Array of loaded agents, empty array if errors occur
 */
export async function loadMarkdownAgentsSafe(
  agentsDir: string,
): Promise<LoadedAgent[]> {
  try {
    return await loadMarkdownAgents(agentsDir);
  } catch (err) {
    console.error(
      "Error loading markdown agents:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}
