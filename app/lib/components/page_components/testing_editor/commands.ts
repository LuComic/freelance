import type { InsertableComponentCommand } from "@/app/lib/components/page_components/componentCatalog";
import {
  PRIMARY_INSERTABLE_COMMANDS,
  resolveComponentTypeFromCommand as resolveComponentTypeFromCatalog,
} from "@/app/lib/components/page_components/componentCatalog";
import {
  createComponentToken,
  type PageComponentType,
} from "@/lib/pageDocument";
import {
  createDropdownScaffold,
  DROPDOWN_SLASH_COMMAND,
  getDropdownScaffoldCursorOffset,
} from "./dropdownBlocks";

const SLASH_ACTION_COMMANDS = ["lib", "template"] as const;
const SLASH_INSERTION_COMMANDS = [DROPDOWN_SLASH_COMMAND] as const;

function getCompletableSlashCommands(
  allowedInsertableCommands: readonly InsertableComponentCommand[],
) {
  return [
    ...allowedInsertableCommands,
    ...SLASH_INSERTION_COMMANDS,
    ...SLASH_ACTION_COMMANDS,
  ];
}

function resolveSlashCommandCompletion(
  partial: string,
  allowedInsertableCommands: readonly InsertableComponentCommand[],
) {
  const matches = getCompletableSlashCommands(allowedInsertableCommands).filter(
    (command) => command.startsWith(partial),
  );

  if (matches.length === 1) {
    return matches[0];
  }

  const shortestMatch = [...matches].sort(
    (first, second) => first.length - second.length,
  )[0];

  if (
    shortestMatch &&
    matches.every((command) => command.startsWith(shortestMatch))
  ) {
    return shortestMatch;
  }

  return null;
}

type SlashAction =
  | { type: "open-component-library" }
  | { type: "open-tagged-search"; tag: "template" };

type SlashInsertion = { type: "insert-dropdown-block" };

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

export function resolveComponentTypeFromCommand(command: string) {
  return resolveComponentTypeFromCatalog(command) as
    | PageComponentType
    | undefined;
}

export function getActiveLineFromCursor(value: string, cursor: number) {
  return value.slice(0, cursor).split("\n").length;
}

export function completeSlashCommand(
  value: string,
  cursor: number,
  allowedInsertableCommands: readonly InsertableComponentCommand[] = PRIMARY_INSERTABLE_COMMANDS,
) {
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

  const completion = resolveSlashCommandCompletion(
    partial,
    allowedInsertableCommands,
  );
  if (!completion) {
    return null;
  }

  const completedToken = `/${completion}`;
  if (token === completedToken) {
    return null;
  }

  return {
    nextValue: `${value.slice(0, start)}${completedToken}${value.slice(end)}`,
    nextCursor: start + completedToken.length,
  };
}

export function getSlashCompletionSuffix(
  value: string,
  cursor: number,
  allowedInsertableCommands: readonly InsertableComponentCommand[] = PRIMARY_INSERTABLE_COMMANDS,
) {
  const { token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const partial = token.slice(1).toLowerCase();
  if (!partial) {
    return "lib for all possible commands";
  }

  const completion = resolveSlashCommandCompletion(
    partial,
    allowedInsertableCommands,
  );
  if (!completion) {
    return null;
  }

  if (completion === partial) {
    return null;
  }

  return completion.slice(partial.length);
}

function resolveSlashAction(token: string): SlashAction | null {
  const command = token.slice(1).toLowerCase();
  if (command === "lib") {
    return { type: "open-component-library" };
  }

  if (command === "template") {
    return { type: "open-tagged-search", tag: "template" };
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

function resolveSlashInsertion(token: string): SlashInsertion | null {
  const command = token.slice(1).toLowerCase();
  if (command === DROPDOWN_SLASH_COMMAND) {
    return { type: "insert-dropdown-block" };
  }

  return null;
}

export function replaceSlashCommandWithStructuralBlock(
  value: string,
  cursor: number,
) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const insertion = resolveSlashInsertion(token);
  if (!insertion) {
    return null;
  }

  if (insertion.type === "insert-dropdown-block") {
    const scaffold = createDropdownScaffold();
    return {
      nextValue: `${value.slice(0, start)}${scaffold}${value.slice(end)}`,
      nextCursor: start + getDropdownScaffoldCursorOffset(),
      start,
      end,
    };
  }

  return null;
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

  const command = token.slice(1).toLowerCase() as InsertableComponentCommand;
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
