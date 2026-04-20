"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/inputLimits";

type SubheaderProps = {
  instanceId?: string;
  text?: string;
};

function PersistedSubheader({ instanceId }: { instanceId: string }) {
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "Subheader",
  );

  return (
    <div
      className={`w-full ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      <EditableTextField
        value={component.config.text}
        placeholder="Subheader"
        maxLength={MAX_DESCRIPTION_LENGTH}
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
    </div>
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
        editable={false}
        placeholder="Subheader"
        renderClient={(value) => (
          <p className="@[40rem]:text-lg text-base font-medium">{value}</p>
        )}
      />
    );
  }

  return <PersistedSubheader instanceId={instanceId} />;
};
