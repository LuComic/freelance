"use client";

import { useState, type ReactNode } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";

type EditableTextFieldProps = {
  initialText?: string;
  value?: string;
  placeholder: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  maxLength?: number;
  renderClient: (text: string) => ReactNode;
};

export const EditableTextField = ({
  initialText,
  value,
  placeholder,
  onChange,
  editable = true,
  maxLength,
  renderClient,
}: EditableTextFieldProps) => {
  const { isLive } = useEditMode();
  const [localText, setLocalText] = useState(initialText ?? "");
  const text = value ?? localText;

  const handleChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }
    setLocalText(nextValue);
  };

  return (
    <div className="w-full border-b border-(--gray) pb-1 flex flex-col gap-2 mb-2">
      {isLive || !editable ? (
        renderClient(text)
      ) : (
        <input
          type="text"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-md bg-(--dim) px-2 py-1.5 outline-none"
        />
      )}
    </div>
  );
};
