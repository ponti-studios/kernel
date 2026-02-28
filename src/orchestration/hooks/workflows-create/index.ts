import { join } from "node:path";
import { existsSync } from "node:fs";
import { log } from "../../../integration/shared/logger";
import { updatePlanFile } from "../../../execution/task-queue/plan-parser";
import { saveOpenCodeTodos } from "../../hooks/claude-code-hooks/todo";
import type { Task, WorkflowTaskList } from "../../../execution/task-queue";

export const HOOK_NAME = "workflows-create";

interface WorkflowsCreateInput {
  sessionID: string;
  messageID?: string;
}

interface WorkflowsCreateOutput {
  parts: Array<{ type: string; text?: string }>;
}

/**
 * Extract feature/request description from prompt
 */
function extractFeatureDescription(promptText: string): string | null {
  // Look for user-request tags first
  const userRequestMatch = promptText.match(/<user-request>\s*([\s\S]*?)\s*<\/user-request>/i);
  if (userRequestMatch) {
    return userRequestMatch[1].trim();
  }

  // Look for the workflow task list already present
  const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const taskList = JSON.parse(jsonMatch[1]);
      if (taskList.tasks && Array.isArray(taskList.tasks)) {
        return null; // Already has task structure, skip
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Return first 500 chars of remaining text as description
  const text = promptText.replace(/<[^>]+>/g, "").trim();
  return text.length > 0 ? text : null;
}

/**
 * Extract existing tasks from prompt if already broken down
 */
function extractExistingTasks(promptText: string): Task[] | null {
  const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) return null;

  try {
    const taskList = JSON.parse(jsonMatch[1]);
    if (taskList.tasks && Array.isArray(taskList.tasks)) {
      return taskList.tasks;
    }
  } catch {
    // Not valid JSON
  }

  return null;
}

/**
 * Create workflow task list structure
 */
function createWorkflowTaskList(planName: string, tasks: Task[]): WorkflowTaskList {
  return {
    plan_id: `plan_${Date.now()}`,
    plan_name: planName,
    tasks,
    created_at: new Date().toISOString(),
    auto_parallelization: true,
  };
}

/**
 * Convert tasks to OpenCode todo format
 */
function tasksToOpenCodeTodos(tasks: Task[]) {
  return tasks.map((task, index) => ({
    id: task.id || `task-${index}`,
    content: `[${task.category || "unspecified"}] ${task.subject}${task.estimatedEffort ? ` (${task.estimatedEffort})` : ""}`,
    status: task.status || "pending",
    priority: task.category === "deep" || task.category === "artistry" ? "high" : "medium",
  }));
}

/**
 * Process extracted tasks and update plan file
 */
export async function processTasksForPlan(
  planPath: string,
  planName: string,
  tasks: Task[],
  sessionID: string,
): Promise<{
  success: boolean;
  taskList?: WorkflowTaskList;
  error?: string;
}> {
  if (!existsSync(planPath)) {
    return {
      success: false,
      error: `Plan file not found: ${planPath}`,
    };
  }

  try {
    // Create workflow task list structure
    const taskList = createWorkflowTaskList(planName, tasks);
    taskList.breakdown_at = new Date().toISOString();

    // Update plan file with task list
    await updatePlanFile(planPath, taskList);

    log(`[${HOOK_NAME}] Updated plan file with task list`, {
      sessionID,
      taskCount: tasks.length,
      planPath,
    });

    // Convert to OpenCode todo format and save
    const todos = tasksToOpenCodeTodos(tasks);
    saveOpenCodeTodos(sessionID, todos);

    log(`[${HOOK_NAME}] Saved ${todos.length} todos to OpenCode format`, {
      sessionID,
    });

    return { success: true, taskList };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`[${HOOK_NAME}] Failed to process tasks`, {
      sessionID,
      error: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

/**
 * Format task list as markdown code block
 */
function formatTaskListAsJson(taskList: WorkflowTaskList): string {
  return `\`\`\`json\n${JSON.stringify(taskList, null, 2)}\n\`\`\``;
}

/**
 * Build delegation prompt for planner agent
 */
function buildPlannerDelegationPrompt(featureDescription: string): string {
  return `## Task Breakdown Request

Please analyze this feature/requirement and break it down into concrete, implementable tasks:

### Feature Description
${featureDescription}

### Task Requirements

Generate a task list where each task:
1. Has a clear, specific title (subject)
2. Includes detailed description
3. Identifies dependencies (blockedBy, blocks arrays)
4. Suggests a delegation category (one of: visual-engineering, ultrabrain, quick, deep, artistry, writing, unspecified-low, unspecified-high)
5. Lists required skills if specialized
6. Estimates effort (e.g., "30m", "2h")

### Output Format

Return a JSON array of tasks with this exact structure:

\`\`\`json
[
  {
    "id": "task-1",
    "subject": "Task title",
    "description": "Detailed description",
    "category": "ultrabrain|quick|deep|visual-engineering|artistry|writing|unspecified-low|unspecified-high",
    "skills": ["skill1", "skill2"],
    "estimatedEffort": "30m",
    "status": "pending",
    "blocks": ["task-2"],
    "blockedBy": []
  }
]
\`\`\`

Focus on logical dependencies and parallelizable work. Independent tasks should have empty blockedBy arrays.`;
}

/**
 * Parse planner response to extract task array
 */
export function extractTasksFromPlannerResponse(responseText: string): Task[] | null {
  // Look for JSON array in response
  const jsonMatch = responseText.match(/\[[\s\S]*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) return null;

  try {
    const tasks = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(tasks)) return null;

    // Validate structure
    return tasks.filter((task) => {
      return (
        task.id &&
        task.subject &&
        task.description &&
        typeof task.blocks === "object" &&
        typeof task.blockedBy === "object"
      );
    });
  } catch {
    return null;
  }
}

export function createWorkflowsCreateHook() {
  return {
    "chat.message": async (
      input: WorkflowsCreateInput,
      output: WorkflowsCreateOutput,
    ): Promise<void> => {
      const parts = output.parts;
      const promptText =
        parts
          ?.filter((p) => p.type === "text" && p.text)
          .map((p) => p.text)
          .join("\n")
          .trim() || "";

      // Only trigger on workflows:create command
      const isWorkflowsCreateCommand =
        promptText.includes("workflows:create") && promptText.includes("<session-context>");

      if (!isWorkflowsCreateCommand) {
        return;
      }

      log(`[${HOOK_NAME}] Processing workflows:create command`, {
        sessionID: input.sessionID,
      });

      // Check if tasks already exist in prompt (from planner response)
      const existingTasks = extractExistingTasks(promptText);
      if (existingTasks && existingTasks.length > 0) {
        log(`[${HOOK_NAME}] Tasks already present in prompt, processing them`, {
          taskCount: existingTasks.length,
        });

        // Extract plan name from user request
        const planNameMatch = promptText.match(/<user-request>\s*([\s\S]*?)\s*<\/user-request>/i);
        if (!planNameMatch) {
          log(`[${HOOK_NAME}] Could not extract plan name from user request`, {
            sessionID: input.sessionID,
          });
          return;
        }

        const planName = planNameMatch[1].trim();
        const planPath = join(input.sessionID, "docs", "plans", `${planName}.md`);

        const result = await processTasksForPlan(
          planPath,
          planName,
          existingTasks,
          input.sessionID,
        );

        if (result.success && result.taskList) {
          // Inject formatted task list into output for user
          const formattedList = formatTaskListAsJson(result.taskList);
          if (parts) {
            parts.push({
              type: "text",
              text: `## Workflow Task Breakdown Complete\n\n${formattedList}`,
            });
          }
        }

        return;
      }

      // Extract feature description
      const featureDescription = extractFeatureDescription(promptText);
      if (!featureDescription) {
        log(`[${HOOK_NAME}] No feature description found, skipping`, {
          sessionID: input.sessionID,
        });
        return;
      }

      log(`[${HOOK_NAME}] Feature description extracted`, {
        descriptionLength: featureDescription.length,
        sessionID: input.sessionID,
      });

      // Build delegation prompt for planner
      const delegationPrompt = buildPlannerDelegationPrompt(featureDescription);

      // Inject instruction to delegate to planner
      const instruction = `
## Workflow Task Breakdown

${delegationPrompt}

---

**After receiving the task breakdown from the agent:**
1. Format tasks as JSON array
2. Invoke /workflows:create again with tasks (hook will process them)
3. Hook will: save tasks to plan, update ultrawork.json, return formatted execution plan

Once tasks are extracted, the workflow:create hook will automatically:
- Create WorkflowTaskList structure
- Update plan file with task metadata (breakdown_at timestamp)
- Save tasks as OpenCode todos for session tracking
- Return formatted task list for execution coordination
`;

      // Add instruction to output parts
      if (parts) {
        parts.push({
          type: "text",
          text: instruction,
        });
      }

      log(`[${HOOK_NAME}] Injected task breakdown instruction`, {
        sessionID: input.sessionID,
      });
    },
  };
}
