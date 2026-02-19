"use client";

import { createContext, useContext, useMemo, useState } from "react";

type EditModeContextValue = {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditing: () => void;
};

const EditModeContext = createContext<EditModeContextValue | undefined>(
  undefined,
);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  const value = useMemo(
    () => ({
      isEditing,
      setIsEditing,
      toggleEditing: () => setIsEditing((prev) => !prev),
    }),
    [isEditing],
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
