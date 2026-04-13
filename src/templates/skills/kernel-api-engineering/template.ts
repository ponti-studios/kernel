import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import apiEngineeringSkillMarkdown from "./instructions.md";

const { body } = parseFrontmatter(apiEngineeringSkillMarkdown);

export function getApiEngineeringSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.API_ENGINEERING,
    profile: "extended",
    description:
      "Provides best practices for building type-safe APIs. Use when designing, implementing, or reviewing API endpoints, RPC definitions, request/response schemas, middleware, error handling, or API versioning.",
    license: "MIT",
    compatibility: "Any TypeScript API project using Hono, Express, or a similar HTTP framework.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Engineering",
      tags: [
        "api",
        "rpc",
        "http",
        "typescript",
        "hono",
        "rest",
        "openapi",
        "error-handling",
        "middleware",
      ],
    },
    when: [
      "user is designing a new API endpoint or route",
      "user is implementing request validation or error handling",
      "user is reviewing API code for correctness or security",
      "user is working with RPC definitions or API contract types",
      "user is adding authentication or authorization to an API route",
      "user is implementing middleware",
    ],
    applicability: [
      "Use when implementing any API endpoint, route handler, or middleware",
      "Use when writing request/response schemas or API contract types",
      "Use when reviewing API code for security, correctness, or maintainability",
      "Use when designing the error response envelope for an API",
    ],
    termination: [
      "API endpoint implemented with validation, error handling, and auth",
      "Route handler is thin: validate → service → respond",
      "Tests cover happy path, validation rejection, and auth boundary",
    ],
    outputs: [
      "Type-safe API route with schema validation",
      "Consistent error response envelope",
      "Auth-aware middleware chain",
      "Integration tests for happy path, 422, and 401/403",
    ],
    instructions: body,
  };
}
