import { z } from "zod";

export const OperatorConfigSchema = z.object({
  disabled: z.boolean().optional(),
  default_builder_enabled: z.boolean().optional(),
  planner_enabled: z.boolean().optional(),
  replace_plan: z.boolean().optional(),
});

export const OperatorConfigSchemaWrapper = z.object({
  tasks: z.any().optional(),
  swarm: z.any().optional(),
  disabled: z.boolean().optional(),
  default_builder_enabled: z.boolean().optional(),
  planner_enabled: z.boolean().optional(),
  replace_plan: z.boolean().optional(),
});

export type OperatorConfig = z.infer<typeof OperatorConfigSchema>;
export type OperatorConfigWrapper = z.infer<typeof OperatorConfigSchemaWrapper>;
