"use client";

import { useEditMode } from "@/app/lib/components/project/EditModeContext";
import {
  usePageComponentState,
  usePageDocument,
} from "@/app/lib/components/project/PageDocumentContext";
import { useLiveComponentConfigActivator } from "@/app/lib/components/page_components/useLiveComponentConfigActivator";
import { FormClient } from "./FormClient";
import { FormCreator } from "./FormCreator";

export const Form = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { activePage } = usePageDocument();
  const liveConfigActivator = useLiveComponentConfigActivator(instanceId);
  const { component, updateConfig } = usePageComponentState(instanceId, "Form");

  return (
    <div
      className={`w-full flex flex-col gap-2 ${liveConfigActivator.className}`}
      onClickCapture={liveConfigActivator.onClickCapture}
    >
      {isLive ? (
        <FormClient
          pageId={activePage.page.id}
          formInstanceId={instanceId}
          config={component.config}
        />
      ) : (
        <FormCreator config={component.config} onChangeConfig={updateConfig} />
      )}
    </div>
  );
};
