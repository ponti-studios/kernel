import { log } from "./logger";

export type HookTelemetryPhase =
  | "chat.message"
  | "tool.execute.before"
  | "tool.execute.after"
  | "event"
  | "experimental.chat.messages.transform";

const PHASE_BUDGET_MS: Record<HookTelemetryPhase, number> = {
  "chat.message": 100,
  "tool.execute.before": 75,
  "tool.execute.after": 100,
  event: 100,
  "experimental.chat.messages.transform": 100,
};

const HOOK_BUDGET_OVERRIDES_MS: Record<string, number> = {
  "tool.execute.before:orchestrator": 200,
  "tool.execute.after:orchestrator": 250,
  "event:orchestrator": 200,
  "event:ultrawork-loop": 150,
};

type Logger = (message: string, data?: unknown) => void;

export interface HookTelemetryInput<T> {
  phase: HookTelemetryPhase;
  hookName: string;
  invoke: () => Promise<T> | T;
  logger?: Logger;
  now?: () => number;
}

export function getHookBudgetMs(phase: HookTelemetryPhase, hookName: string): number {
  return HOOK_BUDGET_OVERRIDES_MS[`${phase}:${hookName}`] ?? PHASE_BUDGET_MS[phase];
}

export async function runHookWithTelemetry<T>({
  phase,
  hookName,
  invoke,
  logger = log,
  now = Date.now,
}: HookTelemetryInput<T>): Promise<T> {
  const key = `${phase}:${hookName}`;
  const budgetMs = getHookBudgetMs(phase, hookName);
  const startedAt = now();

  try {
    const result = await invoke();
    const durationMs = now() - startedAt;
    logger(`[hook-telemetry] ${key}`, {
      durationMs,
      budgetMs,
      overBudget: durationMs > budgetMs,
    });
    if (durationMs > budgetMs) {
      logger(`[hook-budget-exceeded] ${key}`, {
        durationMs,
        budgetMs,
        overByMs: durationMs - budgetMs,
      });
    }
    return result;
  } catch (error) {
    const durationMs = now() - startedAt;
    logger(`[hook-error] ${key}`, {
      durationMs,
      budgetMs,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
