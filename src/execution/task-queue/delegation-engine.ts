import type { Task } from "./types";
import { DelegationCategorySchema, type DelegationCategory } from "./types";
import { AGENT_ADVISOR_PLAN } from "../../agents/runtime/constants";

/**
 * Delegation engine configuration
 * Maps delegation categories to recommended agents and skills
 */
export interface DelegationConfig {
  category: DelegationCategory;
  skills: string[];
  description: string;
  defaultSubagent?: string;
}

/**
 * Predefined delegation configurations for each category
 * These map workflow task categories to appropriate agents and skills
 */
export const DELEGATION_CONFIGS: Record<DelegationCategory, DelegationConfig> = {
  "visual-engineering": {
    category: "visual-engineering",
    skills: ["frontend-ui-ux"],
    description: "UI/UX implementation, styling, animations, responsive design",
    defaultSubagent: undefined,
  },
  ultrabrain: {
    category: "ultrabrain",
    skills: [],
    description: "Complex logic, architecture decisions, algorithmic problems",
    defaultSubagent: AGENT_ADVISOR_PLAN,
  },
  quick: {
    category: "quick",
    skills: [],
    description: "Quick fixes, typo corrections, simple modifications",
    defaultSubagent: undefined,
  },
  deep: {
    category: "deep",
    skills: [],
    description: "Deep codebase analysis, thorough problem-solving",
    defaultSubagent: undefined,
  },
  artistry: {
    category: "artistry",
    skills: [],
    description: "Creative solutions, unconventional approaches",
    defaultSubagent: undefined,
  },
  writing: {
    category: "writing",
    skills: [],
    description: "Documentation, prose, technical writing",
    defaultSubagent: undefined,
  },
  "unspecified-low": {
    category: "unspecified-low",
    skills: [],
    description: "Unspecified low-effort tasks",
    defaultSubagent: undefined,
  },
  "unspecified-high": {
    category: "unspecified-high",
    skills: [],
    description: "Unspecified high-effort tasks",
    defaultSubagent: undefined,
  },
};

/**
 * Build a delegation prompt for a task
 * Returns the formatted prompt that will be passed to the subagent
 */
export function buildTaskDelegationPrompt(task: Task, context?: string): string {
  const sections = [
    `## Task: ${task.subject}`,
    `ID: ${task.id}`,
    "",
    `### Description`,
    task.description,
  ];

  if (task.estimatedEffort) {
    sections.push("", `### Effort Estimate`, task.estimatedEffort);
  }

  if (task.metadata) {
    const metadataStr = Object.entries(task.metadata)
      .map(
        ([key, value]) =>
          `- **${key}**: ${typeof value === "string" ? value : JSON.stringify(value)}`,
      )
      .join("\n");

    if (metadataStr) {
      sections.push("", `### Additional Context`, metadataStr);
    }
  }

  if (context) {
    sections.push("", `### Workflow Context`, context);
  }

  sections.push("", `### Dependencies`);
  if (task.blockedBy && task.blockedBy.length > 0) {
    sections.push(
      `This task is blocked by: ${task.blockedBy.join(", ")}`,
      "Ensure dependencies are completed before starting this task.",
    );
  } else {
    sections.push("This task has no blocking dependencies. You can start immediately.");
  }

  if (task.blocks && task.blocks.length > 0) {
    sections.push(
      "",
      `This task blocks: ${task.blocks.join(", ")}`,
      "Ensure this task is completed before dependent tasks begin.",
    );
  }

  return sections.join("\n");
}

/**
 * Get delegation configuration for a task
 * Returns the config object with skills, agents, and metadata
 */
export function getTaskDelegationConfig(task: Task): DelegationConfig {
  const category = task.category || "unspecified-high";

  // Validate category
  if (!DELEGATION_CONFIGS[category as DelegationCategory]) {
    console.warn(`Unknown delegation category: ${category}, using unspecified-high`);
    return DELEGATION_CONFIGS["unspecified-high"];
  }

  const baseConfig = DELEGATION_CONFIGS[category as DelegationCategory];

  // Merge with task-specific skills
  const skills = new Set([...baseConfig.skills, ...(task.skills || [])]);

  return {
    ...baseConfig,
    skills: Array.from(skills),
  };
}

/**
 * Interface for delegation task result
 */
export interface TaskDelegationResult {
  taskId: string;
  subagentType?: string;
  category: DelegationCategory;
  skills: string[];
  backgroundTask: boolean;
  taskSessionId?: string;
  prompt: string;
  estimatedDuration?: string;
  error?: string;
}

/**
 * Build delegation instruction for a task
 * This is used by the orchestrator to route tasks to subagents
 */
export function buildTaskDelegationInstruction(
  task: Task,
  workflowContext?: string,
): TaskDelegationResult {
  const config = getTaskDelegationConfig(task);
  const prompt = buildTaskDelegationPrompt(task, workflowContext);

  return {
    taskId: task.id,
    category: task.category || "unspecified-high",
    skills: config.skills,
    subagentType: config.defaultSubagent,
    backgroundTask: true, // Tasks in workflow are delegated to background agents
    prompt,
    estimatedDuration: task.estimatedEffort,
  };
}

/**
 * Validate a task can be delegated (has required fields)
 */
export function validateTaskForDelegation(task: Task): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!task.id) {
    errors.push("Task missing required field: id");
  }

  if (!task.subject) {
    errors.push("Task missing required field: subject");
  }

  if (!task.description) {
    errors.push("Task missing required field: description");
  }

  if (task.category && !DELEGATION_CONFIGS[task.category]) {
    errors.push(`Task has invalid delegation category: ${task.category}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a summary of tasks and their delegation plan
 */
export interface TaskDelegationPlan {
  totalTasks: number;
  tasksByCategory: Record<DelegationCategory, number>;
  tasksByWave: Record<number, number>;
  estimatedTotalDuration: string;
  tasks: TaskDelegationResult[];
}

export function buildTaskDelegationPlan(
  tasks: Task[],
  estimatedTotalDuration?: string,
): TaskDelegationPlan {
  const tasksByCategory: Record<DelegationCategory, number> = {
    "visual-engineering": 0,
    ultrabrain: 0,
    quick: 0,
    deep: 0,
    artistry: 0,
    writing: 0,
    "unspecified-low": 0,
    "unspecified-high": 0,
  };

  const tasksByWave: Record<number, number> = {};
  const delegationTasks: TaskDelegationResult[] = [];

  for (const task of tasks) {
    const category = task.category || "unspecified-high";
    tasksByCategory[category as DelegationCategory]++;

    const wave = task.wave || 1;
    tasksByWave[wave] = (tasksByWave[wave] || 0) + 1;

    delegationTasks.push(buildTaskDelegationInstruction(task));
  }

  return {
    totalTasks: tasks.length,
    tasksByCategory,
    tasksByWave,
    estimatedTotalDuration: estimatedTotalDuration || "unknown",
    tasks: delegationTasks,
  };
}
