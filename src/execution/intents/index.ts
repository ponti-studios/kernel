/**
 * Canonical command intent layer
 *
 * This module defines the schema and validators for CommandIntentSpec,
 * the declarative specification for `/` command behavior.
 *
 * See also:
 * - ../profiles/ for agent profile specifications
 * - ../prompt-assets/ for prompt content layer
 * - ../composition/ for execution plan compilation
 */

export {
  commandIntentSpecSchema,
  type CommandIntentSpec,
  validateCommandIntentSpec,
  validateCommandIntentSpecList,
  detectDuplicateCommandIds,
  serializeCommandIntentSpec,
  digestCommandIntentSpec,
} from "./schema";
