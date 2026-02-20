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
  | "textfields"
  | "mainheadline"
  | "sectionheader"
  | "subheader"
  | "bodytext";

type PendingComponentInsert = {
  command: InsertableComponentCommand;
  nonce: number;
};

type EditModeContextValue = {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditing: () => void;
  isPresenting: boolean;
  setIsPresenting: (value: boolean) => void;
  togglePresenting: () => void;
  pendingComponentInsert: PendingComponentInsert | null;
  requestComponentInsert: (command: InsertableComponentCommand) => void;
  clearPendingComponentInsert: () => void;
};

const EditModeContext = createContext<EditModeContextValue | undefined>(
  undefined,
);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, rawSetIsEditing] = useState(false);
  const [isPresenting, rawSetIsPresenting] = useState(false);
  const [pendingComponentInsert, setPendingComponentInsert] =
    useState<PendingComponentInsert | null>(null);
  const insertNonceRef = useRef(0);

  const setIsEditing = useCallback((value: boolean) => {
    rawSetIsEditing(value);
    if (value) {
      rawSetIsPresenting(false);
    }
  }, []);

  const setIsPresenting = useCallback((value: boolean) => {
    rawSetIsPresenting(value);
    if (value) {
      rawSetIsEditing(false);
    }
  }, []);

  const toggleEditing = useCallback(() => {
    rawSetIsEditing((prev) => {
      const next = !prev;
      if (next) {
        rawSetIsPresenting(false);
      }
      return next;
    });
  }, []);

  const togglePresenting = useCallback(() => {
    rawSetIsPresenting((prev) => {
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
      isPresenting,
      setIsPresenting,
      togglePresenting,
      pendingComponentInsert,
      requestComponentInsert: (command: InsertableComponentCommand) => {
        insertNonceRef.current += 1;
        setPendingComponentInsert({
          command,
          nonce: insertNonceRef.current,
        });
      },
      clearPendingComponentInsert: () => setPendingComponentInsert(null),
    }),
    [
      isEditing,
      isPresenting,
      pendingComponentInsert,
      setIsEditing,
      setIsPresenting,
      toggleEditing,
      togglePresenting,
    ],
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }

  return context;
}
