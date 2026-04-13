import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import databaseWorkflowSkillMarkdown from "./instructions.md";
import { DATABASE_WORKFLOW_REFERENCES } from "./reference-bundle.js";

export function getDatabaseWorkflowSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.DATABASE_WORKFLOW,
    profile: "extended",
    description:
      "Manages the full database migration lifecycle: schema design, authoring, validation, multi-environment apply, type generation, rollback, and production deployment coordination. Use whenever a schema change is required, migrations need to be applied or rolled back, or generated types are out of sync.",
    license: "MIT",
    compatibility:
      "Any PostgreSQL project using Goose for migrations and kysely-codegen for type generation.",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Database",
      tags: [
        "database",
        "migrations",
        "sql",
        "goose",
        "postgres",
        "schema",
        "kysely",
        "drizzle",
        "codegen",
        "types",
        "ddl",
      ],
    },
    when: [
      "user needs to add, modify, or remove a table, column, index, or constraint",
      "user needs to create, inspect, apply, or roll back a migration",
      "a feature requires a schema change before the application code can be written",
      "user asks about migration status, pending migrations, or schema drift",
      "a destructive or hard-to-reverse DDL change is being considered",
      "a schema change needs to be coordinated with a production deployment",
      "generated database types are stale or out of sync with the schema",
      "user needs to design a table schema or choose column types",
    ],
    applicability: [
      "Use for every schema change — no exceptions",
      "Use when reviewing a migration for correctness, safety, or reversibility",
      "Use when planning a multi-step expand → backfill → contract migration",
      "Use when coordinating a migration with a production deploy",
      "Use when diagnosing schema drift between the live database and generated types",
    ],
    termination: [
      "Migration file authored with correct Up and Down blocks",
      "Migration applied to dev and test databases without errors",
      "Generated type file regenerated and verified against live schema",
      "Lint and typecheck pass with no errors introduced by the migration",
      "Production rollout risks documented and communicated",
    ],
    outputs: [
      "Timestamped SQL migration file following schema design standards",
      "Applied migration confirmed on dev and test environments",
      "Regenerated and verified generated type file",
      "Rollout risk assessment for production deployment",
    ],
    dependencies: [],
    disableModelInvocation: true,
    references: DATABASE_WORKFLOW_REFERENCES,
    instructions: parseFrontmatter(databaseWorkflowSkillMarkdown).body,
  };
}
