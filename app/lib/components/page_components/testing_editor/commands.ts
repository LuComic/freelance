import type { InsertableComponentCommand } from "@/app/lib/components/project/EditModeContext";
import { createComponentToken, type PageComponentType } from "@/lib/pageDocument";
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

export function getSlashCommandTokenRange(value: string, cursor: number) {
  const range = getTokenRangeAtCursor(value, cursor);
  return range.token.startsWith("/") ? range : null;
}

function resolveTagFromCommand(command: string) {
  const match = INSERTABLE_COMPONENT_COMMANDS.find(
    (item) => item.command === command,
  );
  return match?.tag;
}

export function resolveComponentTypeFromCommand(command: string) {
  return resolveTagFromCommand(command) as PageComponentType | undefined;
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

export function replaceSlashCommandWithToken(
  value: string,
  cursor: number,
  instanceId: string,
) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const command = token.slice(1).toLowerCase() as EditorComponentCommand;
  const componentType = resolveComponentTypeFromCommand(command);
  if (!componentType) {
    return null;
  }

  const tagToken = createComponentToken(componentType, instanceId);
  return {
    nextValue: `${value.slice(0, start)}${tagToken}${value.slice(end)}`,
    nextCursor: start + tagToken.length,
    start,
    end,
    componentType,
  };
}

export function insertComponentTokenAtCursor(
  value: string,
  cursor: number,
  command: InsertableComponentCommand,
  instanceId: string,
) {
  const componentType = resolveComponentTypeFromCommand(command);
  if (!componentType) {
    return null;
  }

  const tagToken = createComponentToken(componentType, instanceId);
  return {
    nextValue: `${value.slice(0, cursor)}${tagToken}${value.slice(cursor)}`,
    nextCursor: cursor + tagToken.length,
    start: cursor,
    end: cursor,
    componentType,
  };
}
