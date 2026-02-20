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
    name: "Text field",
    desc: "Simple, differently formatted headers",
    previewSrc: "/component-previews/text-field.svg",
    tag: "text",
    insertCommand: "textfields",
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
