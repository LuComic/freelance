"use client";

import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type MainHeadlineProps = {
  text?: string;
};

export const MainHeadline = ({
  text = TEXT_DEFAULTS.mainHeadline,
}: MainHeadlineProps) => {
  return (
    <EditableTextField
      initialText={text}
      placeholder="Main headline"
      renderClient={(value) => (
        <p className="@[40rem]:text-3xl text-xl font-medium">{value}</p>
      )}
    />
  );
};
