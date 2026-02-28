"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";

type EditableTextFieldProps = {
  initialText?: string;
  value?: string;
  placeholder: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  renderClient: (text: string) => ReactNode;
};

export const EditableTextField = ({
  initialText,
  value,
  placeholder,
  onChange,
  editable = true,
  renderClient,
}: EditableTextFieldProps) => {
  const { isLive } = useEditMode();
  const [localText, setLocalText] = useState(initialText ?? "");
  const text = value ?? localText;

  useEffect(() => {
    if (value === undefined) {
      setLocalText(initialText ?? "");
    }
  }, [initialText, value]);

  const handleChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }
    setLocalText(nextValue);
  };

  return (
    <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
      {isLive || !editable ? (
        renderClient(text)
      ) : (
        <input
          type="text"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
        />
      )}
    </div>
  );
};
