import type { InsertableComponentCommand } from "@/app/lib/components/project/EditModeContext";
import {
  COMPONENT_COMMANDS,
  type EditorComponentCommand,
} from "./componentRegistry";

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
    return null;
  }

  const matches = COMPONENT_COMMANDS.filter(({ command }) =>
    command.startsWith(partial),
  );
  if (matches.length !== 1) {
    return null;
  }

  const completedToken = `/${matches[0].command}`;
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
    return null;
  }

  const matches = COMPONENT_COMMANDS.filter(({ command }) =>
    command.startsWith(partial),
  );
  if (matches.length !== 1) {
    return null;
  }

  const completion = matches[0].command;
  if (completion === partial) {
    return null;
  }

  return completion.slice(partial.length);
}

export function replaceSlashCommandWithTag(value: string, cursor: number) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const command = token.slice(1).toLowerCase() as EditorComponentCommand;
  const match = COMPONENT_COMMANDS.find((item) => item.command === command);
  if (!match) {
    return null;
  }

  const tagToken = `<${match.tag} />`;
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
  const match = COMPONENT_COMMANDS.find((item) => item.command === command);
  if (!match) {
    return null;
  }

  const tagToken = `<${match.tag} />`;
  return {
    nextValue: `${value.slice(0, cursor)}${tagToken}${value.slice(cursor)}`,
    nextCursor: cursor + tagToken.length,
  };
}
