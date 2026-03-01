import { defineCommand, runMain } from "citty";
import { cyan, green, yellow, red, bold, dim, italic, isColorSupported } from "picocolors";
import { createSpinner } from "nanospinner";
import { homedir } from "os";
import { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, readlinkSync } from "fs";
import { join, resolve } from "path";

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

/**
 * Ensures the dev symlink exists at ~/.config/opencode/plugins/ghostwire.mjs
 * Points to the local dist/index.js for development
 */
async function ensureDevSymlink(): Promise<void> {
  const pluginsDir = join(homedir(), ".config/opencode/plugins");
  const symlinkPath = join(pluginsDir, "ghostwire.mjs");
  const distPath = join(process.cwd(), "dist/index.js");

  // Check if dist exists
  if (!existsSync(distPath)) {
    console.log(yellow("⚠ dist/index.js not found. Run 'bun run build' first."));
    console.log(dim("  The symlink will be created when you build."));
    return;
  }

  // Create plugins directory if needed
  if (!existsSync(pluginsDir)) {
    mkdirSync(pluginsDir, { recursive: true });
  }

  // Check if symlink exists and is valid
  let needsRecreation = false;
  if (existsSync(symlinkPath)) {
    try {
      const stats = lstatSync(symlinkPath);
      if (stats.isSymbolicLink()) {
        const target = readlinkSync(symlinkPath);
        const resolvedTarget = resolve(pluginsDir, target);
        if (resolvedTarget !== resolve(distPath)) {
          needsRecreation = true;
        }
      } else {
        // It's a file, not a symlink - need to replace it
        needsRecreation = true;
      }
    } catch {
      needsRecreation = true;
    }
  }

  if (needsRecreation) {
    try {
      unlinkSync(symlinkPath);
    } catch {
      // File might not exist, that's fine
    }
    symlinkSync(distPath, symlinkPath);
    console.log(green("✓ Created symlink: ") + dim(symlinkPath) + green(" → ") + dim(distPath));
  } else if (!existsSync(symlinkPath)) {
    symlinkSync(distPath, symlinkPath);
    console.log(green("✓ Created symlink: ") + dim(symlinkPath) + green(" → ") + dim(distPath));
  }
}

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
${green("schema")}      Regenerate JSON schema
${green("agents")}      Regenerate agents manifest
${green("commands")}    Regenerate commands manifest
${green("skills")}      Regenerate skills manifest
${green("docs")}        Sync documentation
${green("topology")}    Check repository topology
${green("dev-setup")}   Ensure plugin symlink + agents manifest
`,
    );
  },

  build: async () => {
    await run(["bun", "run", "src/script/build-agents-manifest.ts"], {
      spinnerText: "Generating agents manifest",
    });
    await run(["bun", "run", "src/script/build-commands-manifest.ts"], {
      spinnerText: "Generating commands manifest",
    });
    await run(["bun", "run", "src/script/build-skills-manifest.ts"], {
      spinnerText: "Generating skills manifest",
    });
    await run(["bun", "run", "src/script/build-schema.ts"], {
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
    await run(["bun", "run", "src/script/copy-skills.ts"], {
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
    await run(["bun", "run", "src/script/copy-skills.ts"], {
      spinnerText: "Copying skills",
    });
    await run(["bun", "run", "src/script/build-schema.ts"], {
      spinnerText: "Regenerating schema",
    });
    await run(["bun", "run", "src/script/build-commands-manifest.ts"], {
      spinnerText: "Regenerating commands manifest",
    });
    await run(["bun", "run", "src/script/build-skills-manifest.ts"], {
      spinnerText: "Regenerating skills manifest",
    });
    console.log(green("✓ Fast build complete"));
  },

  dev: async () => {
    // Ensure symlink exists before starting watch
    await ensureDevSymlink();
    
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

  schema: async () => {
    await run(["bun", "run", "src/script/build-schema.ts"], {
      spinnerText: "Regenerating schema",
    });
  },

  agents: async () => {
    await run(["bun", "run", "src/script/build-agents-manifest.ts"], {
      spinnerText: "Regenerating agents manifest",
    });
  },

  commands: async () => {
    await run(["bun", "run", "src/script/build-commands-manifest.ts"], {
      spinnerText: "Regenerating commands manifest",
    });
  },

  skills: async () => {
    await run(["bun", "run", "src/script/build-skills-manifest.ts"], {
      spinnerText: "Regenerating skills manifest",
    });
  },

  docs: async () => {
    await run(["bun", "run", "src/script/sync-docs.ts"], {
      spinnerText: "Syncing docs",
    });
  },

  topology: async () => {
    await run(["bun", "run", "src/script/check-topology.ts"], {
      spinnerText: "Checking topology",
    });
  },

  "dev-setup": async () => {
    await tasks["agents"]();
    await tasks["commands"]();
    await tasks["skills"]();
    await ensureDevSymlink();
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
