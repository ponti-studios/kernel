import { PROMPT as plannerPrompt } from "./planner";

export const PROMPT = plannerPrompt
  .replace(/id: planner/, "id: plan")
  .replace(/name: planner/, "name: plan");

