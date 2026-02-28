"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type SectionHeaderProps = {
  instanceId?: string;
  text?: string;
};

function PersistedSectionHeader({ instanceId }: { instanceId: string }) {
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "SectionHeader",
  );

  return (
    <EditableTextField
      value={component.config.text}
      placeholder="Section header"
      onChange={(value) =>
        updateConfig((config) => ({
          ...config,
          text: value,
        }))
      }
      renderClient={(value) => (
        <p className="@[40rem]:text-xl text-lg font-medium">{value}</p>
      )}
    />
  );
}

export const SectionHeader = ({
  instanceId,
  text = TEXT_DEFAULTS.sectionHeader,
}: SectionHeaderProps) => {
  if (!instanceId) {
    return (
      <EditableTextField
        initialText={text}
        editable={false}
        placeholder="Section header"
        renderClient={(value) => (
          <p className="@[40rem]:text-xl text-lg font-medium">{value}</p>
        )}
      />
    );
  }

  return <PersistedSectionHeader instanceId={instanceId} />;
};
