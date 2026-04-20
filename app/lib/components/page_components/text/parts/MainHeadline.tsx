"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";
import { MAX_SHORT_TITLE_LENGTH } from "@/lib/inputLimits";

type MainHeadlineProps = {
  instanceId?: string;
  text?: string;
};

function PersistedMainHeadline({ instanceId }: { instanceId: string }) {
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "MainHeadline",
  );

  return (
    <div
      className={`w-full ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      <EditableTextField
        value={component.config.text}
        placeholder="Main headline"
        maxLength={MAX_SHORT_TITLE_LENGTH}
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
    </div>
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
        editable={false}
        placeholder="Main headline"
        renderClient={(value) => (
          <p className="@[40rem]:text-3xl text-xl font-medium">{value}</p>
        )}
      />
    );
  }

  return <PersistedMainHeadline instanceId={instanceId} />;
};
