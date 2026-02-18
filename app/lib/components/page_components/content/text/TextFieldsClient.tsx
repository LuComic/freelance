"use client";

import { useState } from "react";

type TextContent = {
  h1: string;
  h2: string;
  h3: string;
  body: string;
};

const TEXT_CONTENT: TextContent = {
  h1: "Main Headline",
  h2: "Section Header",
  h3: "Subheader",
  body: "This is normal body text without specific styling.",
};

type TextFieldsClientProps = {
  initialLayout?: "grid" | "list";
};

export const TextFieldsClient = ({}: TextFieldsClientProps) => {
  const [content] = useState(TEXT_CONTENT);

  return (
    <>
      <p className="md:text-3xl text-xl font-medium">{content.h1}</p>
      <p className="md:text-xl text-lg font-medium">{content.h2}</p>
      <p className="md:text-lg text-base font-medium">{content.h3}</p>
      <p>{content.body}</p>
    </>
  );
};
