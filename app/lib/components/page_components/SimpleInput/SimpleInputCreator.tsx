"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { Trash } from "lucide-react";

type SimpleInputCreatorProps = {
  liveState: PageComponentLiveStateByType<"SimpleInput">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"SimpleInput">["state"],
    ) => PageComponentLiveStateByType<"SimpleInput">["state"],
  ) => void;
};

export const SimpleInputCreator = ({
  liveState,
  onChangeLiveState,
}: SimpleInputCreatorProps) => {
  const handleDeleteInput = (inputId: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      inputs: currentState.inputs.filter((input) => input.id !== inputId),
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium mt-2">Simple Input</p>
      <p className="text-(--gray-page)">
        Client submissions are listed here. Creators can remove entries.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        {liveState.inputs.length > 0 ? (
          liveState.inputs.map((input, index) => (
            <div
              key={input.id}
              className={`w-full min-w-0 flex items-center border-(--gray) border-dashed justify-between gap-2 flex-wrap ${index !== 0 ? "border-t pt-2" : null}`}
            >
              <span className="min-w-0 wrap-break-word">{input.value}</span>

              <button
                className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--dim) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                onClick={() => handleDeleteInput(input.id)}
              >
                <Trash size={14} />
                Delete
              </button>
            </div>
          ))
        ) : (
          <span className="text-(--gray-page)">No inputs yet.</span>
        )}
      </div>
    </>
  );
};
