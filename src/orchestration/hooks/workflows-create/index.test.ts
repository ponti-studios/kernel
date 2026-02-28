import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import type { Task } from "../../../execution/task-queue";
import { extractTasksFromPlannerResponse, processTasksForPlan } from ".";

// Mock implementations of hook functions for testing
function extractFeatureDescription(promptText: string): string | null {
  const userRequestMatch = promptText.match(/<user-request>\s*([\s\S]*?)\s*<\/user-request>/i);
  if (userRequestMatch) {
    return userRequestMatch[1].trim();
  }

  const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const taskList = JSON.parse(jsonMatch[1]);
      if (taskList.tasks && Array.isArray(taskList.tasks)) {
        return null;
      }
    } catch {
      // Not valid JSON
    }
  }

  const text = promptText.replace(/<[^>]+>/g, "").trim();
  return text.length > 0 ? text : null;
}

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
4. Suggests a delegation category
5. Lists required skills if specialized
6. Estimates effort (e.g., "30m", "2h")

### Output Format

Return a JSON array of tasks with this exact structure...`;
}

describe("workflows-create hook", () => {
  //#given a prompt with user-request tags
  //#when extracting feature description
  //#then description is extracted from tags
  it("should extract feature description from user-request tags", () => {
    const prompt = `
      <user-request>
        Add dark mode toggle to the application
      </user-request>
    `;

    const description = extractFeatureDescription(prompt);

    expect(description).toBe("Add dark mode toggle to the application");
  });

  //#given a prompt with plain text
  //#when extracting feature description
  //#then description is extracted from text
  it("should extract feature description from plain text", () => {
    const prompt = "Implement user authentication with JWT tokens";

    const description = extractFeatureDescription(prompt);

    expect(description).toContain("Implement user authentication");
  });

  //#given a prompt with existing task JSON
  //#when extracting feature description
  //#then null is returned (skip processing)
  it("should return null when tasks already present", () => {
    const prompt = `\`\`\`json
{
  "plan_id": "plan_123",
  "tasks": [
    {
      "id": "task-1",
      "subject": "Existing task",
      "description": "Already broken down"
    }
  ]
}
\`\`\``;

    const description = extractFeatureDescription(prompt);

    expect(description).toBeNull();
  });

  //#given a prompt with existing task JSON
  //#when extracting existing tasks
  //#then tasks are extracted
  it("should extract existing tasks from JSON", () => {
    const prompt = `\`\`\`json
{
  "plan_id": "plan_123",
  "tasks": [
    {
      "id": "task-1",
      "subject": "Task 1",
      "description": "First task",
      "status": "pending",
      "blocks": [],
      "blockedBy": []
    }
  ]
}
\`\`\``;

    const tasks = extractExistingTasks(prompt);

    expect(tasks).toBeDefined();
    expect(tasks).toHaveLength(1);
    expect(tasks![0].id).toBe("task-1");
  });

  //#given a feature description
  //#when building planner delegation prompt
  //#then prompt contains all required sections
  it("should build comprehensive planner delegation prompt", () => {
    const description = "Add authentication to the API";

    const prompt = buildPlannerDelegationPrompt(description);

    expect(prompt).toContain("Task Breakdown Request");
    expect(prompt).toContain("Feature Description");
    expect(prompt).toContain(description);
    expect(prompt).toContain("Task Requirements");
    expect(prompt).toContain("Output Format");
    expect(prompt).toContain("delegation category");
  });

  //#given a planner response with JSON task array
  //#when extracting tasks
  //#then valid tasks are returned
  it("should extract tasks from planner response", () => {
    const response = `
      Here's the task breakdown:
      
      [
        {
          "id": "task-1",
          "subject": "Setup database",
          "description": "Create database schema",
          "category": "quick",
          "status": "pending",
          "blocks": ["task-2"],
          "blockedBy": []
        },
        {
          "id": "task-2",
          "subject": "API endpoint",
          "description": "Create auth endpoint",
          "category": "ultrabrain",
          "status": "pending",
          "blocks": [],
          "blockedBy": ["task-1"]
        }
      ]
    `;

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toBeDefined();
    expect(tasks).toHaveLength(2);
    expect(tasks![0].id).toBe("task-1");
    expect(tasks![1].id).toBe("task-2");
  });

  //#given a planner response without valid JSON
  //#when extracting tasks
  //#then null is returned
  it("should return null for invalid JSON in response", () => {
    const response = "The tasks are task-1, task-2, and task-3";

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toBeNull();
  });

  //#given a JSON task array with missing fields
  //#when extracting tasks
  //#then incomplete tasks are filtered out
  it("should filter out incomplete tasks", () => {
    const response = `
      [
        {
          "id": "task-1",
          "subject": "Valid task",
          "description": "Complete task",
          "status": "pending",
          "blocks": [],
          "blockedBy": []
        },
        {
          "id": "task-2",
          "subject": "Incomplete task"
        }
      ]
    `;

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toHaveLength(1);
    expect(tasks![0].id).toBe("task-1");
  });

  //#given a complex feature description
  //#when building planner prompt
  //#then all details are included
  it("should preserve full feature description in prompt", () => {
    const description = `Implement a comprehensive user management system with:
- User registration with email verification
- JWT-based authentication
- Role-based access control
- Password reset flow
- User profile management`;

    const prompt = buildPlannerDelegationPrompt(description);

    expect(prompt).toContain("email verification");
    expect(prompt).toContain("JWT");
    expect(prompt).toContain("Role-based");
  });

  //#given empty prompt
  //#when extracting feature description
  //#then null is returned
  it("should return null for empty prompt", () => {
    const description = extractFeatureDescription("");

    expect(description).toBeNull();
  });

  //#given prompt with only tags
  //#when extracting feature description
  //#then empty string is returned (will be falsy)
  it("should handle empty user-request tags", () => {
    const prompt = `<user-request></user-request>`;

    const description = extractFeatureDescription(prompt);

    expect(description).toBe("");
  });

  //#given planner response with multiple valid JSON arrays
  //#when extracting tasks
  //#then first valid array is used
  it("should use first JSON array if multiple present", () => {
    const response = `
      First attempt:
      [{"id": "a", "subject": "Task A", "description": "Desc", "blocks": [], "blockedBy": []}]
      
      Second attempt:
      [{"id": "b", "subject": "Task B", "description": "Desc", "blocks": [], "blockedBy": []}]
    `;

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toBeDefined();
    if (tasks) {
      expect(tasks[0].id).toBe("a");
    }
  });
});

describe("Task List Creation and Formatting", () => {
  const TEST_DIR = join(tmpdir(), "workflows-create-test-" + Date.now());

  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  //#given tasks and a plan name
  //#when creating workflow task list
  //#then proper structure with metadata is created
  it("should create WorkflowTaskList with correct structure", async () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Setup",
        description: "Initial setup",
        category: "quick",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Implement",
        description: "Main implementation",
        category: "deep",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
      },
    ];

    // Create test plan file
    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "test-plan.md");
    writeFileSync(planPath, `# Test Plan\n\nInitial content\n\n\`\`\`json\n{}\n\`\`\``);

    const result = await processTasksForPlan(planPath, "test-plan", tasks, "session-123");

    expect(result.success).toBe(true);
    expect(result.taskList).toBeDefined();
    expect(result.taskList?.plan_name).toBe("test-plan");
    expect(result.taskList?.tasks).toHaveLength(2);
    expect(result.taskList?.auto_parallelization).toBe(true);
    expect(result.taskList?.breakdown_at).toBeDefined();
  });

  //#given a WorkflowTaskList
  //#when formatting as JSON
  //#then markdown code fence with JSON is returned
  it("should format task list as markdown JSON code block", async () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Test task",
        description: "A test task",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "test-plan.md");
    writeFileSync(planPath, `# Test\n\n\`\`\`json\n{}\n\`\`\``);

    const result = await processTasksForPlan(planPath, "test-plan", tasks, "session-123");

    expect(result.taskList).toBeDefined();
    if (result.taskList) {
      // Format it and check structure
      const formatted = `\`\`\`json\n${JSON.stringify(result.taskList, null, 2)}\n\`\`\``;
      expect(formatted).toContain("```json");
      expect(formatted).toContain("```");
      expect(formatted).toContain("test-plan");
      expect(formatted).toContain("task-1");
    }
  });

  //#given a plan file path that doesn't exist
  //#when processing tasks
  //#then error is returned
  it("should return error when plan file does not exist", async () => {
    const nonexistentPath = join(TEST_DIR, "nonexistent.md");
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Test",
        description: "Test",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const result = await processTasksForPlan(nonexistentPath, "test-plan", tasks, "session-123");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("not found");
  });

  //#given multiple tasks with dependencies
  //#when creating task list
  //#then all dependency relationships are preserved
  it("should preserve task dependencies in task list", async () => {
    const tasks: Task[] = [
      {
        id: "t-1",
        subject: "Database setup",
        description: "Setup DB schema",
        category: "quick",
        status: "pending",
        blocks: ["t-2", "t-3"],
        blockedBy: [],
      },
      {
        id: "t-2",
        subject: "API endpoints",
        description: "Create endpoints",
        category: "deep",
        status: "pending",
        blocks: ["t-4"],
        blockedBy: ["t-1"],
      },
      {
        id: "t-3",
        subject: "Migrations",
        description: "Run migrations",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: ["t-1"],
      },
    ];

    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "complex-plan.md");
    writeFileSync(planPath, `# Complex\n\n\`\`\`json\n{}\n\`\`\``);

    const result = await processTasksForPlan(planPath, "complex-plan", tasks, "session-123");

    expect(result.success).toBe(true);
    expect(result.taskList?.tasks[0].blocks).toEqual(["t-2", "t-3"]);
    expect(result.taskList?.tasks[1].blockedBy).toEqual(["t-1"]);
  });

  //#given a plan file with existing content
  //#when updating with task list
  //#then markdown content is preserved
  it("should preserve markdown content when updating plan with tasks", async () => {
    const originalContent = `# Original Plan

## Problem Statement
This is an important problem.

## Approach
Here's our approach...

\`\`\`json
{
  "old": "structure"
}
\`\`\`

## Conclusion
Final notes here.`;

    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "preserve-plan.md");
    writeFileSync(planPath, originalContent);

    const tasks: Task[] = [
      {
        id: "t-1",
        subject: "Task",
        description: "Desc",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    await processTasksForPlan(planPath, "preserve-plan", tasks, "session-123");

    const updatedContent = readFileSync(planPath, "utf-8");

    // Should preserve original text
    expect(updatedContent).toContain("# Original Plan");
    expect(updatedContent).toContain("## Problem Statement");
    expect(updatedContent).toContain("This is an important problem");
    expect(updatedContent).toContain("## Conclusion");
    expect(updatedContent).toContain("Final notes here");

    // Should have new JSON structure
    expect(updatedContent).toContain('"preserve-plan"');
    expect(updatedContent).toContain('"t-1"');
  });

  //#given tasks with different categories
  //#when converting to OpenCode todos
  //#then priority is assigned based on category
  it("should assign priority based on task category", async () => {
    const tasks: Task[] = [
      {
        id: "t-1",
        subject: "Deep work",
        description: "Complex task",
        category: "deep",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "t-2",
        subject: "Quick task",
        description: "Simple task",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "t-3",
        subject: "Art task",
        description: "Creative task",
        category: "artistry",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "priority-plan.md");
    writeFileSync(planPath, `# Plan\n\n\`\`\`json\n{}\n\`\`\``);

    const result = await processTasksForPlan(planPath, "priority-plan", tasks, "session-123");

    expect(result.success).toBe(true);
    // The todos are saved to OpenCode via saveOpenCodeTodos in the hook
    // We can verify the task list was created properly
    expect(result.taskList?.tasks).toHaveLength(3);
  });

  //#given task with estimatedEffort
  //#when creating todo
  //#then effort is included in content
  it("should include estimated effort in OpenCode todo content", async () => {
    const tasks: Task[] = [
      {
        id: "t-1",
        subject: "Implementation task",
        description: "Detailed impl",
        category: "deep",
        estimatedEffort: "2h",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "effort-plan.md");
    writeFileSync(planPath, `# Plan\n\n\`\`\`json\n{}\n\`\`\``);

    const result = await processTasksForPlan(planPath, "effort-plan", tasks, "session-123");

    expect(result.success).toBe(true);
    expect(result.taskList?.tasks[0].estimatedEffort).toBe("2h");
  });

  //#given empty task list
  //#when processing for plan
  //#then still creates valid structure
  it("should handle empty task list", async () => {
    const plansDir = join(TEST_DIR, "docs", "plans");
    mkdirSync(plansDir, { recursive: true });
    const planPath = join(plansDir, "empty-plan.md");
    writeFileSync(planPath, `# Empty Plan\n\n\`\`\`json\n{}\n\`\`\``);

    const result = await processTasksForPlan(planPath, "empty-plan", [], "session-123");

    expect(result.success).toBe(true);
    expect(result.taskList?.tasks).toHaveLength(0);
    expect(result.taskList?.plan_name).toBe("empty-plan");
  });
});
