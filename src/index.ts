import type { Plugin } from "@opencode-ai/plugin";
import {
  createTodoContinuationEnforcer,
  createContextWindowMonitorHook,
  createSessionRecoveryHook,
  createSessionNotification,
  createCommentCheckerHooks,
  createDeterministicEditGuardHook,
  createToolOutputTruncatorHook,
  createDirectoryAgentsInjectorHook,
  createDirectoryReadmeInjectorHook,
  createEmptyTaskResponseDetectorHook,
  createThinkModeHook,
  createClaudeCodeHooksHook,
  createAnthropicContextWindowLimitRecoveryHook,
  createCompactionContextInjector,
  createRulesInjectorHook,
  createBackgroundNotificationHook,
  createAutoUpdateCheckerHook,
  createKeywordDetectorHook,
  createAgentUsageReminderHook,
  createNonInteractiveEnvHook,
  createInteractiveBashSessionHook,
  createThinkingBlockValidatorHook,
  createCategorySkillReminderHook,
  createUltraworkLoopHook,
  createAutoSlashCommandHook,
  createEditErrorRecoveryHook,
  createDelegateTaskRetryHook,
  createTaskResumeInfoHook,
  createStartWorkHook,
  createOrchestratorHook,
  createPlannerMdOnlyHook,
  createExecutorNotepadHook,
  createQuestionLabelTruncatorHook,
  createSubagentQuestionBlockerHook,
  createStopContinuationGuardHook,
} from "./orchestration/hooks";
import {
  contextCollector,
  createContextInjectorMessagesTransformHook,
} from "./execution/features/context-injector";
import {
  applyAgentVariant,
  resolveAgentVariant,
  resolveVariantForModel,
} from "./integration/shared/agent-variant";
import { createFirstMessageVariantGate } from "./integration/shared/first-message-variant";
import {
  discoverUserClaudeSkills,
  discoverProjectClaudeSkills,
  discoverOpencodeGlobalSkills,
  discoverOpencodeProjectSkills,
  mergeSkills,
} from "./execution/features/opencode-skill-loader";
import { createSkills } from "./execution/features/skills";
import { createAgents } from "./orchestration/agents";
import { getSystemMcpServerNames } from "./execution/features/claude-code-mcp-loader";
import {
  setMainSession,
  getMainSessionID,
  setSessionAgent,
  updateSessionAgent,
  clearSessionAgent,
} from "./execution/features/claude-code-session-state";
import {
  tools,
  createBackgroundTools,
  createLookAt,
  createSkillTool,
  createSkillMcpTool,
  createSlashcommandTool,
  discoverCommandsSync,
  sessionExists,
  createDelegateTask,
  interactive_bash,
  startTmuxCheck,
  lspManager,
} from "./execution/tools";
import { BackgroundManager } from "./execution/features/background-agent";
import { SkillMcpManager } from "./execution/features/skill-mcp-manager";
import { initTaskToastManager } from "./execution/features/task-toast-manager";
import { TmuxSessionManager } from "./execution/features/tmux-subagent";
import { clearUltraworkState } from "./execution/features/ultrawork-state";
import { type HookName } from "./platform/config";
import {
  log,
  resetMessageCursor,
  includesCaseInsensitive,
  runHookWithTelemetry,
} from "./integration/shared";
import {
  detectExternalNotificationPlugin,
  getNotificationConflictWarning,
} from "./platform/opencode/external-plugin-detector";
import { hasConnectedProvidersCache } from "./platform/opencode/connected-providers-cache";
import {
  getOpenCodeVersion,
  isOpenCodeVersionAtLeast,
  OPENCODE_NATIVE_AGENTS_INJECTION_VERSION,
} from "./platform/opencode/version";
import { loadPluginConfig } from "./plugin-config";
import { createModelCacheState, getModelLimit } from "./plugin-state";
import { createConfigHandler } from "./platform/opencode/config-composer";

const GhostwirePlugin: Plugin = async (ctx) => {
  log("[GhostwirePlugin] ENTRY - plugin loading", { directory: ctx.directory });
  // Start background tmux check immediately
  startTmuxCheck();

  const pluginConfig = loadPluginConfig(ctx.directory, ctx);
  const disabledHooks = new Set(pluginConfig.disabled_hooks ?? []);
  const firstMessageVariantGate = createFirstMessageVariantGate();

  const tmuxConfig = {
    enabled: pluginConfig.tmux?.enabled ?? false,
    layout: pluginConfig.tmux?.layout ?? "main-vertical",
    main_pane_size: pluginConfig.tmux?.main_pane_size ?? 60,
    main_pane_min_width: pluginConfig.tmux?.main_pane_min_width ?? 120,
    agent_pane_min_width: pluginConfig.tmux?.agent_pane_min_width ?? 40,
  } as const;
  const isHookEnabled = (hookName: HookName) => !disabledHooks.has(hookName);
  const runHook = <T>(
    phase:
      | "chat.message"
      | "tool.execute.before"
      | "tool.execute.after"
      | "event"
      | "experimental.chat.messages.transform",
    hookName: string,
    invoke: () => Promise<T> | T,
  ) =>
    runHookWithTelemetry({
      phase,
      hookName,
      invoke,
    });

  const modelCacheState = createModelCacheState();

  const contextWindowMonitor = isHookEnabled("context-window-monitor")
    ? createContextWindowMonitorHook(ctx)
    : null;
  const sessionRecovery = isHookEnabled("session-recovery")
    ? createSessionRecoveryHook(ctx, {
        experimental: pluginConfig.experimental,
      })
    : null;

  // Check for conflicting notification plugins before creating grid-session-notification
  let sessionNotification = null;
  if (isHookEnabled("session-notification")) {
    const forceEnable = pluginConfig.notification?.force_enable ?? false;
    const externalNotifier = detectExternalNotificationPlugin(ctx.directory);

    if (externalNotifier.detected && !forceEnable) {
      // External notification plugin detected - skip our notification to avoid conflicts
      log(getNotificationConflictWarning(externalNotifier.pluginName!));
      log("session-notification disabled due to external notifier conflict", {
        detected: externalNotifier.pluginName,
        allPlugins: externalNotifier.allPlugins,
      });
    } else {
      sessionNotification = createSessionNotification(ctx);
    }
  }

  const commentChecker = isHookEnabled("comment-checker")
    ? createCommentCheckerHooks(pluginConfig.comment_checker)
    : null;
  const deterministicEditGuard = isHookEnabled("deterministic-edit-guard")
    ? createDeterministicEditGuardHook(ctx)
    : null;
  const toolOutputTruncator = isHookEnabled("tool-output-truncator")
    ? createToolOutputTruncatorHook(ctx, {
        experimental: pluginConfig.experimental,
      })
    : null;
  // Check for native OpenCode AGENTS.md injection support before creating hook
  let directoryAgentsInjector = null;
  if (isHookEnabled("directory-agents-injector")) {
    const currentVersion = getOpenCodeVersion();
    const hasNativeSupport =
      currentVersion !== null && isOpenCodeVersionAtLeast(OPENCODE_NATIVE_AGENTS_INJECTION_VERSION);

    if (hasNativeSupport) {
      log("directory-agents-injector auto-disabled due to native OpenCode support", {
        currentVersion,
        nativeVersion: OPENCODE_NATIVE_AGENTS_INJECTION_VERSION,
      });
    } else {
      directoryAgentsInjector = createDirectoryAgentsInjectorHook(ctx);
    }
  }
  const directoryReadmeInjector = isHookEnabled("directory-readme-injector")
    ? createDirectoryReadmeInjectorHook(ctx)
    : null;
  const emptyTaskResponseDetector = isHookEnabled("empty-task-response-detector")
    ? createEmptyTaskResponseDetectorHook(ctx)
    : null;
  const thinkMode = isHookEnabled("think-mode") ? createThinkModeHook() : null;
  const claudeCodeHooks = createClaudeCodeHooksHook(
    ctx,
    {
      disabledHooks: (pluginConfig.claude_code?.hooks ?? true) ? undefined : true,
      keywordDetectorDisabled: !isHookEnabled("keyword-detector"),
    },
    contextCollector,
  );
  const anthropicContextWindowLimitRecovery = isHookEnabled(
    "anthropic-context-window-limit-recovery",
  )
    ? createAnthropicContextWindowLimitRecoveryHook(ctx, {
        experimental: pluginConfig.experimental,
      })
    : null;
  const compactionContextInjector = isHookEnabled("compaction-context-injector")
    ? createCompactionContextInjector()
    : undefined;
  const rulesInjector = isHookEnabled("rules-injector") ? createRulesInjectorHook(ctx) : null;
  const autoUpdateChecker = isHookEnabled("auto-update-checker")
    ? createAutoUpdateCheckerHook(ctx, {
        showStartupToast: isHookEnabled("startup-toast"),
        isOperatorEnabled: pluginConfig.operator?.disabled !== true,
        autoUpdate: pluginConfig.auto_update ?? true,
      })
    : null;
  const keywordDetector = isHookEnabled("keyword-detector")
    ? createKeywordDetectorHook(ctx, contextCollector)
    : null;
  const contextInjectorMessagesTransform =
    createContextInjectorMessagesTransformHook(contextCollector);
  const agentUsageReminder = isHookEnabled("agent-usage-reminder")
    ? createAgentUsageReminderHook(ctx)
    : null;
  const nonInteractiveEnv = isHookEnabled("non-interactive-env")
    ? createNonInteractiveEnvHook(ctx)
    : null;
  const interactiveBashSession = isHookEnabled("interactive-bash-session")
    ? createInteractiveBashSessionHook(ctx)
    : null;

  const thinkingBlockValidator = isHookEnabled("thinking-block-validator")
    ? createThinkingBlockValidatorHook()
    : null;

  const categorySkillReminder = isHookEnabled("category-skill-reminder")
    ? createCategorySkillReminderHook(ctx)
    : null;

  const ultraworkLoop = isHookEnabled("ultrawork-loop")
    ? createUltraworkLoopHook(ctx, {
        config: pluginConfig.ultrawork_loop,
        checkSessionExists: async (sessionId) => sessionExists(sessionId),
      })
    : null;

  const editErrorRecovery = isHookEnabled("edit-error-recovery")
    ? createEditErrorRecoveryHook(ctx)
    : null;

  const delegateTaskRetry = isHookEnabled("delegate-task-retry")
    ? createDelegateTaskRetryHook(ctx)
    : null;

  const startWork = isHookEnabled("start-work") ? createStartWorkHook(ctx) : null;

  const plannerMdOnly = isHookEnabled("planner-md-only") ? createPlannerMdOnlyHook(ctx) : null;

  const cipherJuniorNotepad = isHookEnabled("executor-notepad")
    ? createExecutorNotepadHook(ctx)
    : null;

  const questionLabelTruncator = createQuestionLabelTruncatorHook();
  const subagentQuestionBlocker = createSubagentQuestionBlockerHook();

  const taskResumeInfo = createTaskResumeInfoHook();

  const tmuxSessionManager = new TmuxSessionManager(ctx, tmuxConfig);

  const backgroundManager = new BackgroundManager(ctx, pluginConfig.background_task, {
    tmuxConfig,
    onSubagentSessionCreated: async (event) => {
      log("[index] onSubagentSessionCreated callback received", {
        sessionID: event.sessionID,
        parentID: event.parentID,
        title: event.title,
      });
      await tmuxSessionManager.onSessionCreated({
        type: "session.created",
        properties: {
          info: {
            id: event.sessionID,
            parentID: event.parentID,
            title: event.title,
          },
        },
      });
      log("[index] onSubagentSessionCreated callback completed");
    },
    onShutdown: () => {
      tmuxSessionManager.cleanup().catch((error) => {
        log("[index] tmux cleanup error during shutdown:", error);
      });
    },
  });

  const nexusHook = isHookEnabled("orchestrator")
    ? createOrchestratorHook(ctx, { directory: ctx.directory, backgroundManager })
    : null;

  initTaskToastManager(ctx.client);

  const stopContinuationGuard = isHookEnabled("stop-continuation-guard")
    ? createStopContinuationGuardHook(ctx)
    : null;

  const todoContinuationEnforcer = isHookEnabled("todo-continuation-enforcer")
    ? createTodoContinuationEnforcer(ctx, {
        backgroundManager,
        isContinuationStopped: stopContinuationGuard?.isStopped,
      })
    : null;

  if (sessionRecovery && todoContinuationEnforcer) {
    sessionRecovery.setOnAbortCallback(todoContinuationEnforcer.markRecovering);
    sessionRecovery.setOnRecoveryCompleteCallback(todoContinuationEnforcer.markRecoveryComplete);
  }

  const backgroundNotificationHook = isHookEnabled("background-notification")
    ? createBackgroundNotificationHook(backgroundManager)
    : null;
  const backgroundTools = createBackgroundTools(backgroundManager, ctx.client);

  const isMultimodalLookerEnabled = !includesCaseInsensitive(
    pluginConfig.disabled_agents ?? [],
    "research",
  );
  const lookAt = isMultimodalLookerEnabled ? createLookAt(ctx) : null;
  const browserProvider = pluginConfig.browser_automation_engine?.provider ?? "playwright";
  const delegateTask = createDelegateTask({
    manager: backgroundManager,
    client: ctx.client,
    directory: ctx.directory,
    userCategories: pluginConfig.categories,
    gitMasterConfig: pluginConfig.git_master,
    cipherJuniorModel: pluginConfig.agents?.do?.model,
    browserProvider,
    onSyncSessionCreated: async (event) => {
      log("[index] onSyncSessionCreated callback", {
        sessionID: event.sessionID,
        parentID: event.parentID,
        title: event.title,
      });
      await tmuxSessionManager.onSessionCreated({
        type: "session.created",
        properties: {
          info: {
            id: event.sessionID,
            parentID: event.parentID,
            title: event.title,
          },
        },
      });
    },
  });
  const disabledSkills = new Set(pluginConfig.disabled_skills ?? []);
  const systemMcpNames = getSystemMcpServerNames();
  const skills = createSkills({ browserProvider }).filter((skill) => {
    if (disabledSkills.has(skill.name as never)) return false;
    if (skill.mcpConfig) {
      for (const mcpName of Object.keys(skill.mcpConfig)) {
        if (systemMcpNames.has(mcpName)) return false;
      }
    }
    return true;
  });
  const includeClaudeSkills = pluginConfig.claude_code?.skills !== false;
  const [userSkills, globalSkills, projectSkills, opencodeProjectSkills] = await Promise.all([
    includeClaudeSkills ? discoverUserClaudeSkills() : Promise.resolve([]),
    discoverOpencodeGlobalSkills(),
    includeClaudeSkills ? discoverProjectClaudeSkills() : Promise.resolve([]),
    discoverOpencodeProjectSkills(),
  ]);
  const mergedSkills = mergeSkills(
    skills,
    pluginConfig.skills,
    userSkills,
    globalSkills,
    projectSkills,
    opencodeProjectSkills,
  );
  const skillMcpManager = new SkillMcpManager();
  const getSessionIDForMcp = () => getMainSessionID() || "";
  const skillTool = createSkillTool({
    skills: mergedSkills,
    mcpManager: skillMcpManager,
    getSessionID: getSessionIDForMcp,
    gitMasterConfig: pluginConfig.git_master,
  });
  const skillMcpTool = createSkillMcpTool({
    manager: skillMcpManager,
    getLoadedSkills: () => mergedSkills,
    getSessionID: getSessionIDForMcp,
  });

  const commands = discoverCommandsSync();

  // Create builtin agents with configuration
  // Don't pass ctx.directory - let it use PLUGIN_ROOT to load from embedded manifest
  // This ensures agents are always available regardless of what directory is being worked on
  const builtinAgents = await createAgents({
    disabledAgents: pluginConfig.disabled_agents ?? [],
    agentOverrides: pluginConfig.agents,
    // Use PLUGIN_ROOT + embedded manifest, not ctx.directory
    systemDefaultModel: pluginConfig.default_model,
    categories: pluginConfig.categories,
    gitMasterConfig: pluginConfig.git_master,
    discoveredSkills: mergedSkills,
    client: ctx.client,
  });

  const slashcommandTool = createSlashcommandTool({
    commands,
    skills: mergedSkills,
  });

  const autoSlashCommand = isHookEnabled("auto-slash-command")
    ? createAutoSlashCommandHook({ skills: mergedSkills })
    : null;

  const configHandler = createConfigHandler({
    ctx: { directory: ctx.directory, client: ctx.client },
    pluginConfig,
    modelCacheState,
  });

  return {
    agent: builtinAgents,

    skill: mergedSkills.reduce(
      (acc, skill) => {
        acc[skill.name] = skill;
        return acc;
      },
      {} as Record<string, (typeof mergedSkills)[0]>,
    ),

    command: commands.reduce(
      (acc, command) => {
        acc[command.name] = command;
        return acc;
      },
      {} as Record<string, (typeof commands)[0]>,
    ),

    tool: {
      ...tools,
      ...backgroundTools,
      ...(lookAt ? { look_at: lookAt } : {}),
      delegate_task: delegateTask,
      skill: skillTool,
      skill_mcp: skillMcpTool,
      slashcommand: slashcommandTool,
      interactive_bash,
    },

    "chat.message": async (input, output) => {
      if (input.agent) {
        setSessionAgent(input.sessionID, input.agent);
      }

      const message = (output as { message: { variant?: string } }).message;
      if (firstMessageVariantGate.shouldOverride(input.sessionID)) {
        const variant =
          input.model && input.agent
            ? resolveVariantForModel(pluginConfig, input.agent, input.model)
            : resolveAgentVariant(pluginConfig, input.agent);
        if (variant !== undefined) {
          message.variant = variant;
        }
        firstMessageVariantGate.markApplied(input.sessionID);
      } else {
        if (input.model && input.agent && message.variant === undefined) {
          const variant = resolveVariantForModel(pluginConfig, input.agent, input.model);
          if (variant !== undefined) {
            message.variant = variant;
          }
        } else {
          applyAgentVariant(pluginConfig, input.agent, message);
        }
      }

      await runHook("chat.message", "stop-continuation-guard", () =>
        stopContinuationGuard?.["chat.message"]?.(input),
      );
      await runHook("chat.message", "keyword-detector", () =>
        keywordDetector?.["chat.message"]?.(input, output),
      );
      await runHook("chat.message", "claude-code-hooks", () =>
        claudeCodeHooks["chat.message"]?.(input, output),
      );
      await runHook("chat.message", "auto-slash-command", () =>
        autoSlashCommand?.["chat.message"]?.(input, output),
      );
      await runHook("chat.message", "start-work", () =>
        startWork?.["chat.message"]?.(input, output),
      );

      if (!hasConnectedProvidersCache()) {
        ctx.client.tui
          .showToast({
            body: {
              title: "⚠️ Provider Cache Missing",
              message: "Model filtering disabled. RESTART OpenCode to enable full functionality.",
              variant: "warning" as const,
              duration: 6000,
            },
          })
          .catch(() => {});
      }

      if (ultraworkLoop) {
        const parts = (output as { parts?: Array<{ type: string; text?: string }> }).parts;
        const promptText =
          parts
            ?.filter((p) => p.type === "text" && p.text)
            .map((p) => p.text)
            .join("\n")
            .trim() || "";

        const isRalphLoopTemplate =
          promptText.includes("You are starting a Ralph Loop") &&
          promptText.includes("<user-task>");
        const isCancelRalphTemplate = promptText.includes("Cancel the currently active Ralph Loop");

        if (isRalphLoopTemplate) {
          const taskMatch = promptText.match(/<user-task>\s*([\s\S]*?)\s*<\/user-task>/i);
          const rawTask = taskMatch?.[1]?.trim() || "";

          const quotedMatch = rawTask.match(/^["'](.+?)["']/);
          const prompt =
            quotedMatch?.[1] ||
            rawTask.split(/\s+--/)[0]?.trim() ||
            "Complete the task as instructed";

          const maxIterMatch = rawTask.match(/--max-iterations=(\d+)/i);
          const promiseMatch = rawTask.match(/--completion-promise=["']?([^"'\s]+)["']?/i);

          log("[ultrawork-loop] Starting loop from chat.message", {
            sessionID: input.sessionID,
            prompt,
          });
          ultraworkLoop.startLoop(input.sessionID, prompt, {
            maxIterations: maxIterMatch ? parseInt(maxIterMatch[1], 10) : undefined,
            completionPromise: promiseMatch?.[1],
          });
        } else if (isCancelRalphTemplate) {
          log("[ultrawork-loop] Cancelling loop from chat.message", {
            sessionID: input.sessionID,
          });
          ultraworkLoop.cancelLoop(input.sessionID);
        }
      }
    },

    "experimental.chat.messages.transform": async (
      input: Record<string, never>,
      output: { messages: Array<{ info: unknown; parts: unknown[] }> },
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await runHook("experimental.chat.messages.transform", "context-injector", () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contextInjectorMessagesTransform?.["experimental.chat.messages.transform"]?.(
          input,
          output as any,
        ),
      );
      await runHook("experimental.chat.messages.transform", "thinking-block-validator", () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thinkingBlockValidator?.["experimental.chat.messages.transform"]?.(input, output as any),
      );
    },

    config: configHandler,

    event: async (input) => {
      await runHook("event", "auto-update-checker", () => autoUpdateChecker?.event(input));
      await runHook("event", "claude-code-hooks", () => claudeCodeHooks.event(input));
      await runHook("event", "background-notification", () =>
        backgroundNotificationHook?.event(input),
      );
      await runHook("event", "session-notification", () => sessionNotification?.(input));
      await runHook("event", "todo-continuation-enforcer", () =>
        todoContinuationEnforcer?.handler(input),
      );
      await runHook("event", "deterministic-edit-guard", () =>
        deterministicEditGuard?.event?.(input as { event: { type: string; properties?: Record<string, unknown> } }),
      );
      await runHook("event", "context-window-monitor", () => contextWindowMonitor?.event(input));
      await runHook("event", "directory-agents-injector", () =>
        directoryAgentsInjector?.event(input),
      );
      await runHook("event", "directory-readme-injector", () =>
        directoryReadmeInjector?.event(input),
      );
      await runHook("event", "rules-injector", () => rulesInjector?.event(input));
      await runHook("event", "think-mode", () => thinkMode?.event(input));
      await runHook("event", "anthropic-context-window-limit-recovery", () =>
        anthropicContextWindowLimitRecovery?.event(input),
      );
      await runHook("event", "agent-usage-reminder", () => agentUsageReminder?.event(input));
      await runHook("event", "category-skill-reminder", () => categorySkillReminder?.event(input));
      await runHook("event", "interactive-bash-session", () =>
        interactiveBashSession?.event(input),
      );
      await runHook("event", "ultrawork-loop", () => ultraworkLoop?.event(input));
      await runHook("event", "stop-continuation-guard", () => stopContinuationGuard?.event(input));
      await runHook("event", "orchestrator", () => nexusHook?.handler(input));

      const { event } = input;
      const props = event.properties as Record<string, unknown> | undefined;

      if (event.type === "session.created") {
        const sessionInfo = props?.info as
          | { id?: string; title?: string; parentID?: string }
          | undefined;
        log("[event] session.created", { sessionInfo, props });
        if (!sessionInfo?.parentID) {
          setMainSession(sessionInfo?.id);
        }
        firstMessageVariantGate.markSessionCreated(sessionInfo);
        await tmuxSessionManager.onSessionCreated(
          event as {
            type: string;
            properties?: {
              info?: { id?: string; parentID?: string; title?: string };
            };
          },
        );
      }

      if (event.type === "session.deleted") {
        const sessionInfo = props?.info as { id?: string } | undefined;
        if (sessionInfo?.id === getMainSessionID()) {
          setMainSession(undefined);
        }
        if (sessionInfo?.id) {
          clearSessionAgent(sessionInfo.id);
          resetMessageCursor(sessionInfo.id);
          firstMessageVariantGate.clear(sessionInfo.id);
          await skillMcpManager.disconnectSession(sessionInfo.id);
          await lspManager.cleanupTempDirectoryClients();
          await tmuxSessionManager.onSessionDeleted({
            sessionID: sessionInfo.id,
          });
        }
      }

      if (event.type === "message.updated") {
        const info = props?.info as Record<string, unknown> | undefined;
        const sessionID = info?.sessionID as string | undefined;
        const agent = info?.agent as string | undefined;
        const role = info?.role as string | undefined;
        if (sessionID && agent && role === "user") {
          updateSessionAgent(sessionID, agent);
        }
      }

      if (event.type === "session.error") {
        const sessionID = props?.sessionID as string | undefined;
        const error = props?.error;

        if (sessionRecovery?.isRecoverableError(error)) {
          const messageInfo = {
            id: props?.messageID as string | undefined,
            role: "assistant" as const,
            sessionID,
            error,
          };
          const recovered = await sessionRecovery.handleSessionRecovery(messageInfo);

          if (
            recovered &&
            sessionID &&
            sessionID === getMainSessionID() &&
            !stopContinuationGuard?.isStopped(sessionID)
          ) {
            await ctx.client.session
              .prompt({
                path: { id: sessionID },
                body: { parts: [{ type: "text", text: "continue" }] },
                query: { directory: ctx.directory },
              })
              .catch(() => {});
          }
        }
      }
    },

    "tool.execute.before": async (input, output) => {
      await runHook("tool.execute.before", "subagent-question-blocker", () =>
        subagentQuestionBlocker["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "question-label-truncator", () =>
        questionLabelTruncator["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "claude-code-hooks", () =>
        claudeCodeHooks["tool.execute.before"](input, output),
      );
      await runHook("tool.execute.before", "non-interactive-env", () =>
        nonInteractiveEnv?.["tool.execute.before"](input, output),
      );
      await runHook("tool.execute.before", "deterministic-edit-guard", () =>
        deterministicEditGuard?.["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "comment-checker", () =>
        commentChecker?.["tool.execute.before"](input, output),
      );
      await runHook("tool.execute.before", "directory-agents-injector", () =>
        directoryAgentsInjector?.["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "directory-readme-injector", () =>
        directoryReadmeInjector?.["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "rules-injector", () =>
        rulesInjector?.["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "planner-md-only", () =>
        plannerMdOnly?.["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "executor-notepad", () =>
        cipherJuniorNotepad?.["tool.execute.before"]?.(input, output),
      );
      await runHook("tool.execute.before", "orchestrator", () =>
        nexusHook?.["tool.execute.before"]?.(input, output),
      );

      if (input.tool === "task") {
        const args = output.args as Record<string, unknown>;
        const subagentType = args.subagent_type as string;
        const isExploreOrLibrarian = includesCaseInsensitive(["research"], subagentType ?? "");

        args.tools = {
          ...(args.tools as Record<string, boolean> | undefined),
          delegate_task: false,
          ...(isExploreOrLibrarian ? { look_at: false } : {}),
        };
      }

      if (ultraworkLoop && input.tool === "slashcommand") {
        const args = output.args as { command?: string } | undefined;
        const command = args?.command?.replace(/^\//, "").toLowerCase();
        const sessionID = input.sessionID || getMainSessionID();

        if ((command === "ghostwire:work:loop" || command === "work:loop") && sessionID) {
          const rawArgs = args?.command?.replace(/^\/?(ghostwire:)?work:loop\s*/i, "") || "";
          const taskMatch = rawArgs.match(/^["'](.+?)["']/);
          const prompt =
            taskMatch?.[1] ||
            rawArgs.split(/\s+--/)[0]?.trim() ||
            "Complete the task as instructed";

          const maxIterMatch = rawArgs.match(/--max-iterations=(\d+)/i);
          const promiseMatch = rawArgs.match(/--completion-promise=["']?([^"'\s]+)["']?/i);

          ultraworkLoop.startLoop(sessionID, prompt, {
            maxIterations: maxIterMatch ? parseInt(maxIterMatch[1], 10) : undefined,
            completionPromise: promiseMatch?.[1],
          });
        } else if (command === "ghostwire:work:cancel" && sessionID) {
          ultraworkLoop.cancelLoop(sessionID);
        }
      }

      if (input.tool === "slashcommand") {
        const args = output.args as { command?: string } | undefined;
        const command = args?.command?.replace(/^\//, "").toLowerCase();
        const sessionID = input.sessionID || getMainSessionID();

        if (command === "ghostwire:workflows:stop" && sessionID) {
          stopContinuationGuard?.stop(sessionID);
          todoContinuationEnforcer?.cancelAllCountdowns();
          ultraworkLoop?.cancelLoop(sessionID);
          clearUltraworkState(ctx.directory);
          log("[workflows:stop] All continuation mechanisms stopped", {
            sessionID,
          });
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      // Guard against undefined output (e.g., from /review command - see issue #1035)
      if (!output) {
        return;
      }
      await runHook("tool.execute.after", "claude-code-hooks", () =>
        claudeCodeHooks["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "tool-output-truncator", () =>
        toolOutputTruncator?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "context-window-monitor", () =>
        contextWindowMonitor?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "deterministic-edit-guard", () =>
        deterministicEditGuard?.["tool.execute.after"]?.(input, output),
      );
      await runHook("tool.execute.after", "comment-checker", () =>
        commentChecker?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "directory-agents-injector", () =>
        directoryAgentsInjector?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "directory-readme-injector", () =>
        directoryReadmeInjector?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "rules-injector", () =>
        rulesInjector?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "empty-task-response-detector", () =>
        emptyTaskResponseDetector?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "agent-usage-reminder", () =>
        agentUsageReminder?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "category-skill-reminder", () =>
        categorySkillReminder?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "interactive-bash-session", () =>
        interactiveBashSession?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "edit-error-recovery", () =>
        editErrorRecovery?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "delegate-task-retry", () =>
        delegateTaskRetry?.["tool.execute.after"](input, output),
      );
      await runHook("tool.execute.after", "orchestrator", () =>
        nexusHook?.["tool.execute.after"]?.(input, output),
      );
      await runHook("tool.execute.after", "task-resume-info", () =>
        taskResumeInfo["tool.execute.after"](input, output),
      );
    },
  };
};

export default GhostwirePlugin;

export type {
  GhostwireConfig,
  AgentName,
  AgentOverrideConfig,
  AgentOverrides,
  McpName,
  HookName,
  CommandName,
} from "./platform/config";

// NOTE: Do NOT export functions from main index.ts!
// OpenCode treats ALL exports as plugin instances and calls them.
// Config error utilities are available via "./shared/config-errors" for internal use only.
export type { ConfigLoadError } from "./integration/shared/config-errors";
