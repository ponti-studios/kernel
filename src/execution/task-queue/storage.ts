import { join, dirname } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from "fs";
import { homedir } from "os";
import type { z } from "zod";
import type { GhostwireConfig } from "../../platform/config/schema";

export function getTaskDir(listId: string, config: Partial<GhostwireConfig>): string {
  const tasksConfig = config.operator?.tasks;

  if (tasksConfig?.claude_code_compat) {
    return join(homedir(), ".cache", "claude-code", "tasks", listId);
  }

  const storagePath = tasksConfig?.storage_path ?? "docs/tasks";
  return join(process.cwd(), storagePath, listId);
}

export function getTaskPath(
  listId: string,
  taskId: string,
  config: Partial<GhostwireConfig>,
): string {
  return join(getTaskDir(listId, config), `${taskId}.json`);
}

export function getTeamDir(teamName: string, config: Partial<GhostwireConfig>): string {
  const swarmConfig = config.operator?.swarm;

  if (swarmConfig?.storage_path?.includes("claude")) {
    return join(homedir(), ".claude", "teams", teamName);
  }

  const storagePath = swarmConfig?.storage_path ?? "docs/teams";
  return join(process.cwd(), storagePath, teamName);
}

export function getInboxPath(
  teamName: string,
  agentName: string,
  config: Partial<GhostwireConfig>,
): string {
  return join(getTeamDir(teamName, config), "inboxes", `${agentName}.json`);
}

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function readJsonSafe<T>(filePath: string, schema: z.ZodType<T>): T | null {
  try {
    if (!existsSync(filePath)) {
      return null;
    }

    const content = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    const result = schema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export function writeJsonAtomic(filePath: string, data: unknown): void {
  const dir = dirname(filePath);
  ensureDir(dir);

  const tempPath = `${filePath}.tmp.${Date.now()}`;

  try {
    writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    renameSync(tempPath, filePath);
  } catch (error) {
    try {
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
