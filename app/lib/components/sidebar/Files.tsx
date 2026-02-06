import { SidebarItem } from "./SidebarItem";

export const Files = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Projects</p>
      <SidebarItem
        title="Getting Started"
        items={["Creating a project - Creator", "Joining a project - Client"]}
      />
    </div>
  );
};
