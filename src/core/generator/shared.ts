/**
 * Generator shared utilities
 *
 * Helpers used across skill-gen, agent-gen, and manifest-gen.
 * Import from here — never reimplement locally in a generator module.
 */

import * as path from "path";
import type { GeneratedFile } from "../adapters/types.js";

interface HasReferences {
  references?: Array<{ relativePath: string; content: string }>;
}

/**
 * Append reference files alongside the primary generated file.
 */
export function collectReferenceFiles(
  fileDirectory: string,
  template: HasReferences,
): GeneratedFile[] {
  return (template.references ?? []).map((ref) => ({
    path: path.join(fileDirectory, ref.relativePath),
    content: ref.content,
  }));
}
