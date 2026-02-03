import { ConnectionItem } from "./ConnectionItem";

export const Connections = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg">Connections</p>
      <ConnectionItem
        title="Friends"
        connections={["Alex", "Jordan", "Sam", "Riley"]}
      />
      <ConnectionItem
        title="Collaborations"
        connections={["Morgan", "Casey", "Jamie"]}
      />
      <ConnectionItem title="Sent requests" connections={["Quinn", "Avery"]} />
      <ConnectionItem
        title="Received requests"
        connections={["Drew", "Skyler", "Taylor"]}
      />
    </div>
  );
};
