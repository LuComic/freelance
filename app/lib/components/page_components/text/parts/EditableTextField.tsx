"use client";

import { useState, type ReactNode } from "react";
import { useEditMode } from "@/app/lib/components/project/EditModeContext";

type EditableTextFieldProps = {
  initialText: string;
  placeholder: string;
  renderClient: (text: string) => ReactNode;
};

export const EditableTextField = ({
  initialText,
  placeholder,
  renderClient,
}: EditableTextFieldProps) => {
  const { isPresenting } = useEditMode();
  const [text, setText] = useState(initialText);

  return (
    <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
      {isPresenting ? (
        renderClient(text)
      ) : (
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
        />
      )}
    </div>
  );
};
