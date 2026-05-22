"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import { usePageComponentState } from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { ImageClient } from "./ImageClient";
import { ImageCreator } from "./ImageCreator";

export const Image = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, updateConfig } = usePageComponentState(
    instanceId,
    "Image",
  );

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <ImageClient config={component.config} />
      ) : (
        <ImageCreator config={component.config} onChangeConfig={updateConfig} />
      )}
    </div>
  );
};
