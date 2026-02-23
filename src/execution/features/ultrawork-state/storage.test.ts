import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readUltraworkState,
  writeUltraworkState,
  appendSessionId,
  clearUltraworkState,
  getPlanProgress,
  getPlanName,
  createUltraworkState,
  findPlannerPlans,
} from "./storage";
import type { UltraworkState } from "./types";

describe("ultrawork-state", () => {
  const TEST_DIR = join(tmpdir(), "ultrawork-state-test-" + Date.now());
  const SISYPHUS_DIR = join(TEST_DIR, ".operator");

  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
    if (!existsSync(SISYPHUS_DIR)) {
      mkdirSync(SISYPHUS_DIR, { recursive: true });
    }
    clearUltraworkState(TEST_DIR);
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("readUltraworkState", () => {
    test("should return null when no ultrawork.json exists", () => {
      // #given - no ultrawork.json file
      // #when
      const result = readUltraworkState(TEST_DIR);
      // #then
      expect(result).toBeNull();
    });

    test("should read valid ultrawork state", () => {
      // #given - valid ultrawork.json
      const state: UltraworkState = {
        active_plan: "/path/to/plan.md",
        started_at: "2026-01-02T10:00:00Z",
        session_ids: ["session-1", "session-2"],
        plan_name: "my-plan",
      };
      writeUltraworkState(TEST_DIR, state);

      // #when
      const result = readUltraworkState(TEST_DIR);

      // #then
      expect(result).not.toBeNull();
      expect(result?.active_plan).toBe("/path/to/plan.md");
      expect(result?.session_ids).toEqual(["session-1", "session-2"]);
      expect(result?.plan_name).toBe("my-plan");
    });
  });

  describe("writeUltraworkState", () => {
    test("should write state and create .ghostwire directory if needed", () => {
      // #given - state to write
      const state: UltraworkState = {
        active_plan: "/test/plan.md",
        started_at: "2026-01-02T12:00:00Z",
        session_ids: ["ses-123"],
        plan_name: "test-plan",
      };

      // #when
      const success = writeUltraworkState(TEST_DIR, state);
      const readBack = readUltraworkState(TEST_DIR);

      // #then
      expect(success).toBe(true);
      expect(readBack).not.toBeNull();
      expect(readBack?.active_plan).toBe("/test/plan.md");
    });
  });

  describe("appendSessionId", () => {
    test("should append new session id to existing state", () => {
      // #given - existing state with one session
      const state: UltraworkState = {
        active_plan: "/plan.md",
        started_at: "2026-01-02T10:00:00Z",
        session_ids: ["session-1"],
        plan_name: "plan",
      };
      writeUltraworkState(TEST_DIR, state);

      // #when
      const result = appendSessionId(TEST_DIR, "session-2");

      // #then
      expect(result).not.toBeNull();
      expect(result?.session_ids).toEqual(["session-1", "session-2"]);
    });

    test("should not duplicate existing session id", () => {
      // #given - state with session-1 already
      const state: UltraworkState = {
        active_plan: "/plan.md",
        started_at: "2026-01-02T10:00:00Z",
        session_ids: ["session-1"],
        plan_name: "plan",
      };
      writeUltraworkState(TEST_DIR, state);

      // #when
      appendSessionId(TEST_DIR, "session-1");
      const result = readUltraworkState(TEST_DIR);

      // #then
      expect(result?.session_ids).toEqual(["session-1"]);
    });

    test("should return null when no state exists", () => {
      // #given - no ultrawork.json
      // #when
      const result = appendSessionId(TEST_DIR, "new-session");
      // #then
      expect(result).toBeNull();
    });
  });

  describe("clearUltraworkState", () => {
    test("should remove ultrawork.json", () => {
      // #given - existing state
      const state: UltraworkState = {
        active_plan: "/plan.md",
        started_at: "2026-01-02T10:00:00Z",
        session_ids: ["session-1"],
        plan_name: "plan",
      };
      writeUltraworkState(TEST_DIR, state);

      // #when
      const success = clearUltraworkState(TEST_DIR);
      const result = readUltraworkState(TEST_DIR);

      // #then
      expect(success).toBe(true);
      expect(result).toBeNull();
    });

    test("should succeed even when no file exists", () => {
      // #given - no ultrawork.json
      // #when
      const success = clearUltraworkState(TEST_DIR);
      // #then
      expect(success).toBe(true);
    });
  });

  describe("getPlanProgress", () => {
    test("should count completed and uncompleted checkboxes", () => {
      // #given - plan file with checkboxes
      const planPath = join(TEST_DIR, "test-plan.md");
      writeFileSync(
        planPath,
        `# Plan
- [ ] Task 1
- [x] Task 2  
- [ ] Task 3
- [X] Task 4
`,
      );

      // #when
      const progress = getPlanProgress(planPath);

      // #then
      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(2);
      expect(progress.isComplete).toBe(false);
    });

    test("should return isComplete true when all checked", () => {
      // #given - all tasks completed
      const planPath = join(TEST_DIR, "complete-plan.md");
      writeFileSync(
        planPath,
        `# Plan
- [x] Task 1
- [X] Task 2
`,
      );

      // #when
      const progress = getPlanProgress(planPath);

      // #then
      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(2);
      expect(progress.isComplete).toBe(true);
    });

    test("should return isComplete true for empty plan", () => {
      // #given - plan with no checkboxes
      const planPath = join(TEST_DIR, "empty-plan.md");
      writeFileSync(planPath, "# Plan\nNo tasks here");

      // #when
      const progress = getPlanProgress(planPath);

      // #then
      expect(progress.total).toBe(0);
      expect(progress.isComplete).toBe(true);
    });

    test("should handle non-existent file", () => {
      // #given - non-existent file
      // #when
      const progress = getPlanProgress("/non/existent/file.md");
      // #then
      expect(progress.total).toBe(0);
      expect(progress.isComplete).toBe(true);
    });
  });

  describe("getPlanName", () => {
    test("should extract plan name from path", () => {
      // #given
      const path = "/home/user/.ghostwire/plans/project/my-feature.md";
      // #when
      const name = getPlanName(path);
      // #then
      expect(name).toBe("my-feature");
    });
  });

  describe("createUltraworkState", () => {
    test("should create state with correct fields", () => {
      // #given
      const planPath = "/path/to/auth-refactor.md";
      const sessionId = "ses-abc123";

      // #when
      const state = createUltraworkState(planPath, sessionId);

      // #then
      expect(state.active_plan).toBe(planPath);
      expect(state.session_ids).toEqual([sessionId]);
      expect(state.plan_name).toBe("auth-refactor");
      expect(state.started_at).toBeDefined();
    });
  });
});
