"use client";

import type { ComponentType } from "react";
import type { PageComponentType } from "@/lib/pageDocument";
import { IdeaForm } from "./idea_form/IdeaForm";

export type PageComponentRenderer = {
  type: PageComponentType;
  Component: ComponentType<{ instanceId: string }>;
};

export const REGISTERED_PAGE_COMPONENT_RENDERERS = [
  {
    type: "IdeaForm",
    Component: IdeaForm,
  },
] as const satisfies readonly PageComponentRenderer[];
