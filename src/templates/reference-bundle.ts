import type { TemplateReference } from "../core/templates/types.js";

type TemplateReferenceEntry = readonly [relativePath: string, content: string];

export function defineTemplateReferences(
  ...entries: readonly TemplateReferenceEntry[]
): TemplateReference[] {
  return entries.map(([relativePath, content]) => ({ relativePath, content }));
}