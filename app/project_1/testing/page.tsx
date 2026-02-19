"use client";

import { useMemo, useRef, useState } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";

const INITIAL_TEXT = `Project brief\n\nWrite your page content here.\n\nThis testing page now supports a full-page editing mode.`;

export default function Page() {
  const { isEditing } = useEditMode();
  const [content, setContent] = useState(INITIAL_TEXT);
  const [activeLine, setActiveLine] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = useMemo(() => {
    const lineCount = Math.max(1, content.split("\n").length);
    return Array.from({ length: lineCount }, (_, index) => index + 1);
  }, [content]);

  const updateActiveLine = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const line = textarea.value.slice(0, cursorPosition).split("\n").length;
    setActiveLine(line);
  };

  if (!isEditing) {
    return <>{content}</>;
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
            setContent(event.target.value);
            updateActiveLine();
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
