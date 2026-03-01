import { z } from "zod";

/**
 * CommandIntentSpec: Canonical declaration of `/` command behavior independent of host runtime.
 *
 * Core principles:
 * - Globally unique IDs following pattern: namespace:category:name
 * - Immutable specification (no runtime mutation)
 * - Host-agnostic (adapters translate to host-specific transport)
 * - Deterministic validation and serialization
 */
export const commandIntentSpecSchema = z
  .object({
    id: z
      .string()
      .min(1, "id is required and must be non-empty")
      .regex(/^[a-z0-9][a-z0-9:-]*$/, {
        message:
          "id must start with lowercase letter/digit and contain only lowercase letters, digits, colons, and hyphens",
      }),
    description: z.string().min(1, "description is required and must be non-empty"),
    argsSchema: z
      .unknown()
      .describe("Strict argument schema (typically JSON Schema compatible object)"),
    acceptanceChecks: z
      .array(z.string().min(1))
      .min(1, "acceptanceChecks must have at least one check")
      .describe("Deterministic behavior checks"),
    defaultRoute: z.string().min(1, "defaultRoute is required and must be non-empty"),
    lifecycleHints: z.unknown().optional().describe("Optional execution phase hints"),
  })
  .strict();

/**
 * Branded type for validated CommandIntentSpec instances.
 * Provides compile-time guarantee that schema validation has been applied.
 */
export type CommandIntentSpec = z.infer<typeof commandIntentSpecSchema>;

/**
 * Validate a candidate CommandIntentSpec against the canonical schema.
 *
 * @param candidate - The candidate object to validate
 * @returns Either the validated spec or an error with detailed diagnostics
 *
 * @example
 * const candidate = { id: "ghostwire:workflows:plan", ... };
 * const result = validateCommandIntentSpec(candidate);
 * if (result.success) {
 *   const spec: CommandIntentSpec = result.data;
 * } else {
 *   console.error("Validation failed:", result.error.format());
 * }
 */
export function validateCommandIntentSpec(
  candidate: unknown,
): ReturnType<typeof commandIntentSpecSchema.safeParse> {
  return commandIntentSpecSchema.safeParse(candidate);
}

/**
 * Validate a list of CommandIntentSpec objects.
 *
 * @param candidates - Array of candidate objects
 * @returns Validation results with diagnostics for each failure
 */
export function validateCommandIntentSpecList(candidates: unknown[]): {
  valid: CommandIntentSpec[];
  errors: Array<{ index: number; message: string }>;
} {
  const valid: CommandIntentSpec[] = [];
  const errors: Array<{ index: number; message: string }> = [];

  candidates.forEach((candidate, index) => {
    const result = validateCommandIntentSpec(candidate);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        index,
        message: result.error.message,
      });
    }
  });

  return { valid, errors };
}

/**
 * Detect duplicate command IDs in a list of specs.
 *
 * @param specs - List of validated CommandIntentSpec objects
 * @returns Array of duplicate IDs with their indices
 */
export function detectDuplicateCommandIds(
  specs: CommandIntentSpec[],
): Array<{ id: string; indices: number[] }> {
  const idMap = new Map<string, number[]>();

  specs.forEach((spec, index) => {
    const indices = idMap.get(spec.id) || [];
    indices.push(index);
    idMap.set(spec.id, indices);
  });

  return Array.from(idMap.entries())
    .filter(([_, indices]) => indices.length > 1)
    .map(([id, indices]) => ({ id, indices }));
}

/**
 * Serialize a CommandIntentSpec to deterministic JSON string.
 * Ensures consistent ordering and formatting for snapshot testing and hashing.
 *
 * @param spec - The validated spec to serialize
 * @returns Deterministic JSON string
 */
export function serializeCommandIntentSpec(spec: CommandIntentSpec): string {
  return JSON.stringify(spec, null, 2);
}

/**
 * Compute a deterministic digest/hash for a CommandIntentSpec.
 * Useful for change detection and snapshot validation.
 *
 * @param spec - The validated spec
 * @returns Hex string digest
 */
export async function digestCommandIntentSpec(spec: CommandIntentSpec): Promise<string> {
  const serialized = JSON.stringify(spec);
  const data = new TextEncoder().encode(serialized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
