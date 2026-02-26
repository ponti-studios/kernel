import type { PluginInput } from "@opencode-ai/plugin";
import { existsSync } from "node:fs";
import { log } from "../../../integration/shared/logger";
import { parsePlanFile } from "../../../execution/features/task-queue/plan-parser";
import { getTasksByWave } from "../../../execution/features/task-queue/parallelization";
import type { Task } from "../../../execution/features/task-queue";
import { resolvePlanArtifactRef } from "../../../execution/features/workflow-artifacts/store";

export const HOOK_NAME = "workflows-status";

interface WorkflowsStatusInput {
  sessionID: string;
  messageID?: string;
}

interface WorkflowsStatusOutput {
  parts: Array<{ type: string; text?: string }>;
}

/**
 * Extract plan file path from prompt
 */
function extractPlanFilePath(promptText: string): string | null {
  // Match: /workflows:status /path/to/file.md
  const match = promptText.match(/\/workflows:status\s+([^\s\n<]+(?:\.md)?)/i);
  if (match && match[1]) {
    return match[1];
  }

  // If no explicit path, try to find plan reference
  const planMatch = promptText.match(/(?:plan|file):\s*([^\s\n<]+\.md)/i);
  if (planMatch && planMatch[1]) {
    return planMatch[1];
  }

  return null;
}

/**
 * Calculate workflow progress metrics
 */
interface WorkflowMetrics {
  completed: number;
  inProgress: number;
  failed: number;
  pending: number;
  total: number;
  percentage: number;
  currentWave: number;
  totalWaves: number;
  estimatedRemaining: string;
}

function calculateMetrics(tasks: Task[]): WorkflowMetrics {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const failed = 0; // Not yet tracked in Task schema
  const pending = tasks.filter((t) => t.status === "pending").length;
  const total = tasks.length;

  // Calculate current wave
  const maxWave = Math.max(...tasks.map((t) => t.wave || 1), 1);
  const completedWaves = new Set<number>();
  for (const task of tasks) {
    if (task.status === "completed") {
      completedWaves.add(task.wave || 1);
    }
  }
  const currentWave = Math.min(
    maxWave,
    completedWaves.size > 0 ? Math.max(...Array.from(completedWaves)) + 1 : 1,
  );

  // Estimate remaining time (based on effort estimates of pending/in-progress tasks)
  const remainingEffort = [...tasks]
    .filter((t) => t.status === "pending" || t.status === "in_progress")
    .reduce((sum, t) => {
      if (!t.estimatedEffort) return sum;
      const match = t.estimatedEffort.match(/(\d+)([mh])/);
      if (!match) return sum;
      const [, value, unit] = match;
      const minutes = parseInt(value, 10) * (unit === "h" ? 60 : 1);
      return sum + minutes;
    }, 0);

  const hours = Math.floor(remainingEffort / 60);
  const mins = remainingEffort % 60;
  const estimatedRemaining = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    completed,
    inProgress,
    failed,
    pending,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    currentWave: Math.min(currentWave, maxWave),
    totalWaves: maxWave,
    estimatedRemaining,
  };
}

/**
 * Build readable progress bar
 */
function buildProgressBar(metrics: WorkflowMetrics): string {
  const barLength = 20;
  const filledLength = Math.round((barLength * metrics.percentage) / 100);
  const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
  return `[${bar}] ${metrics.percentage}%`;
}

/**
 * Format status report
 */
function formatStatusReport(planPath: string, metrics: WorkflowMetrics, tasks: Task[]): string {
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const pendingTasks = tasks.filter((t) => t.status === "pending");

  // Suggest next action
  let nextAction = "";
  if (metrics.percentage === 100) {
    nextAction = `Run: \`/ghostwire:workflows:complete ${planPath}\``;
  } else if (metrics.inProgress > 0) {
    nextAction = `Wave ${metrics.currentWave} in progress. Check back soon, or run: \`/ghostwire:workflows:execute ${planPath}\` to continue`;
  } else if (metrics.pending > 0) {
    nextAction = `Run: \`/ghostwire:workflows:execute ${planPath}\` to start next wave`;
  } else {
    nextAction = "Workflow ready to complete";
  }

  const report = `
## Workflow Status

**Plan**: ${planPath}

${buildProgressBar(metrics)}

### Progress Summary
- **Completed**: ${metrics.completed}/${metrics.total} tasks
- **In Progress**: ${metrics.inProgress} tasks
- **Pending**: ${metrics.pending} tasks
- **Current Wave**: ${metrics.currentWave}/${metrics.totalWaves}
- **Estimated Remaining**: ${metrics.estimatedRemaining}

### Completed Tasks (${completedTasks.length})
${
  completedTasks.length > 0
    ? completedTasks.map((t) => `- ✅ **${t.subject}** (\`${t.id}\`)`).join("\n")
    : "None yet"
}

### In Progress Tasks (${inProgressTasks.length})
${
  inProgressTasks.length > 0
    ? inProgressTasks.map((t) => `- ⏳ **${t.subject}** (\`${t.id}\`)`).join("\n")
    : "None"
}

### Pending Tasks (${pendingTasks.length})
${
  pendingTasks.length > 0
    ? pendingTasks
        .map((t) => {
          const blockedBy = t.blockedBy && t.blockedBy.length > 0;
          const icon = blockedBy ? "🔒" : "⭕";
          const blockInfo = blockedBy ? ` (blocked by: ${t.blockedBy?.join(", ")})` : "";
          return `- ${icon} **${t.subject}** (\`${t.id}\`)${blockInfo}`;
        })
        .join("\n")
    : "None"
}

### Next Action
${nextAction}

---

**Last Check**: ${new Date().toISOString()}
`.trim();

  return report;
}

/**
 * Create the workflows:status hook handler
 */
export function createWorkflowsStatusHook(ctx: PluginInput) {
  return {
    "chat.message": async (
      input: WorkflowsStatusInput,
      output: WorkflowsStatusOutput,
    ): Promise<void> => {
      const parts = output.parts;
      const promptText =
        parts
          ?.filter((p) => p.type === "text" && p.text)
          .map((p) => p.text)
          .join("\n")
          .trim() || "";

      // Only trigger on workflows:status command
      const isWorkflowsStatusCommand =
        promptText.includes("workflows:status") ||
        (promptText.includes("status") && promptText.includes("workflow"));

      if (!isWorkflowsStatusCommand) {
        return;
      }

      log(`[${HOOK_NAME}] Processing workflows:status command`, {
        sessionID: input.sessionID,
      });

      // Extract plan file path
      const planPath = extractPlanFilePath(promptText);
      if (!planPath) {
        log(`[${HOOK_NAME}] No plan file path found in prompt`, {
          sessionID: input.sessionID,
        });
        return;
      }

      const resolvedPlan = resolvePlanArtifactRef(ctx.directory, planPath);
      const effectivePlanPath = resolvedPlan.path;

      log(`[${HOOK_NAME}] Plan file path extracted: ${effectivePlanPath}`, {
        sessionID: input.sessionID,
      });

      // Check if plan file exists
      if (!existsSync(effectivePlanPath)) {
        log(`[${HOOK_NAME}] Plan file not found: ${effectivePlanPath}`, {
          sessionID: input.sessionID,
        });

        if (parts) {
          parts.push({
            type: "text",
            text: `❌ Plan file not found: ${effectivePlanPath}`,
          });
        }
        return;
      }

      try {
        // Parse plan file
        const plan = await parsePlanFile(effectivePlanPath);

        log(`[${HOOK_NAME}] Plan file parsed successfully`, {
          taskCount: plan.tasks.length,
          sessionID: input.sessionID,
        });

        // Calculate metrics
        const metrics = calculateMetrics(plan.tasks);

        log(`[${HOOK_NAME}] Metrics calculated`, {
          completed: metrics.completed,
          inProgress: metrics.inProgress,
          pending: metrics.pending,
          currentWave: metrics.currentWave,
          sessionID: input.sessionID,
        });

        // Format status report
        const report = formatStatusReport(effectivePlanPath, metrics, plan.tasks);

        // Inject status report to output
        if (parts) {
          parts.push({
            type: "text",
            text: report,
          });
        }

        log(`[${HOOK_NAME}] Status report injected`, {
          sessionID: input.sessionID,
        });
      } catch (error) {
        log(`[${HOOK_NAME}] Error processing plan file`, {
          error: error instanceof Error ? error.message : String(error),
          sessionID: input.sessionID,
        });

        if (parts) {
          parts.push({
            type: "text",
            text: `❌ Error reading plan: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
    },
  };
}
