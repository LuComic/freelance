"use client";

import { useState } from "react";

type TextFieldsCreatorProps = {
  initialLayout?: "grid" | "list";
};

export const TextFieldsCreator = ({}: TextFieldsCreatorProps) => {
  const [h1, setH1] = useState("Main Headline");
  const [h2, setH2] = useState("Section Header");
  const [h3, setH3] = useState("Subheader");
  const [body, setBody] = useState(
    "This is normal body text without specific styling.",
  );

  return (
    <>
      <p className="md:text-xl text-lg font-medium">Text field setup</p>
      <p className="text-(--gray-page)">
        Set the content for h1, h2, h3 and body text. Client view only shows the
        rendered text.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <input
          type="text"
          value={h1}
          onChange={(e) => setH1(e.target.value)}
          placeholder="h1"
          className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
        />
        <input
          type="text"
          value={h2}
          onChange={(e) => setH2(e.target.value)}
          placeholder="h2"
          className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
        />
        <input
          type="text"
          value={h3}
          onChange={(e) => setH3(e.target.value)}
          placeholder="h3"
          className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="body"
          className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none min-h-24"
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">{h1}</p>
        <p className="md:text-xl text-lg font-medium">{h2}</p>
        <p className="md:text-lg text-base font-medium">{h3}</p>
        <p>{body}</p>
      </div>
    </>
  );
};
