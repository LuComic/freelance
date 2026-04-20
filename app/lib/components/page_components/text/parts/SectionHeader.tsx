"use client";

import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { EditableTextField } from "./EditableTextField";
import { TEXT_DEFAULTS } from "./textDefaults";
import { MAX_SHORT_TITLE_LENGTH } from "@/lib/inputLimits";

type SectionHeaderProps = {
  instanceId?: string;
  text?: string;
};

function PersistedSectionHeader({ instanceId }: { instanceId: string }) {
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "SectionHeader",
  );

  return (
    <div
      className={`w-full ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      <EditableTextField
        value={component.config.text}
        placeholder="Section header"
        maxLength={MAX_SHORT_TITLE_LENGTH}
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
    </div>
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
