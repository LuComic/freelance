"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EditModeSubtreeModeProvider,
  useEditMode,
} from "@/app/lib/components/project/EditModeContext";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useSearchBar } from "@/app/lib/components/searchbar/SearchBarContext";
import { getActiveLineFromCursor } from "@/app/lib/components/page_components/testing_editor/commands";
import { listAllowedInsertableCommands } from "@/app/lib/components/page_components/componentCatalog";
import { INITIAL_TEXT } from "@/app/lib/components/page_components/testing_editor/constants";
import { renderContentWithComponents } from "@/app/lib/components/page_components/testing_editor/renderContent";
import { EDITOR_SPLIT_RATIO_COOKIE } from "@/app/lib/cookies";
import { useResizableSplitRatio } from "@/app/lib/hooks/useResizableSplitRatio";
import {
  getEditorLineNumbers,
  handleEditorChange,
  handleEditorKeyDown,
  handleEditorSelectionChange,
  recalculateTextareaLineHeights,
  setTextareaCaretPosition,
  useTextareaGhostCompletion,
  type GhostCompletion,
} from "@/app/lib/components/page_components/testingeEditorClientHelpers";

const SPLIT_MIN_RATIO = 1 / 3;
const SPLIT_DEFAULT_RATIO = 1 / 2;
const SPLIT_MAX_RATIO = 2 / 3;

export default function TestingEditorClient() {
  const {
    isEditing,
    isLive,
    isSplitView,
    pendingComponentInsert,
    clearPendingComponentInsert,
    requestOpenComponentLibrary,
  } = useEditMode();
  const { openTaggedSearch } = useSearchBar();
  const pageDocument = useOptionalPageDocument();
  const [activeLine, setActiveLine] = useState(1);
  const [lineHeights, setLineHeights] = useState<number[]>([24]);
  const [scrollTop, setScrollTop] = useState(0);
  const [ghostCompletion, setGhostCompletion] = useState<GhostCompletion>(null);
  const {
    containerRef: splitContainerRef,
    ratio: splitRatio,
    leftPaneStyle,
    rightPaneStyle,
    startResize,
    resizeByKeyboard,
  } = useResizableSplitRatio({
    cookieName: EDITOR_SPLIT_RATIO_COOKIE,
    defaultRatio: SPLIT_DEFAULT_RATIO,
    minRatio: SPLIT_MIN_RATIO,
    maxRatio: SPLIT_MAX_RATIO,
  });
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorRef = useRef(0);
  const content = pageDocument?.document?.editorText ?? INITIAL_TEXT;
  const allowedInsertableCommands = useMemo(
    () => listAllowedInsertableCommands(),
    [],
  );

  const lines = useMemo(() => getEditorLineNumbers(content), [content]);
  const renderedContent = useMemo(
    () => renderContentWithComponents(content),
    [content],
  );

  const recalculateLineHeights = useCallback(() => {
    recalculateTextareaLineHeights({
      textareaRef,
      isEditing,
      isLive,
      setLineHeights,
    });
  }, [isEditing, isLive]);

  const updateActiveLine = () => {
    handleEditorSelectionChange({
      textareaRef,
      lastCursorRef,
      setActiveLine,
      updateGhostCompletion,
    });
  };

  const updateGhostCompletion = useTextareaGhostCompletion({
    textareaRef,
    allowedInsertableCommands,
    isEditing,
    isLive,
    setGhostCompletion,
  });

  const scheduleEditorMeasurements = useCallback(() => {
    recalculateLineHeights();

    requestAnimationFrame(() => {
      recalculateLineHeights();
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      updateGhostCompletion(textarea.value, textarea.selectionStart);
    });
  }, [recalculateLineHeights, updateGhostCompletion]);

  useLayoutEffect(() => {
    scheduleEditorMeasurements();
  }, [content, isSplitView, splitRatio, scheduleEditorMeasurements]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (
      !textarea ||
      !isEditing ||
      isLive ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const observer = new ResizeObserver(() => {
      recalculateLineHeights();
      updateGhostCompletion(textarea.value, textarea.selectionStart);
    });

    observer.observe(textarea);
    if (editorPaneRef.current) {
      observer.observe(editorPaneRef.current);
    }

    return () => observer.disconnect();
  }, [isEditing, isLive, recalculateLineHeights, updateGhostCompletion]);

  useEffect(() => {
    if (!isEditing || isLive || typeof document === "undefined") {
      return;
    }

    const fonts = document.fonts;
    if (!fonts) {
      return;
    }

    let isCancelled = false;
    const refreshMeasurements = () => {
      if (isCancelled) {
        return;
      }

      requestAnimationFrame(() => {
        if (isCancelled) {
          return;
        }

        recalculateLineHeights();
        const textarea = textareaRef.current;
        if (!textarea) {
          return;
        }

        updateGhostCompletion(textarea.value, textarea.selectionStart);
      });
    };

    void fonts.ready.then(refreshMeasurements);
    fonts.addEventListener("loadingdone", refreshMeasurements);

    return () => {
      isCancelled = true;
      fonts.removeEventListener("loadingdone", refreshMeasurements);
    };
  }, [isEditing, isLive, recalculateLineHeights, updateGhostCompletion]);

  const setCaretPosition = useCallback(
    (position: number) => {
      setTextareaCaretPosition({
        textareaRef,
        lastCursorRef,
        position,
        updateGhostCompletion,
      });
    },
    [updateGhostCompletion],
  );

  useEffect(() => {
    if (!pageDocument) {
      return;
    }

    if (!pendingComponentInsert) {
      return;
    }

    if (!isEditing || isLive) {
      clearPendingComponentInsert();
      return;
    }

    const textarea = textareaRef.current;
    const cursorPosition = textarea
      ? textarea.selectionStart
      : lastCursorRef.current;
    const insertion = pageDocument.insertComponentAtRange({
      command: pendingComponentInsert.command,
      value: content,
      start: cursorPosition,
    });
    if (!insertion) {
      clearPendingComponentInsert();
      return;
    }

    setActiveLine(
      getActiveLineFromCursor(insertion.nextValue, insertion.nextCursor),
    );
    setCaretPosition(insertion.nextCursor);
    clearPendingComponentInsert();
  }, [
    clearPendingComponentInsert,
    content,
    isEditing,
    isLive,
    pageDocument,
    pendingComponentInsert,
    setCaretPosition,
  ]);

  if (!pageDocument || !pageDocument.activePage || !pageDocument.document) {
    return <div className="w-full text-(--gray-page)">Loading page...</div>;
  }

  const { insertComponentAtRange, updateEditorText } = pageDocument;

  if (!isEditing || isLive) {
    return <div className="w-full flex flex-col gap-1">{renderedContent}</div>;
  }

  const editorPane = (
    <div
      ref={editorPaneRef}
      className="h-full w-full flex items-start justify-start"
    >
      <div
        aria-hidden
        className="@[35rem]:block hidden w-11 shrink-0 h-full text-right text-sm text-(--gray-page) select-none overflow-hidden border-r border-(--gray)/40"
      >
        <div style={{ transform: `translateY(-${scrollTop}px)` }}>
          {lines.map((lineNumber) => (
            <div
              key={lineNumber}
              className={`px-3 text-editor-font leading-6 ${
                lineNumber === activeLine ? "bg-(--gray)/20 text-(--light)" : ""
              }`}
              style={{ height: `${lineHeights[lineNumber - 1] ?? 24}px` }}
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
            handleEditorChange({
              event,
              lastCursorRef,
              allowedInsertableCommands,
              insertComponentAtRange,
              updateEditorText,
              setActiveLine,
              setCaretPosition,
              recalculateLineHeights,
              updateGhostCompletion,
            });
          }}
          onKeyDown={(event) => {
            handleEditorKeyDown({
              event,
              allowedInsertableCommands,
              insertComponentAtRange,
              updateEditorText,
              setActiveLine,
              setCaretPosition,
              requestOpenComponentLibrary,
              openTaggedSearch,
            });
          }}
          onClick={updateActiveLine}
          onKeyUp={updateActiveLine}
          onSelect={updateActiveLine}
          onScroll={(event) => {
            setScrollTop(event.currentTarget.scrollTop);
            updateGhostCompletion(
              event.currentTarget.value,
              event.currentTarget.selectionStart,
            );
          }}
          spellCheck={false}
          className="relative z-10 h-full w-full resize-none bg-transparent p-0 pt-2 @[35rem]:pt-0 pl-4 text-base leading-6 text-(--light) caret-(--light) border-none outline-none focus:ring-0 text-editor-font"
          placeholder="Start typing..."
        />
        {ghostCompletion ? (
          <span
            aria-hidden
            className="pointer-events-none absolute z-20 text-base leading-7 text-(--vibrant)/50"
            style={{
              top: ghostCompletion.top,
              left: ghostCompletion.left,
              transform: "translateY(-5.1px)",
            }}
          >
            {ghostCompletion.suffix}
          </span>
        ) : null}
      </div>
    </div>
  );

  const livePreviewPane = (
    <EditModeSubtreeModeProvider isEditing={false} isLive={true}>
      <div className="w-full flex flex-col gap-1 @container">
        {renderedContent}
      </div>
    </EditModeSubtreeModeProvider>
  );

  if (!isSplitView) {
    return (
      <div className="w-full h-[calc(100dvh-6rem)] min-h-112 border border-transparent rounded-md overflow-hidden">
        {editorPane}
      </div>
    );
  }

  return (
    <div
      ref={splitContainerRef}
      className="@container w-full h-[calc(100dvh-6rem)] min-h-112 border border-transparent rounded-md overflow-hidden"
    >
      <div className="h-full w-full flex flex-col @[55rem]:flex-row items-stretch justify-start">
        <div
          className="min-w-0 h-full w-full flex-1 @[55rem]:w-auto @[55rem]:grow-0 @[55rem]:shrink-0"
          style={leftPaneStyle}
        >
          {editorPane}
        </div>

        <div
          role="separator"
          aria-label="Resize split view"
          aria-orientation="vertical"
          aria-valuemin={Math.round(SPLIT_MIN_RATIO * 100)}
          aria-valuemax={Math.round(SPLIT_MAX_RATIO * 100)}
          aria-valuenow={Math.round(splitRatio * 100)}
          tabIndex={0}
          onPointerDown={startResize}
          onKeyDown={resizeByKeyboard}
          className="hidden @[55rem]:block h-full w-2 shrink-0 cursor-ew-resize touch-none bg-transparent"
        >
          <div className="mx-auto h-full w-px bg-(--gray)" />
        </div>

        <div
          className="hidden @[55rem]:block min-w-0 h-full overflow-y-auto pl-4"
          style={rightPaneStyle}
        >
          {livePreviewPane}
        </div>
      </div>
    </div>
  );
}
