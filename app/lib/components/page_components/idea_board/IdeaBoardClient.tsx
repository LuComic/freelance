"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type IdeaBoardClientProps = {
  liveState: PageComponentLiveStateByType<"IdeaBoard">["state"];
};

export const IdeaBoardClient = ({ liveState }: IdeaBoardClientProps) => {
  return <div>IdeaBoardClient</div>;
};
