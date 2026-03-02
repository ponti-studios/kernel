import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { BackgroundManager, BackgroundTask } from "../../background-agent";
import type { BackgroundTaskArgs, BackgroundOutputArgs, BackgroundCancelArgs } from "./types";
import {
  BACKGROUND_TASK_DESCRIPTION,
  BACKGROUND_OUTPUT_DESCRIPTION,
  BACKGROUND_CANCEL_DESCRIPTION,
} from "./constants";
import {
  findNearestMessageWithFields,
  findFirstMessageWithAgent,
  MESSAGE_STORAGE,
} from "../../hook-message-injector";
import { getSessionAgent } from "../../session-state";
import { log } from "../../../integration/shared/logger";
import { consumeNewMessages } from "../../../integration/shared/session-cursor";

type OpencodeClient = PluginInput["client"];

function getMessageDir(sessionID: string): string | null {
  if (!existsSync(MESSAGE_STORAGE)) return null;

  const directPath = join(MESSAGE_STORAGE, sessionID);
  if (existsSync(directPath)) return directPath;

  for (const dir of readdirSync(MESSAGE_STORAGE)) {
    const sessionPath = join(MESSAGE_STORAGE, dir, sessionID);
    if (existsSync(sessionPath)) return sessionPath;
  }

  return null;
}

function formatDuration(start: Date, end?: Date): string {
  const duration = (end ?? new Date()).getTime() - start.getTime();
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

type ToolContextWithMetadata = {
  sessionID: string;
  messageID: string;
  agent: string;
  abort: AbortSignal;
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void;
};

export function createBackgroundTask(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: BACKGROUND_TASK_DESCRIPTION,
    args: {
      description: tool.schema.string().describe("Short task description (shown in status)"),
      prompt: tool.schema.string().describe("Full detailed prompt for the agent"),
      agent: tool.schema.string().describe("Agent type to use (any registered agent)"),
    },
    async execute(args: BackgroundTaskArgs, toolContext) {
      const ctx = toolContext as ToolContextWithMetadata;

      if (!args.agent || args.agent.trim() === "") {
        return `[ERROR] Agent parameter is required. Please specify which agent to use (e.g., "researcher-codebase", "researcher-world", "build", etc.)`;
      }

      try {
        const messageDir = getMessageDir(ctx.sessionID);
        const prevMessage = messageDir ? findNearestMessageWithFields(messageDir) : null;
        const firstMessageAgent = messageDir ? findFirstMessageWithAgent(messageDir) : null;
        const sessionAgent = getSessionAgent(ctx.sessionID);
        const parentAgent = ctx.agent ?? sessionAgent ?? firstMessageAgent ?? prevMessage?.agent;

        log("[background_task] parentAgent resolution", {
          sessionID: ctx.sessionID,
          ctxAgent: ctx.agent,
          sessionAgent,
          firstMessageAgent,
          prevMessageAgent: prevMessage?.agent,
          resolvedParentAgent: parentAgent,
        });

        const parentModel =
          prevMessage?.model?.providerID && prevMessage?.model?.modelID
            ? {
                providerID: prevMessage.model.providerID,
                modelID: prevMessage.model.modelID,
                ...(prevMessage.model.variant ? { variant: prevMessage.model.variant } : {}),
              }
            : undefined;

        const task = await manager.launch({
          description: args.description,
          prompt: args.prompt,
          agent: args.agent.trim(),
          parentSessionID: ctx.sessionID,
          parentMessageID: ctx.messageID,
          parentModel,
          parentAgent,
        });

        ctx.metadata?.({
          title: args.description,
          metadata: { sessionId: task.sessionID },
        });

        return `Background task launched successfully.

Task ID: ${task.id}
Session ID: ${task.sessionID}
Description: ${task.description}
Agent: ${task.agent}
Status: ${task.status}

The system will notify you when the task completes.
Use \`background_output\` tool with task_id="${task.id}" to check progress:
- block=false (default): Check status immediately - returns full status info
- block=true: Wait for completion (rarely needed since system notifies)`;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `[ERROR] Failed to launch background task: ${message}`;
      }
    },
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function formatTaskStatus(task: BackgroundTask): string {
  let duration: string;
  if (task.status === "pending" && task.queuedAt) {
    duration = formatDuration(task.queuedAt, undefined);
  } else if (task.startedAt) {
    duration = formatDuration(task.startedAt, task.completedAt);
  } else {
    duration = "N/A";
  }
  const promptPreview = truncateText(task.prompt, 500);

  let progressSection = "";
  if (task.progress?.lastTool) {
    progressSection = `\n| Last tool | ${task.progress.lastTool} |`;
  }

  let lastMessageSection = "";
  if (task.progress?.lastMessage) {
    const truncated = truncateText(task.progress.lastMessage, 500);
    const messageTime = task.progress.lastMessageAt
      ? task.progress.lastMessageAt.toISOString()
      : "N/A";
    lastMessageSection = `

## Last Message (${messageTime})

\`\`\`
${truncated}
\`\`\``;
  }

  let statusNote = "";
  if (task.status === "pending") {
    statusNote = `

> **Queued**: Task is waiting for a concurrency slot to become available.`;
  } else if (task.status === "running") {
    statusNote = `

> **Note**: No need to wait explicitly - the system will notify you when this task completes.`;
  } else if (task.status === "error") {
    statusNote = `

> **Failed**: The task encountered an error. Check the last message for details.`;
  }

  const durationLabel = task.status === "pending" ? "Queued for" : "Duration";

  return `# Task Status

| Field | Value |
|-------|-------|
| Task ID | \`${task.id}\` |
| Description | ${task.description} |
| Agent | ${task.agent} |
| Status | **${task.status}** |
| ${durationLabel} | ${duration} |
| Session ID | \`${task.sessionID}\` |${progressSection}
${statusNote}
## Original Prompt

\`\`\`
${promptPreview}
\`\`\`${lastMessageSection}`;
}

async function formatTaskResult(task: BackgroundTask, client: OpencodeClient): Promise<string> {
  if (!task.sessionID) {
    return `Error: Task has no sessionID`;
  }

  const messagesResult = await client.session.messages({
    path: { id: task.sessionID },
  });

  if (messagesResult.error) {
    return `Error fetching messages: ${messagesResult.error}`;
  }

  // Handle both SDK response structures: direct array or wrapped in .data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = ((messagesResult as any).data ?? messagesResult) as Array<{
    info?: { role?: string; time?: string };
    parts?: Array<{
      type?: string;
      text?: string;
      content?: string | Array<{ type: string; text?: string }>;
      name?: string;
    }>;
  }>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return `Task Result

Task ID: ${task.id}
Description: ${task.description}
Duration: ${formatDuration(task.startedAt ?? new Date(), task.completedAt)}
Session ID: ${task.sessionID}

---

(No messages found)`;
  }

  // Include both assistant messages AND tool messages
  // Tool results (grep, glob, bash output) come from role "tool"
  const relevantMessages = messages.filter(
    (m) => m.info?.role === "assistant" || m.info?.role === "tool",
  );

  if (relevantMessages.length === 0) {
    return `Task Result

Task ID: ${task.id}
Description: ${task.description}
Duration: ${formatDuration(task.startedAt ?? new Date(), task.completedAt)}
Session ID: ${task.sessionID}

---

(No assistant or tool response found)`;
  }

  // Sort by time ascending (oldest first) to process messages in order
  const sortedMessages = [...relevantMessages].sort((a, b) => {
    const timeA = String((a as { info?: { time?: string } }).info?.time ?? "");
    const timeB = String((b as { info?: { time?: string } }).info?.time ?? "");
    return timeA.localeCompare(timeB);
  });

  const newMessages = consumeNewMessages(task.sessionID, sortedMessages);
  if (newMessages.length === 0) {
    const duration = formatDuration(task.startedAt ?? new Date(), task.completedAt);
    return `Task Result

Task ID: ${task.id}
Description: ${task.description}
Duration: ${duration}
Session ID: ${task.sessionID}

---

(No new output since last check)`;
  }

  // Extract content from ALL messages, not just the last one
  // Tool results may be in earlier messages while the final message is empty
  const extractedContent: string[] = [];

  for (const message of newMessages) {
    for (const part of message.parts ?? []) {
      // Handle both "text" and "reasoning" parts (thinking models use "reasoning")
      if ((part.type === "text" || part.type === "reasoning") && part.text) {
        extractedContent.push(part.text);
      } else if (part.type === "tool_result") {
        // Tool results contain the actual output from tool calls
        const toolResult = part as { content?: string | Array<{ type: string; text?: string }> };
        if (typeof toolResult.content === "string" && toolResult.content) {
          extractedContent.push(toolResult.content);
        } else if (Array.isArray(toolResult.content)) {
          // Handle array of content blocks
          for (const block of toolResult.content) {
            // Handle both "text" and "reasoning" parts (thinking models use "reasoning")
            if ((block.type === "text" || block.type === "reasoning") && block.text) {
              extractedContent.push(block.text);
            }
          }
        }
      }
    }
  }

  const textContent = extractedContent.filter((text) => text.length > 0).join("\n\n");

  const duration = formatDuration(task.startedAt ?? new Date(), task.completedAt);

  return `Task Result

Task ID: ${task.id}
Description: ${task.description}
Duration: ${duration}
Session ID: ${task.sessionID}

---

${textContent || "(No text output)"}`;
}

export function createBackgroundOutput(
  manager: BackgroundManager,
  client: OpencodeClient,
): ToolDefinition {
  return tool({
    description: BACKGROUND_OUTPUT_DESCRIPTION,
    args: {
      task_id: tool.schema.string().describe("Task ID to get output from"),
      block: tool.schema
        .boolean()
        .optional()
        .describe(
          "Wait for completion (default: false). System notifies when done, so blocking is rarely needed.",
        ),
      timeout: tool.schema
        .number()
        .optional()
        .describe("Max wait time in ms (default: 60000, max: 600000)"),
    },
    async execute(args: BackgroundOutputArgs) {
      try {
        const task = manager.getTask(args.task_id);
        if (!task) {
          return `Task not found: ${args.task_id}`;
        }

        const shouldBlock = args.block === true;
        const timeoutMs = Math.min(args.timeout ?? 60000, 600000);

        // Already completed: return result immediately (regardless of block flag)
        if (task.status === "completed") {
          return await formatTaskResult(task, client);
        }

        // Error or cancelled: return status immediately
        if (task.status === "error" || task.status === "cancelled") {
          return formatTaskStatus(task);
        }

        // Non-blocking and still running: return status
        if (!shouldBlock) {
          return formatTaskStatus(task);
        }

        // Blocking: poll until completion or timeout
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
          await delay(1000);

          const currentTask = manager.getTask(args.task_id);
          if (!currentTask) {
            return `Task was deleted: ${args.task_id}`;
          }

          if (currentTask.status === "completed") {
            return await formatTaskResult(currentTask, client);
          }

          if (currentTask.status === "error" || currentTask.status === "cancelled") {
            return formatTaskStatus(currentTask);
          }
        }

        // Timeout exceeded: return current status
        const finalTask = manager.getTask(args.task_id);
        if (!finalTask) {
          return `Task was deleted: ${args.task_id}`;
        }
        return `Timeout exceeded (${timeoutMs}ms). Task still ${finalTask.status}.\n\n${formatTaskStatus(finalTask)}`;
      } catch (error) {
        return `Error getting output: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

export function createBackgroundCancel(
  manager: BackgroundManager,
  client: OpencodeClient,
): ToolDefinition {
  return tool({
    description: BACKGROUND_CANCEL_DESCRIPTION,
    args: {
      taskId: tool.schema.string().optional().describe("Task ID to cancel (required if all=false)"),
      all: tool.schema
        .boolean()
        .optional()
        .describe("Cancel all running background tasks (default: false)"),
    },
    async execute(args: BackgroundCancelArgs, toolContext) {
      try {
        const cancelAll = args.all === true;

        if (!cancelAll && !args.taskId) {
          return `[ERROR] Invalid arguments: Either provide a taskId or set all=true to cancel all running tasks.`;
        }

        if (cancelAll) {
          const tasks = manager.getAllDescendantTasks(toolContext.sessionID);
          const cancellableTasks = tasks.filter(
            (t) => t.status === "running" || t.status === "pending",
          );

          if (cancellableTasks.length === 0) {
            return `No running or pending background tasks to cancel.`;
          }

          const cancelledInfo: Array<{
            id: string;
            description: string;
            status: string;
            sessionID?: string;
          }> = [];

          for (const task of cancellableTasks) {
            if (task.status === "pending") {
              manager.cancelPendingTask(task.id);
              cancelledInfo.push({
                id: task.id,
                description: task.description,
                status: "pending",
                sessionID: undefined,
              });
            } else if (task.sessionID) {
              client.session
                .abort({
                  path: { id: task.sessionID },
                })
                .catch(() => {});

              task.status = "cancelled";
              task.completedAt = new Date();
              cancelledInfo.push({
                id: task.id,
                description: task.description,
                status: "running",
                sessionID: task.sessionID,
              });
            }
          }

          const tableRows = cancelledInfo
            .map(
              (t) =>
                `| \`${t.id}\` | ${t.description} | ${t.status} | ${t.sessionID ? `\`${t.sessionID}\`` : "(not started)"} |`,
            )
            .join("\n");

          const resumableTasks = cancelledInfo.filter((t) => t.sessionID);
          const resumeSection =
            resumableTasks.length > 0
              ? `\n## Continue Instructions

To continue a cancelled task, use:
\`\`\`
delegate_task(session_id="<session_id>", prompt="Continue: <your follow-up>")
\`\`\`

Continuable sessions:
${resumableTasks.map((t) => `- \`${t.sessionID}\` (${t.description})`).join("\n")}`
              : "";

          return `Cancelled ${cancellableTasks.length} background task(s):

| Task ID | Description | Status | Session ID |
|---------|-------------|--------|------------|
${tableRows}
${resumeSection}`;
        }

        const task = manager.getTask(args.taskId!);
        if (!task) {
          return `[ERROR] Task not found: ${args.taskId}`;
        }

        if (task.status !== "running" && task.status !== "pending") {
          return `[ERROR] Cannot cancel task: current status is "${task.status}".
Only running or pending tasks can be cancelled.`;
        }

        if (task.status === "pending") {
          // Pending task: use manager method (no session to abort, no slot to release)
          const cancelled = manager.cancelPendingTask(task.id);
          if (!cancelled) {
            return `[ERROR] Failed to cancel pending task: ${task.id}`;
          }

          return `Pending task cancelled successfully

Task ID: ${task.id}
Description: ${task.description}
Status: ${task.status}`;
        }

        // Running task: abort session
        // Fire-and-forget: abort 요청을 보내고 await 하지 않음
        // await 하면 메인 세션까지 abort 되는 문제 발생
        if (task.sessionID) {
          client.session
            .abort({
              path: { id: task.sessionID },
            })
            .catch(() => {});
        }

        task.status = "cancelled";
        task.completedAt = new Date();

        return `Task cancelled successfully

Task ID: ${task.id}
Description: ${task.description}
Session ID: ${task.sessionID}
Status: ${task.status}`;
      } catch (error) {
        return `[ERROR] Error cancelling task: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

export function createBackgroundTaskList(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: `List background tasks with optional filtering.

Returns information about background tasks, filtered by parent session or status.

Arguments:
- parent_session_id (optional): Filter by parent session ID
- status (optional): Filter by status - "pending", "running", "completed", "error", "cancelled"

Example:
background_task_list(parent_session_id="ses_abc123")
Lists all tasks for a specific session`,
    args: {
      parent_session_id: tool.schema.string().optional().describe("Filter by parent session ID"),
      status: tool.schema
        .enum(["pending", "running", "completed", "error", "cancelled"])
        .optional()
        .describe("Filter by status"),
    },
    execute: async (args: { parent_session_id?: string; status?: string }, toolContext) => {
      const ctx = toolContext as { sessionID: string };

      try {
        let tasks: BackgroundTask[];

        if (args.parent_session_id) {
          tasks = manager.getTasksByParentSession(args.parent_session_id);
        } else {
          tasks = manager.getTasksByParentSession(ctx.sessionID);
        }

        if (args.status) {
          tasks = tasks.filter((t) => t.status === args.status);
        }

        if (tasks.length === 0) {
          return `No background tasks found${args.parent_session_id ? ` for session ${args.parent_session_id}` : ""}`;
        }

        let result = `Background Tasks:\n\n`;

        const statusEmoji: Record<string, string> = {
          pending: "⏳",
          running: "🔄",
          completed: "✅",
          error: "❌",
          cancelled: "🚫",
        };

        for (const task of tasks) {
          const emoji = statusEmoji[task.status] || "?";
          const duration =
            task.startedAt && task.completedAt
              ? formatDuration(task.startedAt, task.completedAt)
              : task.startedAt
                ? formatDuration(task.startedAt)
                : "-";

          result += `[${emoji}] \`${task.id}\`\n`;
          result += `  Description: ${task.description}\n`;
          result += `  Agent: ${task.agent}\n`;
          result += `  Status: ${task.status}\n`;
          result += `  Duration: ${duration}\n`;

          if (task.error) {
            result += `  Error: ${task.error.substring(0, 100)}...\n`;
          }

          result += "\n";
        }

        // Summary
        const counts = {
          pending: tasks.filter((t) => t.status === "pending").length,
          running: tasks.filter((t) => t.status === "running").length,
          completed: tasks.filter((t) => t.status === "completed").length,
          error: tasks.filter((t) => t.status === "error").length,
          cancelled: tasks.filter((t) => t.status === "cancelled").length,
        };

        result += `---\n`;
        result += `Total: ${tasks.length} | Pending: ${counts.pending} | Running: ${counts.running} | Completed: ${counts.completed} | Error: ${counts.error} | Cancelled: ${counts.cancelled}`;

        return result;
      } catch (error) {
        return `[ERROR] Error listing tasks: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

export function createBackgroundTaskInfo(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: `Get detailed information about a specific background task.

Returns full task metadata including status, timing, agent, and output.

Arguments:
- task_id (required): Task ID to inspect

Example:
background_task_info(task_id="task_abc123")`,
    args: {
      task_id: tool.schema.string().describe("Task ID to inspect"),
    },
    execute: async (args: { task_id: string }) => {
      try {
        const task = manager.getTask(args.task_id);

        if (!task) {
          return `[ERROR] Task not found: ${args.task_id}`;
        }

        const statusEmoji: Record<string, string> = {
          pending: "⏳",
          running: "🔄",
          completed: "✅",
          error: "❌",
          cancelled: "🚫",
        };

        const emoji = statusEmoji[task.status] || "?";
        const duration =
          task.startedAt && task.completedAt
            ? formatDuration(task.startedAt, task.completedAt)
            : task.startedAt
              ? formatDuration(task.startedAt)
              : "-";

        let result = `Task: ${args.task_id}\n`;
        result += `${emoji} Status: ${task.status}\n\n`;
        result += `**Description:** ${task.description}\n`;
        result += `**Agent:** ${task.agent}\n`;
        result += `**Parent Session:** ${task.parentSessionID}\n`;

        if (task.sessionID) {
          result += `**Task Session:** ${task.sessionID}\n`;
        }

        result += `\n**Timing:**\n`;
        result += `- Queued: ${task.queuedAt?.toISOString() || "-"}\n`;
        result += `- Started: ${task.startedAt?.toISOString() || "-"}\n`;
        result += `- Completed: ${task.completedAt?.toISOString() || "-"}\n`;
        result += `- Duration: ${duration}\n`;

        if (task.error) {
          result += `\n**Error:**\n${task.error}\n`;
        }

        if (task.result) {
          result += `\n**Result:**\n${task.result.substring(0, 500)}${task.result.length > 500 ? "..." : ""}\n`;
        }

        if (task.progress) {
          result += `\n**Progress:**\n`;
          result += `- Tool Calls: ${task.progress.toolCalls}\n`;
          if (task.progress.lastTool) {
            result += `- Last Tool: ${task.progress.lastTool}\n`;
          }
          if (task.progress.lastMessage) {
            result += `- Last Message: ${task.progress.lastMessage.substring(0, 100)}...\n`;
          }
        }

        return result;
      } catch (error) {
        return `[ERROR] Error getting task info: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

export function createBackgroundTaskUpdate(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: `Update a background task - retry failed tasks or pause/resume.

Allows retrying failed tasks or resuming paused tasks.

Arguments:
- task_id (required): Task ID to update
- operation (required): Operation - "retry", "pause", "resume"
- reason (optional): Reason for the operation

Example:
background_task_update(task_id="task_abc123", operation="retry", reason="Fixed the file issue")`,
    args: {
      task_id: tool.schema.string().describe("Task ID to update"),
      operation: tool.schema.enum(["retry", "pause", "resume"]).describe("Operation to perform"),
      reason: tool.schema.string().optional().describe("Reason for the operation"),
    },
    execute: async (args: {
      task_id: string;
      operation: "retry" | "pause" | "resume";
      reason?: string;
    }) => {
      try {
        const task = manager.getTask(args.task_id);

        if (!task) {
          return `[ERROR] Task not found: ${args.task_id}`;
        }

        switch (args.operation) {
          case "retry":
            if (
              task.status !== "error" &&
              task.status !== "cancelled" &&
              task.status !== "completed"
            ) {
              return `[ERROR] Can only retry tasks with status: error, cancelled, or completed. Current: ${task.status}`;
            }

            await manager.launch({
              description: `Retry of ${task.description}`,
              prompt: task.prompt,
              agent: task.agent,
              parentSessionID: task.parentSessionID,
              parentMessageID: task.parentMessageID,
              parentModel: task.parentModel,
              parentAgent: task.parentAgent,
              model: task.model,
            });

            return `Task has been restarted

Original Description: ${task.description}
Agent: ${task.agent}
New Status: running`;

          case "pause":
            if (task.status !== "running") {
              return `[ERROR] Can only pause running tasks. Current: ${task.status}`;
            }

            if (task.sessionID) {
              return `[ERROR] Pause not implemented - task is running in session ${task.sessionID}. Use background_task_cancel instead.`;
            }

            return `[ERROR] Pause not supported for this task type`;

          case "resume":
            if (task.status !== "pending") {
              return `[ERROR] Can only resume pending tasks. Current: ${task.status}`;
            }

            if (!task.sessionID) {
              return `[ERROR] Task has no session to resume`;
            }

            await manager.resume({
              sessionId: task.sessionID,
              prompt: task.prompt,
              parentSessionID: task.parentSessionID,
              parentMessageID: task.parentMessageID,
              parentModel: task.parentModel,
              parentAgent: task.parentAgent,
            });

            return `Task ${task.id} has been resumed

Description: ${task.description}
Agent: ${task.agent}
New Status: running`;

          default:
            return `[ERROR] Unknown operation: ${args.operation}`;
        }
      } catch (error) {
        return `[ERROR] Error updating task: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
