import { defineCommand, runMain } from "citty";
import { cyan, green, yellow, red, bold, dim, italic, isColorSupported } from "picocolors";
import { createSpinner } from "nanospinner";

type CommandFactory = () => Promise<void>;

const run = async (
  cmd: string[],
  opts?: { spinnerText?: string; pipeOutput?: boolean },
): Promise<void> => {
  const spinner =
    opts?.spinnerText && isColorSupported ? createSpinner(opts.spinnerText).start() : undefined;

  try {
    const proc = Bun.spawn({
      cmd,
      stdin: "inherit",
      stdout: opts?.pipeOutput ? "pipe" : "inherit",
      stderr: opts?.pipeOutput ? "pipe" : "inherit",
    });

    await proc.exited;

    spinner?.success({ text: `${green("done")} ${dim(cmd.join(" "))}` });
  } catch (error) {
    spinner?.error({
      text: `${red("failed")} ${dim(cmd.join(" "))}`,
    });
    throw error;
  }
};

const tasks: Record<string, CommandFactory> = {
  help: async () => {
    console.log(
      `${bold("Available commands:")}

${green("build")}       Full production build (clean + schema + agents + CLI)
${green("build-fast")}  Incremental build (no clean, no cover)
${green("dev")}         Watch mode for ${cyan("bun build src/index.ts --watch")}
${green("test")}        Run ${bold("bun test")} (includes type checking automatically)
${green("typecheck")}   Run ${bold("bunx tsc --noEmit")}
${green("clean")}       Remove ${italic("dist")} artifacts
${green("sync")}        Build + copy plugin to OpenCode path
${green("schema")}      Regenerate JSON schema
${green("agents")}      Regenerate agents manifest
${green("binaries")}    Build platform-specific binaries
${green("docs")}        Sync documentation
${green("topology")}    Check repository topology
${green("dev-setup")}   Ensure plugin wrapper + agents manifest
`,
    );
  },

  build: async () => {
    await run(["bun", "run", "script/ensure-plugin-wrapper.ts"], {
      spinnerText: "Ensuring plugin wrapper",
    });
    await run(["bun", "run", "script/build-agents-manifest.ts"], {
      spinnerText: "Generating agents manifest",
    });
    await run(["bun", "run", "script/build-schema.ts"], {
      spinnerText: "Regenerating schema",
    });
    await run(
      [
        "bun",
        "build",
        "src/index.ts",
        "--outdir",
        "dist",
        "--target",
        "bun",
        "--format",
        "esm",
        "--external",
        "@ast-grep/napi",
      ],
      { spinnerText: "Building main plugin" },
    );
    await run(["bunx", "tsc", "--emitDeclarationOnly"], {
      spinnerText: "Generating declarations",
    });
    await run(
      [
        "bun",
        "build",
        "src/cli/index.ts",
        "--outdir",
        "dist/cli",
        "--target",
        "bun",
        "--format",
        "esm",
        "--external",
        "@ast-grep/napi",
      ],
      { spinnerText: "Building CLI" },
    );
    await run(["bun", "run", "script/copy-skills.ts"], {
      spinnerText: "Copying skills",
    });
    console.log(green("✓ Build complete"));
  },

  "build-fast": async () => {
    await run(
      [
        "bun",
        "build",
        "src/index.ts",
        "--outdir",
        "dist",
        "--target",
        "bun",
        "--format",
        "esm",
        "--external",
        "@ast-grep/napi",
      ],
      { spinnerText: "Building plugin (fast)" },
    );
    await run(["bunx", "tsc", "--emitDeclarationOnly"], {
      spinnerText: "Generating declarations",
    });
    await run(
      [
        "bun",
        "build",
        "src/cli/index.ts",
        "--outdir",
        "dist/cli",
        "--target",
        "bun",
        "--format",
        "esm",
        "--external",
        "@ast-grep/napi",
      ],
      { spinnerText: "Building CLI" },
    );
    await run(["bun", "run", "script/copy-skills.ts"], {
      spinnerText: "Copying skills",
    });
    await run(["bun", "run", "script/build-schema.ts"], {
      spinnerText: "Regenerating schema",
    });
    console.log(green("✓ Fast build complete"));
  },

  dev: async () => {
    console.log(green("Starting development build (watch)..."));
    await run(
      [
        "bun",
        "build",
        "src/index.ts",
        "--watch",
        "--outdir",
        "dist",
        "--target",
        "bun",
        "--format",
        "esm",
        "--external",
        "@ast-grep/napi",
      ],
      { spinnerText: "Watching sources" },
    );
  },

  test: async () => {
    await tasks["typecheck"]();
    console.log(yellow("Running bun test..."));
    await run(["bun", "test"], { spinnerText: "Executing tests" });
  },

  typecheck: async () => {
    await run(["bunx", "tsc", "--noEmit"], {
      spinnerText: "Type checking",
    });
  },

  clean: async () => {
    await run(["rm", "-rf", "dist"], {
      spinnerText: "Cleaning dist output",
    });
    console.log(green("✓ Clean complete"));
  },

  sync: async () => {
    await tasks["build"]();
    await run(["bun", "run", "script/sync-ghostwire-config.ts"], {
      spinnerText: "Syncing ghostwire config",
    });
    await run(
      ["cp", "dist/index.js", `${process.env.HOME}/.config/opencode/plugins/ghostwire.mjs`],
      { spinnerText: "Syncing plugin" },
    );
    console.log(green("✓ Sync complete"));
  },

  schema: async () => {
    await run(["bun", "run", "script/build-schema.ts"], {
      spinnerText: "Regenerating schema",
    });
  },

  agents: async () => {
    await run(["bun", "run", "script/build-agents-manifest.ts"], {
      spinnerText: "Regenerating agents manifest",
    });
  },

  binaries: async () => {
    await run(["bun", "run", "script/build-binaries.ts"], {
      spinnerText: "Building platform binaries",
    });
  },

  docs: async () => {
    await run(["bun", "run", "script/sync-docs.ts"], {
      spinnerText: "Syncing docs",
    });
  },

  topology: async () => {
    await run(["bun", "run", "script/check-topology.ts"], {
      spinnerText: "Checking topology",
    });
  },

  "dev-setup": async () => {
    await tasks["agents"]();
    await run(["bun", "run", "script/ensure-plugin-wrapper.ts"], {
      spinnerText: "Ensuring plugin wrapper exists",
    });
    console.log(green("✓ Development setup ready"));
  },
};

const command = defineCommand({
  meta: {
    name: "task",
    description: "Bun-first task runner for Ghostwire",
    version: "3.1.10",
  },
  args: {
    name: {
      type: "positional",
      description: "Task to run",
      required: false,
      default: "help",
    },
  },
  run: async (context) => {
    const taskName = context.args.name ?? "help";
    const task = tasks[taskName];
    if (!task) {
      console.log(red(`Unknown task: ${bold(taskName)}`));
      console.log(dim("Available tasks: " + Object.keys(tasks).join(", ")));
      process.exit(1);
    }
    await task();
  },
});

runMain(command);
