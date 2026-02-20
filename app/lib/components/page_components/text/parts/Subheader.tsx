"use client";

import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type SubheaderProps = {
  text?: string;
};

export const Subheader = ({
  text = TEXT_DEFAULTS.subheader,
}: SubheaderProps) => {
  return (
    <EditableTextField
      initialText={text}
      placeholder="Subheader"
      renderClient={(value) => (
        <p className="md:text-lg text-base font-medium">{value}</p>
      )}
    />
  );
};
