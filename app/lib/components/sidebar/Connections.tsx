import { ConnectionItem } from "./ConnectionItem";

export const Connections = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Connections</p>
      <ConnectionItem
        title="Friends"
        items={["Alex", "Jordan", "Sam", "Riley"]}
        type="friends"
      />
      <ConnectionItem
        title="Collaborations"
        items={["Morgan", "Casey", "Jamie"]}
        type="collabs"
      />
      <ConnectionItem
        title="Sent requests"
        items={["Quinn", "Avery"]}
        type="sent"
      />
      <ConnectionItem
        title="Received requests"
        items={["Drew", "Skyler", "Taylor"]}
        type="got"
      />
    </div>
  );
};
