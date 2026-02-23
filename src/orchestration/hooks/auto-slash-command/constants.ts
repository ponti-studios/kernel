export const HOOK_NAME = "auto-slash-command" as const;

export const AUTO_SLASH_COMMAND_TAG_OPEN = "<grid-auto-slash-command>";
export const AUTO_SLASH_COMMAND_TAG_CLOSE = "</grid-auto-slash-command>";

export const SLASH_COMMAND_PATTERN = /^\/([a-zA-Z][\w:]*(?:[\w-][\w:]*)*)\s*(.*)/;

export const EXCLUDED_COMMANDS = new Set(["ghostwire:ultrawork-loop", "ghostwire:cancel-ultrawork", "ghostwire:ulw-ultrawork"]);
