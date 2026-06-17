export const KERNEL_TEMPLATE_PREFIX = "kernel-";

export function prefixKernelTemplateName(name: string): string {
  return name.startsWith(KERNEL_TEMPLATE_PREFIX) ? name : `${KERNEL_TEMPLATE_PREFIX}${name}`;
}

export const AGENT_NAMES = {
  ARCHITECT: prefixKernelTemplateName("architect"),
  CAPTURE: prefixKernelTemplateName("capture"),
  DESIGNER: prefixKernelTemplateName("designer"),
  DO: prefixKernelTemplateName("do"),
  PLAN: prefixKernelTemplateName("plan"),
  REVIEW: prefixKernelTemplateName("review"),
  SEARCH: prefixKernelTemplateName("search"),
} as const;

export const COMMAND_NAMES = {
  SYNC: prefixKernelTemplateName("sync"),
  DOCTOR: prefixKernelTemplateName("doctor"),
  GOAL_DONE: prefixKernelTemplateName("goal-done"),
  TASK_DONE: prefixKernelTemplateName("task-done"),
  TASK_STATUS: prefixKernelTemplateName("task-status"),
} as const;
