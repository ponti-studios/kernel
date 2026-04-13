import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import authContractSkillMarkdown from "./instructions.md";

const { body } = parseFrontmatter(authContractSkillMarkdown);

export function getAuthContractSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.AUTH_CONTRACT,
    profile: "extended",
    description:
      "Defines and enforces the authentication and authorization contract for apps and services. Use when implementing login, session management, token handling, protected routes, inter-service auth, or when users ask how auth should work.",
    license: "MIT",
    compatibility: "Any full-stack project with authentication requirements.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Security",
      tags: [
        "auth",
        "authentication",
        "authorization",
        "jwt",
        "session",
        "tokens",
        "middleware",
        "protected-routes",
        "rbac",
      ],
    },
    when: [
      "user is implementing login, logout, or registration",
      "user is managing sessions, JWTs, or refresh tokens",
      "user is adding auth middleware to an API",
      "user is implementing protected routes in the frontend",
      "user is designing role-based access control",
      "user is implementing inter-service authentication",
    ],
    applicability: [
      "Use when implementing any authentication or authorization flow",
      "Use when reviewing token storage, expiry, or rotation strategy",
      "Use when adding an auth guard to a frontend route",
      "Use when designing inter-service credential passing",
    ],
    termination: [
      "Session contract is defined and typed",
      "Token lifecycle (access + refresh) is implemented per spec",
      "API middleware verifies session before handler executes",
      "Frontend auth guard handles loading, authenticated, and unauthenticated states",
    ],
    outputs: [
      "Session type definition",
      "Token verification middleware",
      "Frontend auth guard component",
      "Logout implementation that revokes server-side",
    ],
    instructions: body,
  };
}
