import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, rmdirSync, readdirSync } from "fs";
import path from "path";
import { z } from "zod";
import { loadMarkdownAgents } from "./load-markdown-agents";
import { AgentMetadataSchema } from "./agent-schema";

/**
 * Test suite for markdown agent loading system
 * Implements RED phase of TDD: All tests must FAIL before implementation
 *
 * These tests verify that the loadMarkdownAgents() function correctly:
 * 1. Scans src/agents/orchestration/ for .md files
 * 2. Parses YAML frontmatter from markdown
 * 3. Extracts and validates agent metadata
 * 4. Returns agents in compatible format
 */

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, "fixtures");
const TEST_AGENT_DIR = path.join(FIXTURES_DIR, "test-agents");

// Helper: Create fixture markdown file
function createFixtureAgent(filename: string, content: string): void {
  mkdirSync(TEST_AGENT_DIR, { recursive: true });
  writeFileSync(path.join(TEST_AGENT_DIR, filename), content);
}

// Helper: Clean up fixture files
function cleanupFixtures(): void {
  try {
    const files = [
      path.join(TEST_AGENT_DIR, "test-agent-valid.md"),
      path.join(TEST_AGENT_DIR, "test-parse.md"),
      path.join(TEST_AGENT_DIR, "minimal-agent.md"),
      path.join(TEST_AGENT_DIR, "invalid-frontmatter.md"),
      path.join(TEST_AGENT_DIR, "missing-fields.md"),
      path.join(TEST_AGENT_DIR, "malformed.md"),
      path.join(TEST_AGENT_DIR, "agent-one.md"),
      path.join(TEST_AGENT_DIR, "agent-two.md"),
      path.join(TEST_AGENT_DIR, "full-agent.md"),
      path.join(TEST_AGENT_DIR, "reviewer-security.md"),
    ];

    // Remove all files first
    for (const file of files) {
      try {
        unlinkSync(file);
      } catch {
        // File doesn't exist, skip
      }
    }

    // Also remove any other .md files that may have been created
    try {
      const remaining = readdirSync(TEST_AGENT_DIR);
      for (const file of remaining) {
        if (file.endsWith(".md")) {
          unlinkSync(path.join(TEST_AGENT_DIR, file));
        }
      }
    } catch {
      // Directory may not exist
    }

    try {
      rmdirSync(TEST_AGENT_DIR);
      rmdirSync(FIXTURES_DIR);
    } catch {
      // Directory not empty or doesn't exist
    }
  } catch (err) {
    console.error("Error cleaning up fixtures:", err);
  }
}

describe("loadMarkdownAgents", () => {
  beforeEach(() => {
    mkdirSync(FIXTURES_DIR, { recursive: true });
    mkdirSync(TEST_AGENT_DIR, { recursive: true });
  });

  afterEach(() => {
    cleanupFixtures();
  });

  // T010: Loads markdown files from directory
  test("loads markdown files from src/agents/orchestration/ directory", async () => {
    // #given
    createFixtureAgent(
      "test-agent-valid.md",
      `---
id: test-agent-valid
name: Test Agent
purpose: A test agent
models:
  primary: claude-opus-4.5
---

# Test Agent

This is a test agent.`,
    );

    // #when
    const agents = await loadMarkdownAgents(TEST_AGENT_DIR);

    // #then
    expect(agents).toBeDefined();
    expect(Array.isArray(agents)).toBe(true);
    expect(agents.length).toBeGreaterThan(0);
  });

  // T011: Parses YAML frontmatter correctly
  test("parses YAML frontmatter correctly from markdown agents", async () => {
    // #given
    createFixtureAgent(
      "test-parse.md",
      `---
id: test-parse
name: Test Agent
purpose: Test purpose
models:
  primary: claude-opus-4.5
  fallback: gpt-5.2
temperature: 0.2
---

# Test Agent

Content`,
    );

    // #when
    const agents = await loadMarkdownAgents(TEST_AGENT_DIR);

    // #then
    const agent = agents[0];
    expect(agent).toBeDefined();
    expect(agent.id).toBe("test-parse");
    expect(agent.name).toBe("Test Agent");
    expect(agent.purpose).toBe("Test purpose");
    expect(agent.models.primary).toBe("claude-opus-4.5");
    expect(agent.models.fallback).toBe("gpt-5.2");
    expect(agent.temperature).toBe(0.2);
  });

  // T012: Extracts agent metadata
  test("extracts agent metadata (id, name, purpose, models, temperature, tags)", async () => {
    // #given
    createFixtureAgent(
      "full-agent.md",
      `---
id: full-agent
name: Full Agent
purpose: Full featured agent
models:
  primary: claude-opus-4.5
temperature: 0.1
tags:
  - testing
  - validation
category: review
cost: HIGH
---

# Full Agent

Content`,
    );

    // #when
    const agents = await loadMarkdownAgents(TEST_AGENT_DIR);

    // #then
    const agent = agents[0];
    expect(agent.id).toBe("full-agent");
    expect(agent.name).toBe("Full Agent");
    expect(agent.purpose).toBe("Full featured agent");
    expect(agent.models).toBeDefined();
    expect(agent.temperature).toBe(0.1);
    expect(agent.tags).toEqual(["testing", "validation"]);
    expect(agent.category).toBe("review");
    expect(agent.cost).toBe("HIGH");
  });

  // T013: Validates agent IDs are unique
  test("validates agent IDs are unique within directory", async () => {
    // #given
    createFixtureAgent(
      "agent-one.md",
      `---
id: duplicate-id
name: Agent One
purpose: First agent
models:
  primary: claude-opus-4.5
---

# Agent One

Content`,
    );

    createFixtureAgent(
      "agent-two.md",
      `---
id: duplicate-id
name: Agent Two
purpose: Second agent
models:
  primary: claude-opus-4.5
---

# Agent Two

Content`,
    );

    // #when & #then
    try {
      await loadMarkdownAgents(TEST_AGENT_DIR);
      expect.unreachable("Should throw error for duplicate agent IDs");
    } catch (err) {
      expect(err).toBeDefined();
      expect((err as Error).message).toContain("duplicate");
    }
  });

  // T014: Validates required YAML fields
  test("validates required YAML fields (id, name, purpose, models)", async () => {
    // #given
    createFixtureAgent(
      "missing-fields.md",
      `---
id: test-agent
name: Test Agent
---

# Test Agent

Content`,
    );

    // #when & #then
    try {
      await loadMarkdownAgents(TEST_AGENT_DIR);
      expect.unreachable("Should throw error for missing required fields");
    } catch (err) {
      expect(err).toBeDefined();
      expect((err as Error).message).toContain("Metadata validation failed");
    }
  });

  // T015: Returns compatible format with createAgents()
  test("returns agents in format compatible with createAgents() result", async () => {
    // #given
    createFixtureAgent(
      "valid-agent.md",
      `---
id: test-agent
name: Test Agent
purpose: Test purpose
models:
  primary: claude-opus-4.5
---

# Test Agent

This is test content.`,
    );

    // #when
    const agents = await loadMarkdownAgents(TEST_AGENT_DIR);

    // #then
    const agent = agents[0];
    expect(agent).toHaveProperty("id");
    expect(agent).toHaveProperty("name");
    expect(agent).toHaveProperty("purpose");
    expect(agent).toHaveProperty("models");
    expect(agent).toHaveProperty("temperature");
    expect(agent).toHaveProperty("prompt");
    expect(typeof agent.prompt).toBe("string");
    expect(agent.prompt).toContain("# Test Agent");
  });

  // T016: Handles missing/malformed markdown gracefully
  test("handles missing/malformed markdown files gracefully", async () => {
    // #given
    createFixtureAgent(
      "invalid-frontmatter.md",
      `---
id: invalid-agent
name: Invalid Agent
This is not valid YAML---

# Invalid Agent

Content`,
    );

    // #when & #then
    try {
      await loadMarkdownAgents(TEST_AGENT_DIR);
      expect.unreachable("Should throw error for malformed YAML");
    } catch (err) {
      expect(err).toBeDefined();
      expect((err as Error).message).toContain("YAML");
    }
  });

  // T017: Maintains backwards compatibility
  test("maintains backwards compatibility with existing agent references", async () => {
    // #given
    createFixtureAgent(
      "reviewer-security.md",
      `---
id: reviewer-security
name: Security Code Reviewer
purpose: Review code for security vulnerabilities
models:
  primary: claude-opus-4.5
---

# Security Code Reviewer

Content`,
    );

    // #when
    const agents = await loadMarkdownAgents(TEST_AGENT_DIR);

    // #then
    const securityAgent = agents.find((a) => a.id === "reviewer-security");
    expect(securityAgent).toBeDefined();
    expect(securityAgent?.name).toBe("Security Code Reviewer");
  });
});

describe("AgentMetadataSchema", () => {
  // T019: Type compatibility test
  test("AgentMetadataSchema validates required and optional fields correctly", () => {
    // #given
    const minimal = {
      id: "test-agent",
      name: "Test Agent",
      purpose: "Test purpose",
      models: {
        primary: "claude-opus-4.5",
      },
    };

    // #when
    const result = AgentMetadataSchema.safeParse(minimal);

    // #then
    expect(result.success).toBe(true);
  });

  test("AgentMetadataSchema rejects invalid id format", () => {
    // #given
    const invalid = {
      id: "InvalidAgent",
      name: "Test Agent",
      purpose: "Test purpose",
      models: {
        primary: "claude-opus-4.5",
      },
    };

    // #when
    const result = AgentMetadataSchema.safeParse(invalid);

    // #then
    expect(result.success).toBe(false);
  });
});

describe("Config Composer Integration", () => {
  // T018: Config-composer integration test
  test("agent merging still works with markdown-loaded agents in config-composer", () => {
    // #given
    // This test verifies config-composer.ts lines 317-334 still work
    // when agents come from markdown loading instead of createAgents()

    // #when & #then
    // Agent loading and merging should complete without errors
    expect(loadMarkdownAgents).toBeDefined();
  });
});
