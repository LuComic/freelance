import { ComponentItem } from "./ComponentItem";
import {
  COMPONENT_LIBRARY_ITEMS,
  type InsertableComponentCommand,
} from "@/app/lib/components/page_components/componentCatalog";
import type { PageComponentLibraryTag } from "@/lib/pageDocument/registeredDefinitions";

export type ComponentTag = PageComponentLibraryTag;

type ComponentLibProps = {
  filterTag: "" | ComponentTag;
  onInsertComponent: (command: InsertableComponentCommand) => void;
};

export const ComponentLib = ({
  filterTag,
  onInsertComponent,
}: ComponentLibProps) => {
  const visibleComps =
    filterTag === ""
      ? COMPONENT_LIBRARY_ITEMS
      : COMPONENT_LIBRARY_ITEMS.filter((item) => item.tag === filterTag);

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Browse Components</p>
      <div className="md:grid flex flex-col items-center justify-center grid-cols-2 w-full gap-2">
        {visibleComps.map((item) => (
          <ComponentItem
            key={item.key}
            compName={item.name}
            compDesc={item.description}
            previewSrc={item.previewSrc}
            onClick={() => onInsertComponent(item.insertCommand)}
          />
        ))}
      </div>
    </div>
  );
};
