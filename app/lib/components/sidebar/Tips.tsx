import { TipItem } from "./TipItem";

export const Tips = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg">Tips</p>
      <TipItem
        title="Getting Started - freelancer"
        description="Creating a project"
      />
      <TipItem
        title="Getting Started - client"
        description="Joining a project"
      />
    </div>
  );
};
