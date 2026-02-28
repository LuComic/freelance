"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";

type MainHeadlineProps = {
  instanceId?: string;
  text?: string;
};

function PersistedMainHeadline({ instanceId }: { instanceId: string }) {
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "MainHeadline",
  );

  return (
    <EditableTextField
      value={component.config.text}
      placeholder="Main headline"
      onChange={(value) =>
        updateConfig((config) => ({
          ...config,
          text: value,
        }))
      }
      renderClient={(value) => (
        <p className="@[40rem]:text-3xl text-xl font-medium">{value}</p>
      )}
    />
  );
}

export const MainHeadline = ({
  instanceId,
  text = TEXT_DEFAULTS.mainHeadline,
}: MainHeadlineProps) => {
  if (!instanceId) {
    return (
      <EditableTextField
        initialText={text}
        placeholder="Main headline"
        renderClient={(value) => (
          <p className="@[40rem]:text-3xl text-xl font-medium">{value}</p>
        )}
      />
    );
  }

  return <PersistedMainHeadline instanceId={instanceId} />;
};
