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
  const text = value ?? (editable ? localText : (initialText ?? ""));

  const handleChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }
    setLocalText(nextValue);
  };

  return (
    <div
      className={`w-full ${isLive || !editable ? "border-b border-(--gray) pb-1 mb-2" : "flex flex-col gap-2"}`}
    >
      {isLive || !editable ? (
        renderClient(text)
      ) : (
        <>
          <p className="text-lg font-medium">Text</p>
          <input
            type="text"
            value={text}
            onChange={(event) => handleChange(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full rounded-md bg-(--dim) px-2 py-1.5 outline-none"
          />
        </>
      )}
    </div>
  );
};
