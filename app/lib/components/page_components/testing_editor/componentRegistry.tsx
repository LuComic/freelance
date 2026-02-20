"use client";

import { Kanban } from "@/app/lib/components/page_components/progress/Kanban";
import { Feedback } from "@/app/lib/components/page_components/feedback/Feedback";
import { TextFields } from "@/app/lib/components/page_components/text/TextFields";
import { Select } from "@/app/lib/components/page_components/form/select/Select";
import { Radio } from "@/app/lib/components/page_components/form/radio/Radio";

export const COMPONENT_COMMANDS = [
  { command: "kanban", tag: "Kanban", Component: Kanban },
  { command: "feedback", tag: "Feedback", Component: Feedback },
  { command: "textfields", tag: "TextFields", Component: TextFields },
  { command: "select", tag: "Select", Component: Select },
  { command: "radio", tag: "Radio", Component: Radio },
] as const;

export type EditorComponentCommand = (typeof COMPONENT_COMMANDS)[number]["command"];
