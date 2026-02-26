import type { PluginInput } from "@opencode-ai/plugin";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { log } from "../../../integration/shared/logger";
import {
  parsePlanFile,
  updatePlanFile,
  validateTaskDependencies,
  hasCircularDependency,
} from "../../../execution/features/task-queue/plan-parser";
import { resolvePlanArtifactRef } from "../../../execution/features/workflow-artifacts/store";
import {
  calculateExecutionWaves,
  applyAutoWaves,
  getTasksByWave,
} from "../../../execution/features/task-queue/parallelization";
import {
  buildTaskDelegationPlan,
  buildTaskDelegationPrompt,
  getTaskDelegationConfig,
} from "../../../execution/features/task-queue/delegation-engine";
import type { Task, WorkflowTaskList } from "../../../execution/features/task-queue";

export const HOOK_NAME = "workflows-execute";

interface WorkflowsExecuteInput {
  sessionID: string;
  messageID?: string;
}

interface WorkflowsExecuteOutput {
  parts: Array<{ type: string; text?: string }>;
}

/**
 * Extract plan file path from prompt
 * Supports: "/workflows:execute path/to/plan.md" or just "path/to/plan.md"
 */
function extractPlanFilePath(promptText: string): string | null {
  // Match: /workflows:execute /path/to/file.md
  const match = promptText.match(/\/workflows:execute\s+([^\s\n<]+(?:\.md)?)/i);
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
 * Format execution plan as structured instruction
 */
function formatExecutionInstruction(plan: WorkflowTaskList, delegationPlan: any): string {
  const waves = getTasksByWave(plan.tasks);

  return `## Workflow Execution Plan

**Plan**: ${plan.plan_name}  
**Total Tasks**: ${plan.tasks.length}  
**Total Waves**: ${waves.length}  

### Wave Breakdown

${waves
  .map(
    (waveTasks, idx) => `
#### Wave ${idx + 1} (${waveTasks.length} tasks)
${waveTasks
  .map(
    (task) => `
- **${task.subject}** (\`${task.id}\`)
  - Category: ${task.category || "unspecified-high"}
  - Effort: ${task.estimatedEffort || "unknown"}
  - Status: ${task.status}
`,
  )
  .join("")}
`,
  )
  .join("")}

### Task Dependencies

${plan.tasks
  .filter((t) => t.blockedBy && t.blockedBy.length > 0)
  .map(
    (t) => `
- **${t.subject}** blocked by: ${t.blockedBy?.join(", ") || "none"}
`,
  )
  .join("")}

### Delegation Instructions

Each task will be delegated to subagents by category:

${Object.entries(delegationPlan.tasksByCategory)
  .filter(([, count]: [string, unknown]) => (count as number) > 0)
  .map(([category, count]: [string, unknown]) => `- **${category}**: ${count} task(s)`)
  .join("\n")}

---

## Execute Workflow

For each wave in sequence:
1. Identify executable tasks (all dependencies completed)
2. Delegate to appropriate subagent using task category and skills
3. Track task status and update plan file
4. Advance to next wave when current wave completes

Use \`delegate_task(category=..., load_skills=..., description=..., prompt=...)\` for each task.
`;
}

/**
 * Build detailed delegation instructions for a task
 */
function buildDetailedTaskDelegation(task: Task, workflowContext: string): string {
  const config = getTaskDelegationConfig(task);
  const skills = [...config.skills, ...(task.skills || [])];

  const prompt = buildTaskDelegationPrompt(task, workflowContext);

  return `
### Task Delegation: ${task.id}

**Category**: ${task.category || "unspecified-high"}  
**Skills**: ${skills.join(", ") || "none specified"}  
**Effort**: ${task.estimatedEffort || "unknown"}  

${prompt}

---
`;
}

/**
 * Create the workflows:execute hook handler
 */
export function createWorkflowsExecuteHook(ctx: PluginInput) {
  return {
    "chat.message": async (
      input: WorkflowsExecuteInput,
      output: WorkflowsExecuteOutput,
    ): Promise<void> => {
      const parts = output.parts;
      const promptText =
        parts
          ?.filter((p) => p.type === "text" && p.text)
          .map((p) => p.text)
          .join("\n")
          .trim() || "";

      // Only trigger on workflows:execute command
      const isWorkflowsExecuteCommand =
        promptText.includes("workflows:execute") || promptText.includes("execute");

      if (!isWorkflowsExecuteCommand) {
        return;
      }

      log(`[${HOOK_NAME}] Processing workflows:execute command`, {
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

        // Validate task dependencies
        const validation = validateTaskDependencies(plan.tasks);
        if (!validation.valid) {
          log(`[${HOOK_NAME}] Task dependency validation failed`, {
            errors: validation.errors,
            sessionID: input.sessionID,
          });

          if (parts) {
            parts.push({
              type: "text",
              text: `❌ Task validation failed:\n${validation.errors.join("\n")}`,
            });
          }
          return;
        }

        // Check for circular dependencies
        if (hasCircularDependency(plan.tasks)) {
          log(`[${HOOK_NAME}] Circular dependencies detected`, {
            sessionID: input.sessionID,
          });

          if (parts) {
            parts.push({
              type: "text",
              text: "❌ Circular dependencies detected in task graph. Cannot proceed.",
            });
          }
          return;
        }

        // Apply automatic wave calculation
        const tasksWithWaves = applyAutoWaves(plan.tasks);
        log(`[${HOOK_NAME}] Execution waves calculated`, {
          waveCount: Math.max(...tasksWithWaves.map((t) => t.wave || 1)),
          sessionID: input.sessionID,
        });

        // Build delegation plan
        const delegationPlan = buildTaskDelegationPlan(tasksWithWaves);

        // Update plan with waves and execution state
        const updatedPlan: WorkflowTaskList = {
          ...plan,
          tasks: tasksWithWaves,
          executed_at: new Date().toISOString(),
        };

        // Save updated plan with wave information
        await updatePlanFile(effectivePlanPath, updatedPlan);
        log(`[${HOOK_NAME}] Plan file updated with wave assignments`, {
          sessionID: input.sessionID,
        });

        // Format execution instruction
        const executionInstruction = formatExecutionInstruction(updatedPlan, delegationPlan);

        // Build individual task delegations
        const taskDelegations = tasksWithWaves
          .map((task, idx) => {
            const waveInfo = `Wave ${task.wave || 1}/${Math.max(...tasksWithWaves.map((t) => t.wave || 1))}`;
            const contextStr = `${waveInfo} - Task ${idx + 1}/${tasksWithWaves.length}`;
            return buildDetailedTaskDelegation(task, contextStr);
          })
          .join("\n");

        // Inject complete execution instructions to output
        if (parts) {
          parts.push({
            type: "text",
            text: executionInstruction,
          });

          parts.push({
            type: "text",
            text: `## Detailed Task Delegations\n${taskDelegations}`,
          });

          parts.push({
            type: "text",
            text: `## Execution Instructions

For each task in the current wave:

1. **Determine task executable status**:
   - Check if all \`blockedBy\` dependencies are completed
   - If dependencies not met, skip to next pending task

2. **Delegate task**:
   \`\`\`
   delegate_task(
     category: "${tasksWithWaves[0]?.category || "quick"}",
     load_skills: ["${(tasksWithWaves[0]?.skills || []).join('", "')}"],
     description: "Execute task {task-id}: {subject}",
     prompt: "{task description with dependencies}"
   )
   \`\`\`

3. **Track completion**:
   - Update task status to "completed" in plan file
   - Record completion time
   - Check if wave is complete

4. **Advance to next wave**:
   - When all tasks in current wave complete, move to next wave
   - Check remaining pending tasks for executable status

5. **Final completion**:
   - When all waves complete, run: \`/workflows:complete ${effectivePlanPath}\`

---

**Session ID**: ${input.sessionID}  
**Plan**: ${effectivePlanPath}  
**Started**: ${new Date().toISOString()}  
`,
          });
        }

        log(`[${HOOK_NAME}] Execution instructions injected`, {
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
            text: `❌ Error processing plan: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
    },
  };
}
