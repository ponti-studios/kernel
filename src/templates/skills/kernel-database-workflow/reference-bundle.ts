import { defineTemplateReferences } from "../../reference-bundle.js";
import gooseWorkflowReference from "./references/goose-workflow.md";
import migrationPatternsReference from "./references/migration-patterns.md";
import schemaDesignReference from "./references/schema-design.md";

export const DATABASE_WORKFLOW_REFERENCES = defineTemplateReferences(
  ["references/schema-design.md", schemaDesignReference],
  ["references/migration-patterns.md", migrationPatternsReference],
  ["references/goose-workflow.md", gooseWorkflowReference],
);