import { ConnectionItem } from "./ConnectionItem";
import { useSearchBar } from "../searchbar/SearchBarContext";
import type { SidebarConnectionsData } from "../connections/types";
import { useSidebarController } from "./SidebarControllerContext";

type ConnectionsProps = {
  connections: SidebarConnectionsData | undefined;
};

export const Connections = ({ connections }: ConnectionsProps) => {
  const { openTaggedSearch } = useSearchBar();
  const { requestedConnectionsSection, requestVersion } =
    useSidebarController();

  return (
    <div className="flex flex-col gap-1 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto">
      <p className="md:text-xl text-lg font-medium">Connections</p>
      <button
        type="button"
        onClick={() => openTaggedSearch("people")}
        className="gap-1 flex items-center justify-center px-2 py-1 rounded-md w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 my-2"
      >
        Find people
      </button>
      {connections === undefined ? (
        <>
          <div className="bg-(--gray)/60 w-full mt-2 h-[22px] rounded-md animate-pulse"></div>
          <div className="bg-(--gray)/60 w-2/3 mt-2 h-[22px] rounded-md animate-pulse"></div>
        </>
      ) : null}
      <ConnectionItem
        title="Friends"
        items={connections?.friends ?? []}
        type="friends"
        requestedOpenToken={
          requestedConnectionsSection === "friends" ? requestVersion : 0
        }
      />
      <ConnectionItem
        title="Collaborations"
        items={connections?.collaborators ?? []}
        type="collabs"
      />
      <ConnectionItem
        title="Invites"
        items={connections?.invites ?? []}
        type="invites"
        requestedOpenToken={
          requestedConnectionsSection === "invites" ? requestVersion : 0
        }
      />
      <ConnectionItem
        title="Sent requests"
        items={connections?.sentRequests ?? []}
        type="sent"
      />
      <ConnectionItem
        title="Received requests"
        items={connections?.receivedRequests ?? []}
        type="got"
        requestedOpenToken={
          requestedConnectionsSection === "got" ? requestVersion : 0
        }
      />
      <ConnectionItem
        title="Blocked"
        items={connections?.blocked ?? []}
        type="blocked"
      />
    </div>
  );
};
