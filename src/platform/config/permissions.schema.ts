import { z } from "zod";

export const PermissionValue = z.enum(["ask", "allow", "deny"]);

export const BashPermission = z.union([PermissionValue, z.record(z.string(), PermissionValue)]);

export const AgentPermissionSchema = z.object({
  edit: PermissionValue.optional(),
  bash: BashPermission.optional(),
  webfetch: PermissionValue.optional(),
  doom_loop: PermissionValue.optional(),
  external_directory: PermissionValue.optional(),
});

export type AgentPermission = z.infer<typeof AgentPermissionSchema>;
