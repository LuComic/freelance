"use client";

import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type SectionHeaderProps = {
  text?: string;
};

export const SectionHeader = ({
  text = TEXT_DEFAULTS.sectionHeader,
}: SectionHeaderProps) => {
  return (
    <EditableTextField
      initialText={text}
      placeholder="Section header"
      renderClient={(value) => (
        <p className="md:text-xl text-lg font-medium">{value}</p>
      )}
    />
  );
};
