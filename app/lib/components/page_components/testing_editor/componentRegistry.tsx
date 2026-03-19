"use client";

import type { ComponentType } from "react";
import type { PageComponentType } from "@/lib/pageDocument";
import { Calendar } from "@/app/lib/components/page_components/calendar/Calendar";
import { Feedback } from "@/app/lib/components/page_components/feedback/Feedback";
import { Radio } from "@/app/lib/components/page_components/form/radio/Radio";
import { Select } from "@/app/lib/components/page_components/form/select/Select";
import { Kanban } from "@/app/lib/components/page_components/progress/Kanban";
import { MainHeadline } from "@/app/lib/components/page_components/text/parts/MainHeadline";
import { PageLink } from "@/app/lib/components/page_components/text/parts/PageLink";
import { SectionHeader } from "@/app/lib/components/page_components/text/parts/SectionHeader";
import { Subheader } from "@/app/lib/components/page_components/text/parts/Subheader";
import { REGISTERED_PAGE_COMPONENT_RENDERERS } from "@/app/lib/components/page_components/registeredComponentRenderers";

type RenderableComponentEntry = {
  type: PageComponentType;
  Component: ComponentType<{ instanceId: string }>;
};

const LEGACY_RENDERABLE_COMPONENTS = [
  { type: "Calendar", Component: Calendar },
  { type: "Kanban", Component: Kanban },
  { type: "Feedback", Component: Feedback },
  { type: "Select", Component: Select },
  { type: "Radio", Component: Radio },
  { type: "MainHeadline", Component: MainHeadline },
  { type: "SectionHeader", Component: SectionHeader },
  { type: "Subheader", Component: Subheader },
  { type: "PageLink", Component: PageLink },
] as const satisfies readonly RenderableComponentEntry[];

export const RENDERABLE_COMPONENTS = [
  ...LEGACY_RENDERABLE_COMPONENTS,
  ...REGISTERED_PAGE_COMPONENT_RENDERERS,
] as const satisfies readonly RenderableComponentEntry[];

export function getRenderablePageComponent(type: PageComponentType) {
  return RENDERABLE_COMPONENTS.find((component) => component.type === type) ?? null;
}
