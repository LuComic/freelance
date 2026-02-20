"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { Kanban } from "@/app/lib/components/page_components/progress/Kanban";
import { Feedback } from "@/app/lib/components/page_components/feedback/Feedback";
import { TextFields } from "@/app/lib/components/page_components/text/TextFields";
import { Select } from "@/app/lib/components/page_components/form/select/Select";
import { Radio } from "@/app/lib/components/page_components/form/radio/Radio";

const INITIAL_TEXT = `Project brief\n\nWrite your page content here.\n\nThis testing page now supports a full-page editing mode.`;
const COMPONENT_TAG_REGEX = /<([A-Za-z][A-Za-z0-9]*)\s*\/>/g;
const COMPONENT_COMMANDS = [
  { command: "kanban", tag: "Kanban", Component: Kanban },
  { command: "feedback", tag: "Feedback", Component: Feedback },
  { command: "textfields", tag: "TextFields", Component: TextFields },
  { command: "select", tag: "Select", Component: Select },
  { command: "radio", tag: "Radio", Component: Radio },
] as const;

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

function getActiveLineFromCursor(value: string, cursor: number) {
  return value.slice(0, cursor).split("\n").length;
}

function completeSlashCommand(value: string, cursor: number) {
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

function replaceSlashCommandWithTag(value: string, cursor: number) {
  const { start, end, token } = getTokenRangeAtCursor(value, cursor);
  if (!token.startsWith("/")) {
    return null;
  }

  const command = token.slice(1).toLowerCase();
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

function renderContentWithComponents(content: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of content.matchAll(COMPONENT_TAG_REGEX)) {
    const index = match.index ?? 0;
    const fullMatch = match[0];
    const tag = match[1];

    if (index > lastIndex) {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`text-${key++}`}>
          {content.slice(lastIndex, index)}
        </span>,
      );
    }

    const componentMatch = COMPONENT_COMMANDS.find((item) => item.tag === tag);
    if (componentMatch) {
      const Component = componentMatch.Component;
      nodes.push(<Component key={`component-${key++}`} />);
    } else {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`unknown-${key++}`}>
          {fullMatch}
        </span>,
      );
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    nodes.push(
      <span className="whitespace-pre-wrap" key={`tail-${key++}`}>
        {content.slice(lastIndex)}
      </span>,
    );
  }

  return nodes;
}

export default function TestingEditorClient() {
  const { isEditing } = useEditMode();
  const [content, setContent] = useState(INITIAL_TEXT);
  const [activeLine, setActiveLine] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const line = textarea.value.slice(0, cursorPosition).split("\n").length;
    setActiveLine(line);
  };
  const setCaretPosition = (position: number) => {
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.selectionStart = position;
      textarea.selectionEnd = position;
      textarea.focus();
    });
  };

  if (!isEditing) {
    return <div>{renderedContent}</div>;
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

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            const nextValue = event.target.value;
            const cursorPosition = event.target.selectionStart;
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
          onClick={updateActiveLine}
          onKeyUp={updateActiveLine}
          onSelect={updateActiveLine}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          spellCheck={false}
          className="h-full w-full resize-none bg-transparent p-0 pl-4 text-base leading-7 text-(--light) caret-(--light) border-none outline-none focus:ring-0"
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}
