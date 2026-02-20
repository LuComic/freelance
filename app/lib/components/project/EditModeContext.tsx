"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

export type InsertableComponentCommand =
  | "kanban"
  | "feedback"
  | "textfields"
  | "select"
  | "radio";

type PendingComponentInsert = {
  command: InsertableComponentCommand;
  nonce: number;
};

type EditModeContextValue = {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditing: () => void;
  pendingComponentInsert: PendingComponentInsert | null;
  requestComponentInsert: (command: InsertableComponentCommand) => void;
  clearPendingComponentInsert: () => void;
};

const EditModeContext = createContext<EditModeContextValue | undefined>(
  undefined,
);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingComponentInsert, setPendingComponentInsert] =
    useState<PendingComponentInsert | null>(null);
  const insertNonceRef = useRef(0);

  const value = useMemo(
    () => ({
      isEditing,
      setIsEditing,
      toggleEditing: () => setIsEditing((prev) => !prev),
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
    [isEditing, pendingComponentInsert],
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
