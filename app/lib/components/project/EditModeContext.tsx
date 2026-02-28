"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type InsertableComponentCommand =
  | "kanban"
  | "feedback"
  | "select"
  | "radio"
  | "mainheadline"
  | "sectionheader"
  | "subheader";

type PendingComponentInsert = {
  command: InsertableComponentCommand;
  nonce: number;
};

type EditModeContextValue = {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditing: () => void;
  isLive: boolean;
  setIsLive: (value: boolean) => void;
  toggleLive: () => void;
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
  const [isEditing, rawSetIsEditing] = useState(true);
  const [isLive, rawSetIsLive] = useState(false);
  const [pendingComponentInsert, setPendingComponentInsert] =
    useState<PendingComponentInsert | null>(null);
  const [componentLibraryOpenRequestNonce, setComponentLibraryOpenRequestNonce] =
    useState(0);
  const insertNonceRef = useRef(0);
  const componentLibraryOpenNonceRef = useRef(0);

  const setIsEditing = useCallback((value: boolean) => {
    rawSetIsEditing(value);
    if (value) {
      rawSetIsLive(false);
    }
  }, []);

  const setIsLive = useCallback((value: boolean) => {
    rawSetIsLive(value);
    if (value) {
      rawSetIsEditing(false);
    }
  }, []);

  const toggleEditing = useCallback(() => {
    rawSetIsEditing((prev) => {
      const next = !prev;
      if (next) {
        rawSetIsLive(false);
      }
      return next;
    });
  }, []);

  const toggleLive = useCallback(() => {
    rawSetIsLive((prev) => {
      const next = !prev;
      if (next) {
        rawSetIsEditing(false);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isEditing,
      setIsEditing,
      toggleEditing,
      isLive,
      setIsLive,
      toggleLive,
      pendingComponentInsert,
      requestComponentInsert: (command: InsertableComponentCommand) => {
        insertNonceRef.current += 1;
        setPendingComponentInsert({
          command,
          nonce: insertNonceRef.current,
        });
      },
      clearPendingComponentInsert: () => setPendingComponentInsert(null),
      componentLibraryOpenRequestNonce,
      requestOpenComponentLibrary: () => {
        componentLibraryOpenNonceRef.current += 1;
        setComponentLibraryOpenRequestNonce(componentLibraryOpenNonceRef.current);
      },
    }),
    [
      componentLibraryOpenRequestNonce,
      isEditing,
      isLive,
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
