"use client";

import { TestingComponent } from "@/app/lib/components/page_components/TestingComponent";
import { Kanban } from "@/app/lib/components/page_components/progress/Kanban";
import { Feedback } from "@/app/lib/components/page_components/feedback/Feedback";
import { Select } from "@/app/lib/components/page_components/form/select/Select";
import { Radio } from "@/app/lib/components/page_components/form/radio/Radio";
import { MainHeadline } from "@/app/lib/components/page_components/text/parts/MainHeadline";
import { PageLink } from "@/app/lib/components/page_components/text/parts/PageLink";
import { SectionHeader } from "@/app/lib/components/page_components/text/parts/SectionHeader";
import { Subheader } from "@/app/lib/components/page_components/text/parts/Subheader";

export const COMPONENT_REGISTRY = [
  {
    tag: "TestingComponent",
    Component: TestingComponent,
    commands: ["testing"],
  },
  { tag: "Kanban", Component: Kanban, commands: ["kanban"] },
  { tag: "Feedback", Component: Feedback, commands: ["feedback"] },
  { tag: "Select", Component: Select, commands: ["select"] },
  { tag: "Radio", Component: Radio, commands: ["radio"] },
  {
    tag: "MainHeadline",
    Component: MainHeadline,
    commands: ["mainheadline", "h1"],
  },
  {
    tag: "SectionHeader",
    Component: SectionHeader,
    commands: ["sectionheader", "h2"],
  },
  { tag: "Subheader", Component: Subheader, commands: ["subheader", "h3"] },
  { tag: "PageLink", Component: PageLink, commands: ["pagelink"] },
] as const;

export const PRIMARY_INSERTABLE_COMMANDS = COMPONENT_REGISTRY.map(
  ({ commands }) => commands[0],
);

export const RENDERABLE_COMPONENTS = COMPONENT_REGISTRY.map(
  ({ tag, Component }) => ({
    tag,
    Component,
  }),
);

export const INSERTABLE_COMPONENT_COMMANDS = COMPONENT_REGISTRY.flatMap(
  ({ tag, commands }) => commands.map((command) => ({ command, tag })),
);

export type EditorComponentCommand =
  (typeof INSERTABLE_COMPONENT_COMMANDS)[number]["command"];
