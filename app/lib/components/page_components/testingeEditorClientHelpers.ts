import { useCallback } from "react";
import type React from "react";
import type { RefObject } from "react";
import type { InsertableComponentCommand } from "@/app/lib/components/project/EditModeContext";
import type { SearchTag } from "@/app/lib/components/searchbar/SearchBarContext";
import type { PageDocumentContextValue } from "@/app/lib/components/project/page_document_helpers/types";
import {
  getCaretCoordinates,
  measureWrappedLineHeights,
} from "@/app/lib/components/page_components/testing_editor/caret";
import {
  completeSlashCommand,
  consumeSlashActionCommand,
  getActiveLineFromCursor,
  getSlashCommandTokenRange,
  getSlashCompletionSuffix,
  replaceSlashCommandWithStructuralBlock,
  resolveComponentTypeFromCommand,
} from "@/app/lib/components/page_components/testing_editor/commands";

export type GhostCompletion = {
  suffix: string;
  top: number;
  left: number;
} | null;

type EditorTextUpdater = PageDocumentContextValue["updateEditorText"];
type InsertComponentAtRange =
  PageDocumentContextValue["insertComponentAtRange"];

export function getEditorLineNumbers(content: string) {
  const lineCount = Math.max(1, content.split("\n").length);
  return Array.from({ length: lineCount }, (_, index) => index + 1);
}

export function lineHeightsAreEqual(current: number[], next: number[]) {
  return (
    current.length === next.length &&
    current.every((height, index) => height === next[index])
  );
}

export function updateTextareaActiveLine(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  lastCursorRef: RefObject<number>;
  setActiveLine: (line: number) => void;
}) {
  const textarea = args.textareaRef.current;
  if (!textarea) return;

  const cursorPosition = textarea.selectionStart;
  args.lastCursorRef.current = cursorPosition;
  args.setActiveLine(getActiveLineFromCursor(textarea.value, cursorPosition));
}

export function useTextareaGhostCompletion(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  allowedInsertableCommands: InsertableComponentCommand[];
  isEditing: boolean;
  isLive: boolean;
  setGhostCompletion: (completion: GhostCompletion) => void;
}) {
  const {
    textareaRef,
    allowedInsertableCommands,
    isEditing,
    isLive,
    setGhostCompletion,
  } = args;

  return useCallback(
    (value: string, cursorPosition: number) => {
      const textarea = textareaRef.current;
      if (!textarea || !isEditing || isLive) {
        setGhostCompletion(null);
        return;
      }

      const suffix = getSlashCompletionSuffix(
        value,
        cursorPosition,
        allowedInsertableCommands,
      );
      if (!suffix) {
        setGhostCompletion(null);
        return;
      }

      const { top, left } = getCaretCoordinates(textarea, cursorPosition);
      setGhostCompletion({ suffix, top, left });
    },
    [
      allowedInsertableCommands,
      isEditing,
      isLive,
      setGhostCompletion,
      textareaRef,
    ],
  );
}

export function recalculateTextareaLineHeights(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  isEditing: boolean;
  isLive: boolean;
  setLineHeights: (updater: (currentLineHeights: number[]) => number[]) => void;
}) {
  const textarea = args.textareaRef.current;
  if (!textarea || !args.isEditing || args.isLive) {
    return;
  }

  const nextLineHeights = measureWrappedLineHeights(textarea);
  args.setLineHeights((currentLineHeights) =>
    lineHeightsAreEqual(currentLineHeights, nextLineHeights)
      ? currentLineHeights
      : nextLineHeights,
  );
}

export function setTextareaCaretPosition(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  lastCursorRef: RefObject<number>;
  position: number;
  updateGhostCompletion: (value: string, cursorPosition: number) => void;
}) {
  args.lastCursorRef.current = args.position;
  requestAnimationFrame(() => {
    const textarea = args.textareaRef.current;
    if (!textarea) return;
    textarea.selectionStart = args.position;
    textarea.selectionEnd = args.position;
    textarea.focus();
    args.updateGhostCompletion(textarea.value, args.position);
  });
}

export function handleEditorSelectionChange(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  lastCursorRef: RefObject<number>;
  setActiveLine: (line: number) => void;
  updateGhostCompletion: (value: string, cursorPosition: number) => void;
}) {
  updateTextareaActiveLine(args);
  const textarea = args.textareaRef.current;
  if (!textarea) return;
  args.updateGhostCompletion(textarea.value, textarea.selectionStart);
}

export function handleEditorChange(args: {
  event: React.ChangeEvent<HTMLTextAreaElement>;
  lastCursorRef: RefObject<number>;
  allowedInsertableCommands: InsertableComponentCommand[];
  insertComponentAtRange: InsertComponentAtRange;
  updateEditorText: EditorTextUpdater;
  setActiveLine: (line: number) => void;
  setCaretPosition: (position: number) => void;
  recalculateLineHeights: () => void;
  updateGhostCompletion: (value: string, cursorPosition: number) => void;
}) {
  const nextValue = args.event.target.value;
  const cursorPosition = args.event.target.selectionStart;
  args.lastCursorRef.current = cursorPosition;

  const slashRange = getSlashCommandTokenRange(nextValue, cursorPosition);
  const command = slashRange?.token.slice(1).toLowerCase() as
    | InsertableComponentCommand
    | undefined;
  const structuralReplacement = replaceSlashCommandWithStructuralBlock(
    nextValue,
    cursorPosition,
  );

  if (structuralReplacement) {
    args.updateEditorText(structuralReplacement.nextValue);
    args.setActiveLine(
      getActiveLineFromCursor(
        structuralReplacement.nextValue,
        structuralReplacement.nextCursor,
      ),
    );
    args.setCaretPosition(structuralReplacement.nextCursor);
    return;
  }

  const replacement =
    slashRange &&
    command &&
    args.allowedInsertableCommands.includes(command) &&
    resolveComponentTypeFromCommand(command)
      ? args.insertComponentAtRange({
          command,
          value: nextValue,
          start: slashRange.start,
          end: slashRange.end,
        })
      : null;

  if (replacement) {
    args.setActiveLine(
      getActiveLineFromCursor(replacement.nextValue, replacement.nextCursor),
    );
    args.setCaretPosition(replacement.nextCursor);
    return;
  }

  args.updateEditorText(nextValue);
  args.setActiveLine(getActiveLineFromCursor(nextValue, cursorPosition));
  args.recalculateLineHeights();
  args.updateGhostCompletion(nextValue, cursorPosition);
}

export function handleEditorKeyDown(args: {
  event: React.KeyboardEvent<HTMLTextAreaElement>;
  allowedInsertableCommands: InsertableComponentCommand[];
  insertComponentAtRange: InsertComponentAtRange;
  updateEditorText: EditorTextUpdater;
  setActiveLine: (line: number) => void;
  setCaretPosition: (position: number) => void;
  requestOpenComponentLibrary: () => void;
  openTaggedSearch: (tag: SearchTag) => void;
}) {
  if (args.event.key === "Enter") {
    const textarea = args.event.currentTarget;
    const slashAction = consumeSlashActionCommand(
      textarea.value,
      textarea.selectionStart,
    );
    if (slashAction) {
      args.event.preventDefault();
      args.event.stopPropagation();
      if (slashAction.action.type === "open-component-library") {
        args.requestOpenComponentLibrary();
      } else if (slashAction.action.type === "open-tagged-search") {
        args.openTaggedSearch(slashAction.action.tag);
      }
      args.updateEditorText(slashAction.nextValue);
      args.setActiveLine(
        getActiveLineFromCursor(slashAction.nextValue, slashAction.nextCursor),
      );
      args.setCaretPosition(slashAction.nextCursor);
      return;
    }

    const structuralReplacement = replaceSlashCommandWithStructuralBlock(
      textarea.value,
      textarea.selectionStart,
    );
    if (structuralReplacement) {
      args.event.preventDefault();
      args.updateEditorText(structuralReplacement.nextValue);
      args.setActiveLine(
        getActiveLineFromCursor(
          structuralReplacement.nextValue,
          structuralReplacement.nextCursor,
        ),
      );
      args.setCaretPosition(structuralReplacement.nextCursor);
      return;
    }

    const slashRange = getSlashCommandTokenRange(
      textarea.value,
      textarea.selectionStart,
    );
    const command = slashRange?.token.slice(1).toLowerCase() as
      | InsertableComponentCommand
      | undefined;
    const replacement =
      slashRange &&
      command &&
      args.allowedInsertableCommands.includes(command) &&
      resolveComponentTypeFromCommand(command)
        ? args.insertComponentAtRange({
            command,
            value: textarea.value,
            start: slashRange.start,
            end: slashRange.end,
          })
        : null;
    if (!replacement) {
      return;
    }

    args.event.preventDefault();
    const nextValue = `${replacement.nextValue.slice(
      0,
      replacement.nextCursor,
    )}\n${replacement.nextValue.slice(replacement.nextCursor)}`;
    const nextCursor = replacement.nextCursor + 1;
    args.updateEditorText(nextValue);
    args.setActiveLine(getActiveLineFromCursor(nextValue, nextCursor));
    args.setCaretPosition(nextCursor);
    return;
  }

  if (args.event.key !== "Tab") {
    return;
  }

  const textarea = args.event.currentTarget;
  const completion = completeSlashCommand(
    textarea.value,
    textarea.selectionStart,
    args.allowedInsertableCommands,
  );
  if (!completion) {
    return;
  }

  args.event.preventDefault();
  args.updateEditorText(completion.nextValue);
  args.setActiveLine(
    getActiveLineFromCursor(completion.nextValue, completion.nextCursor),
  );
  args.setCaretPosition(completion.nextCursor);
}
