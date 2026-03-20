import type { AgentTemplate } from "../../core/templates/types.js";

import { getPlanAgentTemplate as planAgentTemplate } from "./jinn-plan/template.js";
import { getDoAgentTemplate as doAgentTemplate } from "./jinn-do/template.js";
import { getCaptureAgentTemplate as captureAgentTemplate } from "./jinn-capture/template.js";
import { getReviewAgentTemplate as reviewAgentTemplate } from "./jinn-review/template.js";
import { getArchitectAgentTemplate as architectAgentTemplate } from "./jinn-architect/template.js";
import { getDesignerAgentTemplate as designerAgentTemplate } from "./jinn-designer/template.js";
import { getGitAgentTemplate as gitAgentTemplate } from "./jinn-git/template.js";
import { getSearchAgentTemplate as searchAgentTemplate } from "./jinn-search/template.js";

export { getPlanAgentTemplate } from "./jinn-plan/template.js";
export { getDoAgentTemplate } from "./jinn-do/template.js";
export { getCaptureAgentTemplate } from "./jinn-capture/template.js";
export { getReviewAgentTemplate } from "./jinn-review/template.js";
export { getArchitectAgentTemplate } from "./jinn-architect/template.js";
export { getDesignerAgentTemplate } from "./jinn-designer/template.js";
export { getGitAgentTemplate } from "./jinn-git/template.js";
export { getSearchAgentTemplate } from "./jinn-search/template.js";

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
