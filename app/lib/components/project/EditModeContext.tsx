"use client";

import type { InsertableComponentCommand } from "@/app/lib/components/page_components/componentCatalog";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type { InsertableComponentCommand } from "@/app/lib/components/page_components/componentCatalog";

type PendingComponentInsert = {
  command: InsertableComponentCommand;
  nonce: number;
};

type ModeLock = "live" | null;

type EditModeContextValue = {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditing: () => void;
  isLive: boolean;
  setIsLive: (value: boolean) => void;
  toggleLive: () => void;
  modeLock: ModeLock;
  setModeLock: (value: ModeLock) => void;
  pendingComponentInsert: PendingComponentInsert | null;
  requestComponentInsert: (command: InsertableComponentCommand) => void;
  clearPendingComponentInsert: () => void;
  componentLibraryOpenRequestNonce: number;
  requestOpenComponentLibrary: () => void;
};

const EditModeContext = createContext<EditModeContextValue | undefined>(
  undefined,
);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [rawIsEditing, rawSetIsEditing] = useState(true);
  const [rawIsLive, rawSetIsLive] = useState(false);
  const [modeLock, setModeLock] = useState<ModeLock>(null);
  const [pendingComponentInsert, setPendingComponentInsert] =
    useState<PendingComponentInsert | null>(null);
  const [componentLibraryOpenRequestNonce, setComponentLibraryOpenRequestNonce] =
    useState(0);
  const insertNonceRef = useRef(0);
  const componentLibraryOpenNonceRef = useRef(0);
  const isEditing = modeLock === "live" ? false : rawIsEditing;
  const isLive = modeLock === "live" ? true : rawIsLive;

  const setIsEditing = useCallback(
    (value: boolean) => {
      if (modeLock === "live") {
        if (!value) {
          rawSetIsEditing(false);
        }
        return;
      }

      rawSetIsEditing(value);
      if (value) {
        rawSetIsLive(false);
      }
    },
    [modeLock],
  );

  const setIsLive = useCallback(
    (value: boolean) => {
      if (modeLock === "live") {
        if (value) {
          rawSetIsLive(true);
        }
        return;
      }

      rawSetIsLive(value);
      if (value) {
        rawSetIsEditing(false);
      }
    },
    [modeLock],
  );

  const toggleEditing = useCallback(() => {
    if (modeLock === "live") {
      return;
    }

    rawSetIsEditing((prev) => {
      const next = !prev;
      if (next) {
        rawSetIsLive(false);
      }
      return next;
    });
  }, [modeLock]);

  const toggleLive = useCallback(() => {
    if (modeLock === "live") {
      return;
    }

    rawSetIsLive((prev) => {
      const next = !prev;
      if (next) {
        rawSetIsEditing(false);
      }
      return next;
    });
  }, [modeLock]);

  const value = useMemo(
    () => ({
      isEditing,
      setIsEditing,
      toggleEditing,
      isLive,
      setIsLive,
      toggleLive,
      modeLock,
      setModeLock,
      pendingComponentInsert,
      requestComponentInsert: (command: InsertableComponentCommand) => {
        if (modeLock === "live") {
          return;
        }

        insertNonceRef.current += 1;
        setPendingComponentInsert({
          command,
          nonce: insertNonceRef.current,
        });
      },
      clearPendingComponentInsert: () => setPendingComponentInsert(null),
      componentLibraryOpenRequestNonce,
      requestOpenComponentLibrary: () => {
        if (modeLock === "live") {
          return;
        }

        componentLibraryOpenNonceRef.current += 1;
        setComponentLibraryOpenRequestNonce(componentLibraryOpenNonceRef.current);
      },
    }),
    [
      componentLibraryOpenRequestNonce,
      isEditing,
      isLive,
      modeLock,
      pendingComponentInsert,
      setIsEditing,
      setIsLive,
      toggleEditing,
      toggleLive,
    ],
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }

  return context;
}
