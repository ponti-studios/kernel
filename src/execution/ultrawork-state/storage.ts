/**
 * Ultrawork State Storage
 *
 * Handles reading/writing ultrawork.json for active plan tracking.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import type { UltraworkState, PlanProgress } from "./types";
import { ULTRAWORK_DIR, ULTRAWORK_FILE, PLANNER_PLANS_DIR } from "./constants";

export function getUltraworkFilePath(directory: string): string {
  return join(directory, ULTRAWORK_DIR, ULTRAWORK_FILE);
}

export function readUltraworkState(directory: string): UltraworkState | null {
  const filePath = getUltraworkFilePath(directory);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as UltraworkState;
  } catch {
    return null;
  }
}

export function writeUltraworkState(directory: string, state: UltraworkState): boolean {
  const filePath = getUltraworkFilePath(directory);

  try {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function appendSessionId(directory: string, sessionId: string): UltraworkState | null {
  const state = readUltraworkState(directory);
  if (!state) return null;

  if (!state.session_ids.includes(sessionId)) {
    state.session_ids.push(sessionId);
    if (writeUltraworkState(directory, state)) {
      return state;
    }
  }

  return state;
}

export function clearUltraworkState(directory: string): boolean {
  const filePath = getUltraworkFilePath(directory);

  try {
    if (existsSync(filePath)) {
      const { unlinkSync } = require("node:fs");
      unlinkSync(filePath);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Find planner plan files for this project.
 * planner stores plans at: {project}/docs/plans/{name}.md
 */
export function findPlannerPlans(directory: string): string[] {
  // PLANNER_PLANS_DIR now points to docs/plans
  const plansDir = join(directory, PLANNER_PLANS_DIR);

  if (!existsSync(plansDir)) {
    return [];
  }

  try {
    const files = readdirSync(plansDir);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => join(plansDir, f))
      .sort((a, b) => {
        // Sort by modification time, newest first
        const aStat = require("node:fs").statSync(a);
        const bStat = require("node:fs").statSync(b);
        return bStat.mtimeMs - aStat.mtimeMs;
      });
  } catch {
    return [];
  }
}

/**
 * Parse a plan file and count checkbox progress.
 */
export function getPlanProgress(planPath: string): PlanProgress {
  if (!existsSync(planPath)) {
    return { total: 0, completed: 0, isComplete: true };
  }

  try {
    const content = readFileSync(planPath, "utf-8");

    // Match markdown checkboxes: - [ ] or - [x] or - [X]
    const uncheckedMatches = content.match(/^[-*]\s*\[\s*\]/gm) || [];
    const checkedMatches = content.match(/^[-*]\s*\[[xX]\]/gm) || [];

    const total = uncheckedMatches.length + checkedMatches.length;
    const completed = checkedMatches.length;

    return {
      total,
      completed,
      isComplete: total === 0 || completed === total,
    };
  } catch {
    return { total: 0, completed: 0, isComplete: true };
  }
}

/**
 * Extract plan name from file path.
 */
export function getPlanName(planPath: string): string {
  return basename(planPath, ".md");
}

/**
 * Create a new ultrawork state for a plan.
 */
export function createUltraworkState(planPath: string, sessionId: string): UltraworkState {
  return {
    active_plan: planPath,
    started_at: new Date().toISOString(),
    session_ids: [sessionId],
    plan_name: getPlanName(planPath),
  };
}
