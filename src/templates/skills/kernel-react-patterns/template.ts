import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import reactPatternsSkillMarkdown from "./instructions.md";
import { REACT_PATTERNS_REFERENCES } from "./reference-bundle.js";

export function getReactPatternsSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.REACT_PATTERNS,
    profile: "extended",
    description:
      "Provides React patterns and component architecture guidance for app and monorepo work. Use when building React components, writing query or mutation hooks, managing state, composing hooks, handling async data, reviewing React code for correctness, or when adding code to a shared UI package that must stay presentational.",
    license: "MIT",
    compatibility: "Any React application (web or React Native).",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Frontend",
      tags: [
        "react",
        "components",
        "hooks",
        "state",
        "performance",
        "patterns",
        "suspense",
        "typescript",
        "monorepo",
        "package-boundaries",
        "tanstack-query",
        "data-fetching",
        "mutations",
      ],
    },
    when: [
      "user is building a React component or custom hook",
      "user is deciding where to put state or how to share it between components",
      "user is implementing async data loading or error handling in React",
      "user is reviewing React code for correctness or performance issues",
      "user is working with lists, keys, or memoization",
      "user is writing a query hook, mutation hook, or wiring up Suspense for data loading",
      "user is implementing pagination, infinite scroll, or optimistic updates",
      "user is adding code to a shared UI package (packages/ui or equivalent)",
      "a component is importing from auth, API, or routing packages and should not be",
    ],
    applicability: [
      "Use when building any React component that handles state, data, or side effects",
      "Use when reviewing React code for anti-patterns or performance issues",
      "Use when deciding on component composition or hook design",
    ],
    termination: [
      "Component has single responsibility and correct key usage",
      "State lives at the appropriate level — no derived state stored in useState",
      "Async data handled via query hooks with Suspense or explicit loading states",
    ],
    outputs: [
      "React component following single-responsibility principle",
      "Custom hook with isolated, testable logic",
      "Correct async data pattern (Suspense or inline loading state)",
    ],
    references: REACT_PATTERNS_REFERENCES,
    instructions: parseFrontmatter(reactPatternsSkillMarkdown).body,
  };
}
