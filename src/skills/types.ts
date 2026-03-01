import type { SkillMcpConfig } from "../skill-mcp-manager/types";

// `Skill` is defined by the canonical Zod schema in schema.ts.  We
// re-export the inferred type here to keep the public API small and to
// centralize validation logic in one place.

import type { SkillSpec } from "./schema";

export type Skill = SkillSpec;
