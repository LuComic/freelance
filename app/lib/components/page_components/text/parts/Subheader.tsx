"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type SubheaderProps = {
  instanceId?: string;
  text?: string;
};

function PersistedSubheader({ instanceId }: { instanceId: string }) {
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "Subheader",
  );

  return (
    <EditableTextField
      value={component.config.text}
      placeholder="Subheader"
      onChange={(value) =>
        updateConfig((config) => ({
          ...config,
          text: value,
        }))
      }
      renderClient={(value) => (
        <p className="@[40rem]:text-lg text-base font-medium">{value}</p>
      )}
    />
  );
}

export const Subheader = ({
  instanceId,
  text = TEXT_DEFAULTS.subheader,
}: SubheaderProps) => {
  if (!instanceId) {
    return (
      <EditableTextField
        initialText={text}
        placeholder="Subheader"
        renderClient={(value) => (
          <p className="@[40rem]:text-lg text-base font-medium">{value}</p>
        )}
      />
    );
  }

  return <PersistedSubheader instanceId={instanceId} />;
};
