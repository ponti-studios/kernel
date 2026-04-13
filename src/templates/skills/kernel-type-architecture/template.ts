import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import typeArchitectureSkillMarkdown from "./instructions.md";

export function getTypeArchitectureSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.TYPE_ARCHITECTURE,
    profile: "extended",
    description:
      "Guides type architecture decisions: schema design, tsconfig configuration, and project-graph structure across packages. Use when structuring shared types in a monorepo, configuring TypeScript project references, deciding where a type should live, or when users ask about TypeScript configuration.",
    license: "MIT",
    compatibility: "TypeScript 7 (tsgo) + Vite monorepos.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Engineering",
      tags: [
        "typescript",
        "types",
        "tsconfig",
        "zod",
        "schemas",
        "monorepo",
        "project-references",
        "type-safety",
      ],
    },
    when: [
      "user is deciding where a shared type should live in the package graph",
      "user is configuring tsconfig.json files for a monorepo",
      "user is resolving a circular type dependency between packages",
      "user is defining a new schema and needs to derive types from it",
      "user is reviewing type duplication across packages",
    ],
    applicability: [
      "Use when adding a new package to a monorepo and setting up its tsconfig",
      "Use when a type is needed in more than one package",
      "Use when authoring schemas — always use Zod-first and derive types",
      "Use when resolving TypeScript project reference errors",
    ],
    termination: [
      "Types have a single source of truth with clear ownership",
      "Schemas are Zod-first with derived types — no parallel definitions",
      "tsconfig uses project references with composite: true on all packages",
    ],
    outputs: [
      "Zod schema with derived TypeScript type",
      "tsconfig.json with correct project references",
      "Package export map in package.json",
    ],
    instructions: parseFrontmatter(typeArchitectureSkillMarkdown).body,
  };
}
