"use client";

import {
  EditModeSubtreeModeProvider,
  useEditMode,
} from "@/app/lib/components/project/EditModeContext";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { getRenderablePageComponent } from "@/app/lib/components/page_components/testing_editor/componentRegistry";

export const SelectedComponentConfig = () => {
  const { selectedConfigComponentInstanceId } = useEditMode();
  const pageDocument = useOptionalPageDocument();

  if (!pageDocument?.document || !selectedConfigComponentInstanceId) {
    return (
      <span className="text-(--gray)">
        Select a component in live mode to configure it.
      </span>
    );
  }

  const component =
    pageDocument.document.components[selectedConfigComponentInstanceId];

  if (!component) {
    return (
      <span className="text-(--gray)">
        This component is no longer available on the page.
      </span>
    );
  }

  const componentMatch = getRenderablePageComponent(component.type);

  if (!componentMatch) {
    return (
      <span className="text-(--gray)">
        This component cannot be configured from chat.
      </span>
    );
  }

  const Component = componentMatch.Component;

  return (
    <EditModeSubtreeModeProvider isEditing={true} isLive={false}>
      <div className="w-full flex flex-col gap-2">
        <Component instanceId={selectedConfigComponentInstanceId} />
      </div>
    </EditModeSubtreeModeProvider>
  );
};
