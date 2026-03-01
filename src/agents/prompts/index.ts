import { PROMPT as advisor_architecture } from "./advisor_architecture";
import { PROMPT as advisor_plan } from "./advisor_plan";
import { PROMPT as advisor_strategy } from "./advisor_strategy";
import { PROMPT as analyzer_design } from "./analyzer_design";
import { PROMPT as analyzer_media } from "./analyzer_media";
import { PROMPT as analyzer_patterns } from "./analyzer_patterns";
import { PROMPT as designer_builder } from "./designer_builder";
import { PROMPT as designer_flow } from "./designer_flow";
import { PROMPT as designer_iterator } from "./designer_iterator";
import { PROMPT as designer_sync } from "./designer_sync";
import { PROMPT as editor_style } from "./editor_style";
import { PROMPT as executor } from "./executor";
import { PROMPT as expert_migrations } from "./expert_migrations";
import { PROMPT as guardian_data } from "./guardian_data";
import { PROMPT as operator } from "./operator";
import { PROMPT as oracle_performance } from "./oracle_performance";
import { PROMPT as orchestrator } from "./orchestrator";
import { PROMPT as planner } from "./planner";
import { PROMPT as researcher_codebase } from "./researcher_codebase";
import { PROMPT as researcher_data } from "./researcher_data";
import { PROMPT as researcher_docs } from "./researcher_docs";
import { PROMPT as researcher_git } from "./researcher_git";
import { PROMPT as researcher_learnings } from "./researcher_learnings";
import { PROMPT as researcher_practices } from "./researcher_practices";
import { PROMPT as researcher_repo } from "./researcher_repo";
import { PROMPT as resolver_pr } from "./resolver_pr";
import { PROMPT as reviewer_python } from "./reviewer_python";
import { PROMPT as reviewer_races } from "./reviewer_races";
import { PROMPT as reviewer_rails } from "./reviewer_rails";
import { PROMPT as reviewer_rails_dh } from "./reviewer_rails_dh";
import { PROMPT as reviewer_security } from "./reviewer_security";
import { PROMPT as reviewer_simplicity } from "./reviewer_simplicity";
import { PROMPT as reviewer_typescript } from "./reviewer_typescript";
import { PROMPT as validator_audit } from "./validator_audit";
import { PROMPT as validator_bugs } from "./validator_bugs";
import { PROMPT as validator_deployment } from "./validator_deployment";
import { PROMPT as writer_gem } from "./writer_gem";
import { PROMPT as writer_readme } from "./writer_readme";

export const AGENT_PROMPTS: Record<string, string> = {
  advisor_architecture,
  advisor_plan,
  advisor_strategy,
  analyzer_design,
  analyzer_media,
  analyzer_patterns,
  designer_builder,
  designer_flow,
  designer_iterator,
  designer_sync,
  editor_style,
  executor,
  expert_migrations,
  guardian_data,
  operator,
  oracle_performance,
  orchestrator,
  planner,
  researcher_codebase,
  researcher_data,
  researcher_docs,
  researcher_git,
  researcher_learnings,
  researcher_practices,
  researcher_repo,
  resolver_pr,
  reviewer_python,
  reviewer_races,
  reviewer_rails,
  reviewer_rails_dh,
  reviewer_security,
  reviewer_simplicity,
  reviewer_typescript,
  validator_audit,
  validator_bugs,
  validator_deployment,
  writer_gem,
  writer_readme,
};
