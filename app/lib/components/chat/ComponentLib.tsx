import { ComponentItem } from "./ComponentItem";
import type { InsertableComponentCommand } from "@/app/lib/components/project/EditModeContext";

export type ComponentTag = "progress" | "text" | "input" | "feedback";

const COMPS: {
  name: string;
  desc: string;
  previewSrc: string;
  tag: ComponentTag;
  insertCommand: InsertableComponentCommand;
}[] = [
  {
    name: "Kanban",
    desc: "Display the progress as a Kanban table",
    previewSrc: "/component-previews/kanban.svg",
    tag: "progress",
    insertCommand: "kanban",
  },
  {
    name: "Recommend",
    desc: "Client can give feedback or recommend things they'd like",
    previewSrc: "/component-previews/recommend.svg",
    tag: "feedback",
    insertCommand: "feedback",
  },
  {
    name: "Select",
    desc: "Simple select component for multiple answers",
    previewSrc: "/component-previews/select.svg",
    tag: "input",
    insertCommand: "select",
  },
  {
    name: "Radio",
    desc: "Simple radio element for a single answer",
    previewSrc: "/component-previews/radio.svg",
    tag: "input",
    insertCommand: "radio",
  },
  {
    name: "Main Headline (H1)",
    desc: "Large top-level headline text. Commands: /mainheadline, /h1",
    previewSrc: "/component-previews/text-h1.svg",
    tag: "text",
    insertCommand: "mainheadline",
  },
  {
    name: "Section Header (H2)",
    desc: "Medium section heading text. Commands: /sectionheader, /h2",
    previewSrc: "/component-previews/text-h2.svg",
    tag: "text",
    insertCommand: "sectionheader",
  },
  {
    name: "Subheader (H3)",
    desc: "Smaller heading for subsections. Commands: /subheader, /h3",
    previewSrc: "/component-previews/text-h3.svg",
    tag: "text",
    insertCommand: "subheader",
  },
  {
    name: "Body Text",
    desc: "Standard paragraph text block. Commands: /bodytext, /body",
    previewSrc: "/component-previews/text-body.svg",
    tag: "text",
    insertCommand: "bodytext",
  },
];

type ComponentLibProps = {
  filterTag: "" | ComponentTag;
  onInsertComponent: (command: InsertableComponentCommand) => void;
};

export const ComponentLib = ({
  filterTag,
  onInsertComponent,
}: ComponentLibProps) => {
  const visibleComps =
    filterTag === "" ? COMPS : COMPS.filter((item) => item.tag === filterTag);

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Browse Components</p>
      <div className="md:grid flex flex-col items-center justify-center grid-cols-2 w-full gap-2">
        {visibleComps.map((item, index) => (
          <ComponentItem
            key={index}
            compName={item.name}
            compDesc={item.desc}
            previewSrc={item.previewSrc}
            onClick={() => onInsertComponent(item.insertCommand)}
          />
        ))}
      </div>
    </div>
  );
};
