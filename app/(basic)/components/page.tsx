import type { Metadata } from "next";
import type { ComponentType } from "react";
import { canonicalUrl } from "@/app/lib/seo";
import { AdvancedInputPreview } from "@/app/lib/components/comp_page/AdvancedInputPreview";
import { DropdownPreview } from "@/app/lib/components/comp_page/DropdownPreview";
import { FeedbackPreview } from "@/app/lib/components/comp_page/FeedbackPreview";
import { FormPreview } from "@/app/lib/components/comp_page/FormPreview";
import { IdeaBoardPreview } from "@/app/lib/components/comp_page/IdeaBoardPreview";
import { KanbanPreview } from "@/app/lib/components/comp_page/KanbanPreview";
import { PageLinkPreview } from "@/app/lib/components/comp_page/PageLinkPreview";
import { Prologue } from "@/app/lib/components/comp_page/Prologue";
import { RadioPreview } from "@/app/lib/components/comp_page/RadioPreview";
import { SelectPreview } from "@/app/lib/components/comp_page/SelectPreview";
import { SimpleInputPreview } from "@/app/lib/components/comp_page/SimpleInputPreview";
import { TablePreview } from "@/app/lib/components/comp_page/TablePreview";

export const metadata: Metadata = {
  title: "Pageboard | Components",
  description:
    "Explore Pageboard components for feedback, inputs, boards, calendars, and more",
  alternates: {
    canonical: canonicalUrl("/components"),
  },
};

type ComponentPageSection = {
  title: string;
  description: string;
  commands: string;
  Preview?: ComponentType;
  note?: string;
};

const COMPONENT_SECTIONS: ComponentPageSection[] = [
  {
    title: "Select",
    description:
      "Select is a simple, but necessary, component in Pageboard. It allows you to set certain options for the client, who can then select as many of them as they'd like.",
    commands: "Command: /select",
    Preview: SelectPreview,
  },
  {
    title: "Radio",
    description:
      "Radio is quite similar to the Select component, but instead of multiple options, the client can pick only one option.",
    commands: "Command: /radio",
    Preview: RadioPreview,
  },
  {
    title: "Recommend/feedback",
    description:
      "Recommend lets clients send feedback or ideas for creators to review and later filter by status.",
    commands: "Command: /feedback",
    Preview: FeedbackPreview,
  },
  {
    title: "Kanban",
    description:
      "Kanban displays progress across todo, in progress, and done columns. The team, freelancer, or creator can use this to keep the client in sync with how everything is going.",
    commands: "Command: /kanban",
    Preview: KanbanPreview,
  },
  {
    title: "Idea Board",
    description:
      "Idea Board lets people share ideas and compare them by vote count. Teams can use it for brainstorming, seeing what the client likes most, or as an alternative to Recommend/Feedback.",
    commands: "Commands: /ideaboard, /board",
    Preview: IdeaBoardPreview,
  },
  {
    title: "Table",
    description:
      "Table displays structured text in rows and columns. It can be used for comparisons, summaries, or organizing information for clients.",
    commands: "Command: /table",
    Preview: TablePreview,
  },
  {
    title: "Simple Input",
    description:
      "Simple Input gives clients one quick field for a written response. Used when a form or some other more complicated component just isn't necessary.",
    commands: "Commands: /input, /simpleinput",
    Preview: SimpleInputPreview,
  },
  {
    title: "Advanced Input",
    description:
      "Advanced Input collects specific client preferences like colors and fonts. This will get updates soon, with fields for things like pictures.",
    commands: "Commands: /advancedinput, /advanced",
    Preview: AdvancedInputPreview,
  },
  {
    title: "Form",
    description:
      "Form combines fields into one submit flow for individual responses. It has the simple Select, Radio, and SimpleInput components, which can be marked as required or optional, just like a regular form.",
    commands: "Command: /form",
    Preview: FormPreview,
  },
  {
    title: "Dropdown",
    description:
      "Dropdown adds a collapsible content block to the page. It is used for organizing content.",
    commands: "Command: /dropdown",
    Preview: DropdownPreview,
  },
  {
    title: "Text Components",
    description: "Text components add headings to a page.",
    commands:
      "Commands: /mainheadline, /h1 or Markdown #; /sectionheader, /h2 or Markdown ##; /subheader, /h3 or Markdown ###",
  },
  {
    title: "Page Link",
    description: "Page Link points to another page in the same project.",
    commands: "Command: /pagelink",
    Preview: PageLinkPreview,
  },
  {
    title: "Calendar",
    description:
      "Calendar schedules and shares project events. Teams can use it for deadlines, showing progress to the client, setting up meetings, and more.",
    commands: "Commands: /calendar, /testing",
    note: "too complex for a simple visualisation",
  },
];

export default function Page() {
  return (
    <div className="w-full mx-auto flex flex-col gap-2 md:max-w-3xl px-4 pt-20 pb-4 sm:px-6 lg:px-8">
      <Prologue />
      {COMPONENT_SECTIONS.map(
        ({ title, description, commands, Preview, note }) => (
          <div key={title} className="p-2 flex flex-col gap-2 bg-(--gray)/10">
            <p className="md:text-xl text-lg font-medium">{title}</p>
            <p className="text-(--gray-page)">{description}</p>
            <p className="text-(--gray-page)">{commands}</p>
            {note ? <p className="text-(--gray-page)">{note}</p> : null}
            {Preview ? <Preview /> : null}
          </div>
        ),
      )}
    </div>
  );
}
