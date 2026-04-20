"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { getCookie, setCookie } from "@/app/lib/cookies";

type UseResizableSplitRatioOptions = {
  cookieName: string;
  defaultRatio: number;
  minRatio: number;
  maxRatio: number;
};

type DragState = {
  currentRatio: number;
  startRatio: number;
  startX: number;
  containerWidth: number;
};

const KEYBOARD_STEP = 0.025;
const KEYBOARD_LARGE_STEP = 0.05;

function clampRatio(ratio: number, minRatio: number, maxRatio: number): number {
  return Math.min(Math.max(ratio, minRatio), maxRatio);
}

function roundRatio(ratio: number): number {
  return Math.round(ratio * 1000) / 1000;
}

function parseInitialRatio(
  value: string | undefined,
  minRatio: number,
  maxRatio: number,
  defaultRatio: number,
): number {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return clampRatio(defaultRatio, minRatio, maxRatio);
  }

  const parsedRatio = Number(trimmedValue);

  if (!Number.isFinite(parsedRatio)) {
    return clampRatio(defaultRatio, minRatio, maxRatio);
  }

  return clampRatio(parsedRatio, minRatio, maxRatio);
}

export function useResizableSplitRatio({
  cookieName,
  defaultRatio,
  minRatio,
  maxRatio,
}: UseResizableSplitRatioOptions): {
  containerRef: RefObject<HTMLDivElement | null>;
  ratio: number;
  leftPaneStyle: CSSProperties;
  rightPaneStyle: CSSProperties;
  startResize: (event: PointerEvent<HTMLElement>) => void;
  resizeByKeyboard: (event: KeyboardEvent<HTMLElement>) => void;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() =>
    parseInitialRatio(getCookie(cookieName), minRatio, maxRatio, defaultRatio),
  );
  const dragStateRef = useRef<DragState | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const persistRatio = useCallback(
    (nextRatio: number) => {
      setCookie(cookieName, String(nextRatio));
    },
    [cookieName],
  );

  const leftPaneStyle = useMemo<CSSProperties>(
    () => ({ flexBasis: `${ratio * 100}%` }),
    [ratio],
  );
  const rightPaneStyle = useMemo<CSSProperties>(
    () => ({ flexBasis: `${(1 - ratio) * 100}%` }),
    [ratio],
  );

  const stopResize = useCallback(() => {
    const currentRatio = dragStateRef.current?.currentRatio;
    dragStateRef.current = null;
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (currentRatio != null) {
      persistRatio(currentRatio);
    }
  }, [persistRatio]);

  const startResize = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const containerWidth =
        containerRef.current?.getBoundingClientRect().width ?? 0;
      if (containerWidth <= 0) return;

      event.preventDefault();

      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;

      dragStateRef.current = {
        currentRatio: ratio,
        startRatio: ratio,
        startX: event.clientX,
        containerWidth,
      };

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const dragState = dragStateRef.current;
        if (!dragState) return;

        const deltaPx = moveEvent.clientX - dragState.startX;
        const nextRatio = clampRatio(
          roundRatio(dragState.startRatio + deltaPx / dragState.containerWidth),
          minRatio,
          maxRatio,
        );

        dragState.currentRatio = nextRatio;
        setRatio(nextRatio);
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopResize);
        window.removeEventListener("pointercancel", stopResize);
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
      };

      cleanupRef.current?.();
      cleanupRef.current = cleanup;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopResize);
      window.addEventListener("pointercancel", stopResize);
    },
    [maxRatio, minRatio, ratio, stopResize],
  );

  const resizeByKeyboard = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      let nextRatio: number | null = null;

      if (event.key === "Home") {
        nextRatio = minRatio;
      } else if (event.key === "End") {
        nextRatio = maxRatio;
      } else if (event.key === "ArrowLeft") {
        nextRatio = clampRatio(roundRatio(ratio - step), minRatio, maxRatio);
      } else if (event.key === "ArrowRight") {
        nextRatio = clampRatio(roundRatio(ratio + step), minRatio, maxRatio);
      }

      if (nextRatio == null) return;

      event.preventDefault();
      setRatio(nextRatio);
      persistRatio(nextRatio);
    },
    [maxRatio, minRatio, persistRatio, ratio],
  );

  useEffect(() => {
    return () => {
      dragStateRef.current = null;
      cleanupRef.current?.();
    };
  }, []);

  return {
    containerRef,
    ratio,
    leftPaneStyle,
    rightPaneStyle,
    startResize,
    resizeByKeyboard,
  };
}
