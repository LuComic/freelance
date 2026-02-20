import { ComponentItem } from "./ComponentItem";

const COMPS: { name: string; desc: string }[] = [
  { name: "Kanban", desc: "Display the progress as a Kanban table" },
  {
    name: "Recommend",
    desc: "Client can give feedback or recommend things they'd like",
  },
  {
    name: "Select",
    desc: "Simple select component for multiple answers",
  },
  {
    name: "Radio",
    desc: "Simple radio element for a single answer",
  },
  {
    name: "Text field",
    desc: "Simple, differently formatted headers",
  },
];

export const ComponentLib = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Browse Components</p>
      <div className="md:grid flex flex-col items-center justify-center grid-cols-2 w-full gap-2">
        {COMPS.map((item, index) => (
          <ComponentItem
            key={index}
            compName={item.name}
            compDesc={item.desc}
          />
        ))}
      </div>
    </div>
  );
};
