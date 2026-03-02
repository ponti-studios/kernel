import { COMMAND_NAME_VALUES } from "../../commands/command-name-values";
import { SKILL_NAME_VALUES } from "../../skills/skills-manifest";

export const AGENT_DO = "do";
export const AGENT_RESEARCH = "research";

export const AGENT_PLANNER = AGENT_DO;
export const AGENT_ADVISOR_STRATEGY = AGENT_DO;
export const AGENT_ADVISOR_ARCHITECTURE = AGENT_DO;

export const AGENT_RESEARCHER_CODEBASE = AGENT_RESEARCH;
export const AGENT_RESEARCHER_WORLD = AGENT_RESEARCH;
export const AGENT_RESEARCHER_DOCS = AGENT_RESEARCH;
export const AGENT_RESEARCHER_GIT = AGENT_RESEARCH;
export const AGENT_RESEARCHER_LEARNINGS = AGENT_RESEARCH;
export const AGENT_RESEARCHER_PRACTICES = AGENT_RESEARCH;
export const AGENT_RESEARCHER_REPO = AGENT_RESEARCH;

// Categories (for delegate_task)
export const CATEGORY_VISUAL_ENGINEERING = "visual-engineering";
export const CATEGORY_ULTRABRAIN = "ultrabrain";
export const CATEGORY_DEEP = "deep";
export const CATEGORY_ARTISTRY = "artistry";
export const CATEGORY_QUICK = "quick";
export const CATEGORY_UNSPECIFIED_LOW = "unspecified-low";
export const CATEGORY_UNSPECIFIED_HIGH = "unspecified-high";
export const CATEGORY_WRITING = "writing";

// Valid categories for validation
export const VALID_CATEGORIES = [
  CATEGORY_VISUAL_ENGINEERING,
  CATEGORY_ULTRABRAIN,
  CATEGORY_DEEP,
  CATEGORY_ARTISTRY,
  CATEGORY_QUICK,
  CATEGORY_UNSPECIFIED_LOW,
  CATEGORY_UNSPECIFIED_HIGH,
  CATEGORY_WRITING,
] as const;

export type ValidCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Validate that a category is valid
 */
export function isValidCategory(category: string): category is ValidCategory {
  return VALID_CATEGORIES.includes(category as ValidCategory);
}

// Valid agent IDs for validation
export const VALID_AGENT_IDS = [AGENT_DO, AGENT_RESEARCH] as const;

export type ValidAgentId = (typeof VALID_AGENT_IDS)[number];

/**
 * Validate that an agent ID is valid
 */
export function isValidAgentId(agentId: string): agentId is ValidAgentId {
  return VALID_AGENT_IDS.includes(agentId as ValidAgentId);
}

// Valid command names for validation
export const VALID_COMMAND_NAMES = COMMAND_NAME_VALUES;

export type ValidCommandName = (typeof VALID_COMMAND_NAMES)[number];

/**
 * Validate that a command name is valid
 */
export function isValidCommandName(commandName: string): commandName is ValidCommandName {
  return VALID_COMMAND_NAMES.includes(commandName as ValidCommandName);
}

// Valid skill names for validation
export const VALID_SKILL_NAMES = SKILL_NAME_VALUES;

export type ValidSkillName = (typeof VALID_SKILL_NAMES)[number];

/**
 * Validate that a skill name is valid
 */
export function isValidSkillName(skillName: string): skillName is ValidSkillName {
  return VALID_SKILL_NAMES.includes(skillName as ValidSkillName);
}
