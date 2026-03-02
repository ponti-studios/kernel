import { describe, expect, test, beforeEach, afterEach, spyOn } from "bun:test";
import { createCategorySkillReminderHook } from "./index";
import {
  updateSessionAgent,
  clearSessionAgent,
  _resetForTesting,
} from "../../../execution/session-state";
import * as logger from "../../../integration/shared/logger";

describe("grid-category-skill-reminder hook", () => {
  let logCalls: Array<{ msg: string; data?: unknown }>;
  let logSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    _resetForTesting();
    logCalls = [];
    logSpy = spyOn(logger, "log").mockImplementation((msg: string, data?: unknown) => {
      logCalls.push({ msg, data });
    });
  });

  afterEach(() => {
    logSpy?.mockRestore();
  });

  function createMockPluginInput() {
    return {
      client: {
        tui: {
          showToast: async () => {},
        },
      },
    } as any;
  }

  describe("target agent detection", () => {
    test("should inject reminder for operator agent after 3 tool calls", async () => {
      // #given - operator agent session with multiple tool calls
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "operator-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "file content", metadata: {} };

      // #when - 3 edit tool calls are made
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);

      // #then - reminder should be injected
      expect(output.output).toContain("[Category+Skill Reminder]");
      expect(output.output).toContain("delegate_task");

      clearSessionAgent(sessionID);
    });

    test("should inject reminder for orchestrator agent", async () => {
      // #given - orchestrator agent session
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "orchestrator-session";
      updateSessionAgent(sessionID, "orchestrator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - 3 tool calls are made
      await hook["tool.execute.after"]({ tool: "bash", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "bash", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "bash", sessionID, callID: "3" }, output);

      // #then - reminder should be injected
      expect(output.output).toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should inject reminder for executor agent", async () => {
      // #given - executor agent session
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "junior-session";
      updateSessionAgent(sessionID, "executor");

      const output = { title: "", output: "result", metadata: {} };

      // #when - 3 tool calls are made
      await hook["tool.execute.after"]({ tool: "write", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "write", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "write", sessionID, callID: "3" }, output);

      // #then - reminder should be injected
      expect(output.output).toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should NOT inject reminder for non-target agents", async () => {
      // #given - researcher-world agent session (not a target)
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "researcher-world-session";
      updateSessionAgent(sessionID, "researcher-world");

      const output = { title: "", output: "result", metadata: {} };

      // #when - 3 tool calls are made
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);

      // #then - reminder should NOT be injected
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should detect agent from input.agent when session state is empty", async () => {
      // #given - no session state, agent provided in input
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "input-agent-session";

      const output = { title: "", output: "result", metadata: {} };

      // #when - 3 tool calls with agent in input
      await hook["tool.execute.after"](
        { tool: "edit", sessionID, callID: "1", agent: "operator" },
        output,
      );
      await hook["tool.execute.after"](
        { tool: "edit", sessionID, callID: "2", agent: "operator" },
        output,
      );
      await hook["tool.execute.after"](
        { tool: "edit", sessionID, callID: "3", agent: "operator" },
        output,
      );

      // #then - reminder should be injected
      expect(output.output).toContain("[Category+Skill Reminder]");
    });
  });

  describe("delegation tool tracking", () => {
    test("should NOT inject reminder if delegate_task is used", async () => {
      // #given - operator agent that uses delegate_task
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "delegation-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - delegate_task is used, then more tool calls
      await hook["tool.execute.after"]({ tool: "delegate_task", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output);

      // #then - reminder should NOT be injected (delegation was used)
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should NOT inject reminder if call_grid_agent is used", async () => {
      // #given - operator agent that uses call_grid_agent
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "grid-agent-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - call_grid_agent is used first
      await hook["tool.execute.after"]({ tool: "call_grid_agent", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output);

      // #then - reminder should NOT be injected
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should NOT inject reminder if task tool is used", async () => {
      // #given - cipherOperator agent that uses task tool
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "task-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - task tool is used
      await hook["tool.execute.after"]({ tool: "task", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output);

      // #then - reminder should NOT be injected
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });
  });

  describe("tool call counting", () => {
    test("should NOT inject reminder before 3 tool calls", async () => {
      // #given - cipherOperator agent with only 2 tool calls
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "few-calls-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - only 2 tool calls are made
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);

      // #then - reminder should NOT be injected yet
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should only inject reminder once per session", async () => {
      // #given - cipherOperator agent session
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "once-session";
      updateSessionAgent(sessionID, "operator");

      const output1 = { title: "", output: "result1", metadata: {} };
      const output2 = { title: "", output: "result2", metadata: {} };

      // #when - 6 tool calls are made (should trigger at 3, not again at 6)
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "1" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output2);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "5" }, output2);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "6" }, output2);

      // #then - reminder should be in output1 but not output2
      expect(output1.output).toContain("[Category+Skill Reminder]");
      expect(output2.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should only count delegatable work tools", async () => {
      // #given - cipherOperator agent with mixed tool calls
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "mixed-tools-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - non-delegatable tools are called (should not count)
      await hook["tool.execute.after"](
        { tool: "lsp_goto_definition", sessionID, callID: "1" },
        output,
      );
      await hook["tool.execute.after"](
        { tool: "lsp_find_references", sessionID, callID: "2" },
        output,
      );
      await hook["tool.execute.after"]({ tool: "lsp_symbols", sessionID, callID: "3" }, output);

      // #then - reminder should NOT be injected (LSP tools don't count)
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });
  });

  describe("event handling", () => {
    test("should reset state on session.deleted event", async () => {
      // #given - operator agent with reminder already shown
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "delete-session";
      updateSessionAgent(sessionID, "operator");

      const output1 = { title: "", output: "result1", metadata: {} };
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "1" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output1);
      expect(output1.output).toContain("[Category+Skill Reminder]");

      // #when - session is deleted and new session starts
      await hook.event({
        event: { type: "session.deleted", properties: { info: { id: sessionID } } },
      });

      const output2 = { title: "", output: "result2", metadata: {} };
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output2);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "5" }, output2);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "6" }, output2);

      // #then - reminder should be shown again (state was reset)
      expect(output2.output).toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should reset state on session.compacted event", async () => {
      // #given - operator agent with reminder already shown
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "compact-session";
      updateSessionAgent(sessionID, "operator");

      const output1 = { title: "", output: "result1", metadata: {} };
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "1" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output1);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output1);
      expect(output1.output).toContain("[Category+Skill Reminder]");

      // #when - session is compacted
      await hook.event({ event: { type: "session.compacted", properties: { sessionID } } });

      const output2 = { title: "", output: "result2", metadata: {} };
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output2);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "5" }, output2);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "6" }, output2);

      // #then - reminder should be shown again (state was reset)
      expect(output2.output).toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });
  });

  describe("case insensitivity", () => {
    test("should handle tool names case-insensitively", async () => {
      // #given - operator agent with mixed case tool names
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "case-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - tool calls with different cases
      await hook["tool.execute.after"]({ tool: "EDIT", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "Edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);

      // #then - reminder should be injected (all counted)
      expect(output.output).toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });

    test("should handle delegation tool names case-insensitively", async () => {
      // #given - cipherOperator agent using DELEGATE_TASK in uppercase
      const hook = createCategorySkillReminderHook(createMockPluginInput());
      const sessionID = "case-delegate-session";
      updateSessionAgent(sessionID, "operator");

      const output = { title: "", output: "result", metadata: {} };

      // #when - DELEGATE_TASK in uppercase is used
      await hook["tool.execute.after"]({ tool: "DELEGATE_TASK", sessionID, callID: "1" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "2" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "3" }, output);
      await hook["tool.execute.after"]({ tool: "edit", sessionID, callID: "4" }, output);

      // #then - reminder should NOT be injected (delegation was detected)
      expect(output.output).not.toContain("[Category+Skill Reminder]");

      clearSessionAgent(sessionID);
    });
  });
});
