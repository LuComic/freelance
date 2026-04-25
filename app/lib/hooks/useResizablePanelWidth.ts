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
} from "react";
import { setCookie } from "@/app/lib/cookies";

type ResizeEdge = "left" | "right";

type UseResizablePanelWidthOptions = {
  cookieName: string;
  defaultWidth: number;
  initialWidth?: number;
  minWidth: number;
  maxWidth: number;
  resizeEdge: ResizeEdge;
  width?: number;
  onWidthChange?: (width: number) => void;
};

type DragState = {
  currentWidth: number;
  startWidth: number;
  startX: number;
};

const FALLBACK_SPACING_UNIT_PX = 4;

function clampWidth(width: number, minWidth: number, maxWidth: number): number {
  return Math.min(Math.max(width, minWidth), maxWidth);
}

function roundToQuarter(width: number): number {
  return Math.round(width * 4) / 4;
}

function getSpacingUnitPx(): number {
  const fontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    return FALLBACK_SPACING_UNIT_PX;
  }

  return fontSize / 4;
}

export function useResizablePanelWidth({
  cookieName,
  defaultWidth,
  initialWidth,
  minWidth,
  maxWidth,
  resizeEdge,
  width: controlledWidth,
  onWidthChange,
}: UseResizablePanelWidthOptions) {
  const [internalWidth, setInternalWidth] = useState(() =>
    clampWidth(initialWidth ?? defaultWidth, minWidth, maxWidth),
  );
  const width = controlledWidth ?? internalWidth;
  const dragStateRef = useRef<DragState | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const updateWidth = useCallback(
    (nextWidth: number) => {
      if (onWidthChange) {
        onWidthChange(nextWidth);
        return;
      }

      setInternalWidth(nextWidth);
    },
    [onWidthChange],
  );

  const persistWidth = useCallback(
    (nextWidth: number) => {
      setCookie(cookieName, String(nextWidth));
    },
    [cookieName],
  );

  const widthStyle = useMemo<CSSProperties>(
    () => ({ width: `calc(var(--spacing) * ${width})` }),
    [width],
  );

  const stopResize = useCallback(() => {
    const currentWidth = dragStateRef.current?.currentWidth;
    dragStateRef.current = null;
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (currentWidth != null) {
      persistWidth(currentWidth);
    }
  }, [persistWidth]);

  const startResize = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.preventDefault();

      const spacingUnitPx = getSpacingUnitPx();
      const direction = resizeEdge === "right" ? 1 : -1;
      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;

      dragStateRef.current = {
        currentWidth: width,
        startWidth: width,
        startX: event.clientX,
      };

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const dragState = dragStateRef.current;
        if (!dragState) return;

        const deltaPx = moveEvent.clientX - dragState.startX;
        const nextWidth = clampWidth(
          roundToQuarter(
            dragState.startWidth + (direction * deltaPx) / spacingUnitPx,
          ),
          minWidth,
          maxWidth,
        );

        dragState.currentWidth = nextWidth;
        updateWidth(nextWidth);
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
    [maxWidth, minWidth, resizeEdge, stopResize, updateWidth, width],
  );

  const resizeByKeyboard = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 5 : 1;
      let nextWidth: number | null = null;

      if (event.key === "Home") {
        nextWidth = minWidth;
      } else if (event.key === "End") {
        nextWidth = maxWidth;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const increasingKey =
          resizeEdge === "right" ? "ArrowRight" : "ArrowLeft";
        const direction = event.key === increasingKey ? 1 : -1;
        nextWidth = clampWidth(
          roundToQuarter(width + direction * step),
          minWidth,
          maxWidth,
        );
      }

      if (nextWidth == null) return;

      event.preventDefault();
      updateWidth(nextWidth);
      persistWidth(nextWidth);
    },
    [maxWidth, minWidth, persistWidth, resizeEdge, updateWidth, width],
  );

  useEffect(() => {
    return () => {
      dragStateRef.current = null;
      cleanupRef.current?.();
    };
  }, []);

  return {
    width,
    widthStyle,
    startResize,
    resizeByKeyboard,
  };
}
