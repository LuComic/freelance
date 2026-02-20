"use client";

import { useState, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

type EditableTextFieldProps = {
  initialText: string;
  placeholder: string;
  multiline?: boolean;
  renderClient: (text: string) => ReactNode;
};

export const EditableTextField = ({
  initialText,
  placeholder,
  multiline = false,
  renderClient,
}: EditableTextFieldProps) => {
  const [client, setClient] = useState(false);
  const [text, setText] = useState(initialText);

  return (
    <div className="w-full border-y border-(--gray) py-2 flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Switch
          className="data-[state=checked]:bg-(--vibrant) data-[state=unchecked]:bg-(--dim)"
          onClick={() => setClient((prev) => !prev)}
        />
        {client ? "Client's view" : "Creator's view"}
      </div>

      {client ? (
        renderClient(text)
      ) : multiline ? (
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md bg-(--darkest) px-2 py-1.5 outline-none min-h-24"
        />
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
