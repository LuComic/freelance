import { SidebarItem } from "./SidebarItem";

export const Files = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Projects</p>
      <SidebarItem
        title="Getting Started - creator"
        items={["Creating a project"]}
      />
      <SidebarItem
        title="Getting Started - client"
        items={["Joining a project"]}
      />
    </div>
  );
};
