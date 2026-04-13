import { defineTemplateReferences } from "../../reference-bundle.js";
import dataFetchingReference from "./references/data-fetching.md";
import packageBoundariesReference from "./references/package-boundaries.md";
import packageMigrationReference from "./references/package-migration.md";
import packageViolationsReference from "./references/package-violations.md";

export const REACT_PATTERNS_REFERENCES = defineTemplateReferences(
  ["references/data-fetching.md", dataFetchingReference],
  ["references/package-boundaries.md", packageBoundariesReference],
  ["references/package-migration.md", packageMigrationReference],
  ["references/package-violations.md", packageViolationsReference],
);