"use client";

import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type BodyTextProps = {
  text?: string;
};

export const BodyText = ({ text = TEXT_DEFAULTS.bodyText }: BodyTextProps) => {
  return (
    <EditableTextField
      initialText={text}
      placeholder="Body text"
      multiline
      renderClient={(value) => <p>{value}</p>}
    />
  );
};
