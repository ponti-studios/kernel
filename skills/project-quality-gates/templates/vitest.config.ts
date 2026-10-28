import { defineConfig } from "vitest/config";

/**
 * Coverage measures the artefact that actually runs. When the tests import compiled output, point
 * `include` at it — measuring the TypeScript sources reports 0% and looks like a broken tool.
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.{ts,mjs}", "src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["dist/**/*.js"],
      exclude: ["dist/**/*.d.ts", "**/*.test.js"],
      // A floor, not a target: set each one just below today's measured number so it can only ratchet up.
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
