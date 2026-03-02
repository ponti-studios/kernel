import { z } from "zod";

export const CategoryConfigSchema = z.object({
  /** Human-readable description of the category's purpose. Shown in delegate_task prompt. */
  description: z.string().optional(),
  model: z.string().optional(),
  variant: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  maxTokens: z.number().optional(),
  thinking: z
    .object({
      type: z.enum(["enabled", "disabled"]),
      budgetTokens: z.number().optional(),
    })
    .optional(),
  reasoningEffort: z.enum(["low", "medium", "high", "xhigh"]).optional(),
  textVerbosity: z.enum(["low", "medium", "high"]).optional(),
  tools: z.record(z.string(), z.boolean()).optional(),
  prompt_append: z.string().optional(),
  /** Mark agent as unstable - forces background mode for monitoring. Auto-enabled for gemini models. */
  is_unstable_agent: z.boolean().optional(),
});

export const CategoryNameSchema = z.enum([
  "visual-engineering",
  "ultrawork",
  "deep",
  "artistry",
  "quick",
  "unspecified-low",
  "unspecified-high",
  "writing",
]);

export const CategoriesConfigSchema = z.record(z.string(), CategoryConfigSchema);

export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type CategoryName = z.infer<typeof CategoryNameSchema>;
export type CategoriesConfig = z.infer<typeof CategoriesConfigSchema>;
