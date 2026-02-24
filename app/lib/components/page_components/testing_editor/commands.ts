import type { InsertableComponentCommand } from "@/app/lib/components/project/EditModeContext";
import {
  INSERTABLE_COMPONENT_COMMANDS,
  PRIMARY_INSERTABLE_COMMANDS,
  type EditorComponentCommand,
} from "./componentRegistry";

const SLASH_ACTION_COMMANDS = ["lib"] as const;
const ALL_COMPLETABLE_SLASH_COMMANDS = [
  ...PRIMARY_INSERTABLE_COMMANDS,
  ...SLASH_ACTION_COMMANDS,
] as const;

type SlashAction = "open-component-library";

function getTokenRangeAtCursor(value: string, cursor: number) {
  let start = cursor;
  let end = cursor;

  while (start > 0 && !/\s/.test(value[start - 1])) {
    start -= 1;
  }

  while (end < value.length && !/\s/.test(value[end])) {
    end += 1;
  }

  return {
    start,
    end,
    token: value.slice(start, end),
  };
}

function resolveTagFromCommand(command: string) {
  const match = INSERTABLE_COMPONENT_COMMANDS.find(
    (item) => item.command === command,
  );
  return match?.tag;
}

export function getActiveLineFromCursor(value: string, cursor: number) {
  return value.slice(0, cursor).split("\n").length;
}

export function completeSlashCommand(value: string, cursor: number) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const partial = token.slice(1).toLowerCase();
  if (!partial) {
    const completedToken = "/lib";
    return {
      nextValue: `${value.slice(0, start)}${completedToken}${value.slice(end)}`,
      nextCursor: start + completedToken.length,
    };
  }

  const matches = ALL_COMPLETABLE_SLASH_COMMANDS.filter((command) =>
    command.startsWith(partial),
  );
  if (matches.length !== 1) {
    return null;
  }

  const completedToken = `/${matches[0]}`;
  if (token === completedToken) {
    return null;
  }

  return {
    nextValue: `${value.slice(0, start)}${completedToken}${value.slice(end)}`,
    nextCursor: start + completedToken.length,
  };
}

export function getSlashCompletionSuffix(value: string, cursor: number) {
  const { token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const partial = token.slice(1).toLowerCase();
  if (!partial) {
    return "lib for all possible commands";
  }

  const matches = ALL_COMPLETABLE_SLASH_COMMANDS.filter((command) =>
    command.startsWith(partial),
  );
  if (matches.length !== 1) {
    return null;
  }

  const completion = matches[0];
  if (completion === partial) {
    return null;
  }

  return completion.slice(partial.length);
}

function resolveSlashAction(token: string): SlashAction | null {
  const command = token.slice(1).toLowerCase();
  if (command === "lib") {
    return "open-component-library";
  }

  return null;
}

export function consumeSlashActionCommand(value: string, cursor: number) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const action = resolveSlashAction(token);
  if (!action) {
    return null;
  }

  return {
    action,
    nextValue: `${value.slice(0, start)}${value.slice(end)}`,
    nextCursor: start,
  };
}

export function replaceSlashCommandWithTag(value: string, cursor: number) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const command = token.slice(1).toLowerCase() as EditorComponentCommand;
  const tag = resolveTagFromCommand(command);
  if (!tag) {
    return null;
  }

  const tagToken = `<${tag} />`;
  return {
    nextValue: `${value.slice(0, start)}${tagToken}${value.slice(end)}`,
    nextCursor: start + tagToken.length,
  };
}

export function insertComponentTagAtCursor(
  value: string,
  cursor: number,
  command: InsertableComponentCommand,
) {
  const tag = resolveTagFromCommand(command);
  if (!tag) {
    return null;
  }

  const tagToken = `<${tag} />`;
  return {
    nextValue: `${value.slice(0, cursor)}${tagToken}${value.slice(cursor)}`,
    nextCursor: cursor + tagToken.length,
  };
}
