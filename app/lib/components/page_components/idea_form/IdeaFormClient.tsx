"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";

type IdeaFormClientProps = {
  liveState: PageComponentLiveStateByType<"IdeaForm">["state"];
};

export const IdeaFormClient = ({ liveState }: IdeaFormClientProps) => {
  return (
    <>
      {liveState.ideas.map((idea) => (
        <div key={idea.id}>
          {idea.text}
          {idea.color ? ` (${idea.color})` : ""}
        </div>
      ))}
    </>
  );
};
