import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import projectInitSkillMarkdown from "./instructions.md";

export function getProjectInitSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PROJECT_INIT,
    profile: "extended",
    description:
      "Scaffolds new projects using the prescribed stack: TypeScript 7 (tsgo), Vite+, TanStack Router, Hono, Kysely, Goose, Tailwind CSS + CSS Modules, and Better-Auth. Use when starting a new repository or bootstrapping a project from scratch.",
    license: "MIT",
    compatibility: "Bun + TypeScript projects.",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Engineering",
      tags: [
        "project",
        "init",
        "setup",
        "typescript",
        "vite",
        "tanstack-router",
        "hono",
        "kysely",
        "goose",
        "tailwind",
        "better-auth",
        "bun",
      ],
    },
    when: [
      "starting a new project or repository from scratch",
      "bootstrapping a monorepo with web, API, and shared packages",
      "user asks how to set up a new project",
    ],
    applicability: ["Use when initializing any new project before application code is written"],
    termination: [
      "TypeScript type-check passes with zero errors",
      "Build succeeds with zero errors and zero warnings treated as errors",
      "Test runner executes and passes",
      "Lint passes with zero violations",
      "Git initialized with .gitignore and initial commit",
    ],
    outputs: [
      "Initialized project with prescribed stack, working build, test, lint, and type-check pipelines",
    ],
    dependencies: [],
    instructions: parseFrontmatter(projectInitSkillMarkdown).body,
  };
}
