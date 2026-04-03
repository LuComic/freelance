"use client";

import type { ComponentType } from "react";
import type { PageComponentType } from "@/lib/pageDocument";
import { IdeaBoard } from "./idea_board/IdeaBoard";
import { SimpleInput } from "./SimpleInput/SimpleInput";

export type PageComponentRenderer = {
  type: PageComponentType;
  Component: ComponentType<{ instanceId: string }>;
};

export const REGISTERED_PAGE_COMPONENT_RENDERERS = [
  {
    type: "IdeaBoard",
    Component: IdeaBoard,
  },
  {
    type: "SimpleInput",
    Component: SimpleInput,
  },
] as const satisfies readonly PageComponentRenderer[];
