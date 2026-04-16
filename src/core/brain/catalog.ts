import type { BuiltInCatalog } from "./types.js";
import { loadTemplateRegistry } from "../registry/index.js";
import { resolveCatalog } from "../registry/resolver.js";

export function getBuiltInCatalog(): BuiltInCatalog {
  const registry = loadTemplateRegistry();
  const resolved = resolveCatalog(registry);
  return {
    skills: resolved.skills,
    agents: resolved.agents,
    commands: resolved.commands,
  };
}

export function getBuiltInPackageIds(): string[] {
  return [];
}
