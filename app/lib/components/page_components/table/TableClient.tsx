"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { TableBoard } from "./TableBoard";

type TableClientProps = {
  liveState: PageComponentLiveStateByType<"Table">["state"];
};

export const TableClient = ({ liveState }: TableClientProps) => {
  return <TableBoard liveState={liveState} />;
};
