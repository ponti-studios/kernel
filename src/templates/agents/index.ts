import type { AgentTemplate } from "../../core/templates/types.js";

import { getPlanAgentTemplate as planAgentTemplate } from "./spec-plan/template.js";
import { getDoAgentTemplate as doAgentTemplate } from "./spec-do/template.js";
import { getCaptureAgentTemplate as captureAgentTemplate } from "./spec-capture/template.js";
import { getReviewAgentTemplate as reviewAgentTemplate } from "./spec-review/template.js";
import { getArchitectAgentTemplate as architectAgentTemplate } from "./spec-architect/template.js";
import { getDesignerAgentTemplate as designerAgentTemplate } from "./spec-designer/template.js";
import { getGitAgentTemplate as gitAgentTemplate } from "./spec-git/template.js";
import { getSearchAgentTemplate as searchAgentTemplate } from "./spec-search/template.js";

export { getPlanAgentTemplate } from "./spec-plan/template.js";
export { getDoAgentTemplate } from "./spec-do/template.js";
export { getCaptureAgentTemplate } from "./spec-capture/template.js";
export { getReviewAgentTemplate } from "./spec-review/template.js";
export { getArchitectAgentTemplate } from "./spec-architect/template.js";
export { getDesignerAgentTemplate } from "./spec-designer/template.js";
export { getGitAgentTemplate } from "./spec-git/template.js";
export { getSearchAgentTemplate } from "./spec-search/template.js";

export const ALL_AGENTS: Array<() => AgentTemplate> = [
  planAgentTemplate,
  doAgentTemplate,
  captureAgentTemplate,
  reviewAgentTemplate,
  architectAgentTemplate,
  designerAgentTemplate,
  gitAgentTemplate,
  searchAgentTemplate,
];
