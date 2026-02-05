import { FileItem } from "./FileItem";

export const Files = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Projects</p>
      <FileItem
        title="Getting Started - developer"
        description="Creating a project"
      />
      <FileItem
        title="Getting Started - client"
        description="Joining a project"
      />
    </div>
  );
};
