import type { CommandDefinition } from "../claude-code-command-loader";
import type { CommandName, Commands } from "./types";
import { COMMANDS_MANIFEST } from "./commands-manifest";

/**
 * Wrap template content with command-instruction tags
 */
function wrapTemplate(template: string): string {
  // Already wrapped - skip
  if (template.includes("<command-instruction>")) {
    return template;
  }
  return `<command-instruction>
${template}
</command-instruction>`;
}

/**
 * Lazily computed command definitions - built on first access.
 * This defers the template wrapping and object construction until actually needed.
 */
function getCommandDefinitions(): Record<CommandName, Omit<CommandDefinition, "name">> {
  if (!commandDefinitions) {
    commandDefinitions = COMMANDS_MANIFEST.reduce(
      (acc, entry) => {
        acc[entry.name as CommandName] = {
          ...entry.command,
          template: wrapTemplate(entry.command.template),
        };
        return acc;
      },
      {} as Record<CommandName, Omit<CommandDefinition, "name">>,
    );
  }
  return commandDefinitions;
}

let commandDefinitions: Record<CommandName, Omit<CommandDefinition, "name">> | undefined =
  undefined;

/**
 * Re-export for backward compatibility with existing code that imports COMMAND_DEFINITIONS.
 * Note: This is lazily initialized on first access.
 */
export const COMMAND_DEFINITIONS: Record<CommandName, Omit<CommandDefinition, "name">> = new Proxy(
  {} as Record<CommandName, Omit<CommandDefinition, "name">>,
  {
    get(_target, prop) {
      const defs = getCommandDefinitions();
      return defs[prop as CommandName];
    },
    ownKeys() {
      return Object.keys(getCommandDefinitions());
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  },
);

export function loadCommands(disabledCommands?: CommandName[]): Commands {
  const definitions = getCommandDefinitions();
  const disabled = new Set(disabledCommands ?? []);
  const commands: Commands = {};

  for (const [name, definition] of Object.entries(definitions)) {
    if (!disabled.has(name as CommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition;
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition;
    }
  }

  return commands;
}
