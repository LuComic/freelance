"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { getCaretCoordinates } from "@/app/lib/components/page_components/testing_editor/caret";
import {
  completeSlashCommand,
  getActiveLineFromCursor,
  getSlashCompletionSuffix,
  insertComponentTagAtCursor,
  replaceSlashCommandWithTag,
} from "@/app/lib/components/page_components/testing_editor/commands";
import { INITIAL_TEXT } from "@/app/lib/components/page_components/testing_editor/constants";
import { renderContentWithComponents } from "@/app/lib/components/page_components/testing_editor/renderContent";

export default function TestingEditorClient() {
  const {
    isEditing,
    isPresenting,
    pendingComponentInsert,
    clearPendingComponentInsert,
  } = useEditMode();
  const [content, setContent] = useState(INITIAL_TEXT);
  const [activeLine, setActiveLine] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const [ghostCompletion, setGhostCompletion] = useState<{
    suffix: string;
    top: number;
    left: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorRef = useRef(0);

  const lines = useMemo(() => {
    const lineCount = Math.max(1, content.split("\n").length);
    return Array.from({ length: lineCount }, (_, index) => index + 1);
  }, [content]);
  const renderedContent = useMemo(
    () => renderContentWithComponents(content),
    [content],
  );

  const updateActiveLine = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    lastCursorRef.current = cursorPosition;
    setActiveLine(getActiveLineFromCursor(textarea.value, cursorPosition));
  };

  const updateGhostCompletion = useCallback(
    (value: string, cursorPosition: number) => {
      const textarea = textareaRef.current;
      if (!textarea || !isEditing || isPresenting) {
        setGhostCompletion(null);
        return;
      }

      const suffix = getSlashCompletionSuffix(value, cursorPosition);
      if (!suffix) {
        setGhostCompletion(null);
        return;
      }

      const { top, left } = getCaretCoordinates(textarea, cursorPosition);
      setGhostCompletion({ suffix, top, left });
    },
    [isEditing, isPresenting],
  );

  const setCaretPosition = useCallback(
    (position: number) => {
      lastCursorRef.current = position;
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.selectionStart = position;
        textarea.selectionEnd = position;
        textarea.focus();
        updateGhostCompletion(textarea.value, position);
      });
    },
    [updateGhostCompletion],
  );

  useEffect(() => {
    if (!pendingComponentInsert) {
      return;
    }

    if (!isEditing || isPresenting) {
      clearPendingComponentInsert();
      return;
    }

    const textarea = textareaRef.current;
    const cursorPosition = textarea
      ? textarea.selectionStart
      : lastCursorRef.current;
    const insertion = insertComponentTagAtCursor(
      content,
      cursorPosition,
      pendingComponentInsert.command,
    );
    if (!insertion) {
      clearPendingComponentInsert();
      return;
    }

    setContent(insertion.nextValue);
    setActiveLine(
      getActiveLineFromCursor(insertion.nextValue, insertion.nextCursor),
    );
    setCaretPosition(insertion.nextCursor);
    clearPendingComponentInsert();
  }, [
    clearPendingComponentInsert,
    content,
    isEditing,
    isPresenting,
    pendingComponentInsert,
    setCaretPosition,
  ]);

  if (!isEditing || isPresenting) {
    return <div className="w-full">{renderedContent}</div>;
  }

  return (
    <div className="w-full h-[calc(100dvh-13rem)] min-h-112 border border-transparent rounded-md overflow-hidden">
      <div className="h-full w-full flex items-start justify-start">
        <div
          aria-hidden
          className="w-11 shrink-0 h-full text-right text-sm text-(--gray-page) select-none overflow-hidden border-r border-(--gray)/40"
        >
          <div style={{ transform: `translateY(-${scrollTop}px)` }}>
            {lines.map((lineNumber) => (
              <div
                key={lineNumber}
                className={`px-3 leading-7 ${
                  lineNumber === activeLine
                    ? "bg-(--gray)/20 text-(--light)"
                    : ""
                }`}
              >
                {lineNumber}
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-full w-full">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              const nextValue = event.target.value;
              const cursorPosition = event.target.selectionStart;
              lastCursorRef.current = cursorPosition;
              const replacement = replaceSlashCommandWithTag(
                nextValue,
                cursorPosition,
              );

              if (replacement) {
                setContent(replacement.nextValue);
                setActiveLine(
                  getActiveLineFromCursor(
                    replacement.nextValue,
                    replacement.nextCursor,
                  ),
                );
                setCaretPosition(replacement.nextCursor);
                return;
              }

              setContent(nextValue);
              setActiveLine(getActiveLineFromCursor(nextValue, cursorPosition));
              updateGhostCompletion(nextValue, cursorPosition);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const textarea = event.currentTarget;
                const replacement = replaceSlashCommandWithTag(
                  textarea.value,
                  textarea.selectionStart,
                );
                if (!replacement) {
                  return;
                }

                event.preventDefault();
                const nextValue = `${replacement.nextValue.slice(
                  0,
                  replacement.nextCursor,
                )}\n${replacement.nextValue.slice(replacement.nextCursor)}`;
                const nextCursor = replacement.nextCursor + 1;
                setContent(nextValue);
                setActiveLine(getActiveLineFromCursor(nextValue, nextCursor));
                setCaretPosition(nextCursor);
                return;
              }

              if (event.key !== "Tab") {
                return;
              }

              const textarea = event.currentTarget;
              const completion = completeSlashCommand(
                textarea.value,
                textarea.selectionStart,
              );
              if (!completion) {
                return;
              }

              event.preventDefault();
              setContent(completion.nextValue);
              setActiveLine(
                getActiveLineFromCursor(
                  completion.nextValue,
                  completion.nextCursor,
                ),
              );
              setCaretPosition(completion.nextCursor);
            }}
            onClick={() => {
              updateActiveLine();
              const textarea = textareaRef.current;
              if (!textarea) return;
              updateGhostCompletion(textarea.value, textarea.selectionStart);
            }}
            onKeyUp={() => {
              updateActiveLine();
              const textarea = textareaRef.current;
              if (!textarea) return;
              updateGhostCompletion(textarea.value, textarea.selectionStart);
            }}
            onSelect={() => {
              updateActiveLine();
              const textarea = textareaRef.current;
              if (!textarea) return;
              updateGhostCompletion(textarea.value, textarea.selectionStart);
            }}
            onScroll={(event) => {
              setScrollTop(event.currentTarget.scrollTop);
              updateGhostCompletion(
                event.currentTarget.value,
                event.currentTarget.selectionStart,
              );
            }}
            spellCheck={false}
            className="relative z-10 h-full w-full resize-none bg-transparent p-0 pl-4 text-base leading-7 text-(--light) caret-(--light) border-none outline-none focus:ring-0"
            placeholder="Start typing..."
          />
          {ghostCompletion ? (
            <span
              aria-hidden
              className="pointer-events-none absolute z-20 text-base leading-7 text-(--vibrant)/50"
              style={{
                top: ghostCompletion.top,
                left: ghostCompletion.left,
                transform: "translateY(-4.5px)",
              }}
            >
              {ghostCompletion.suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
