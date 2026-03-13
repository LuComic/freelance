"use client";

import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";

type RadioClientProps = {
  config: PageComponentInstanceByType<"Radio">["config"];
  liveState: PageComponentLiveStateByType<"Radio">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Radio">["state"],
    ) => PageComponentLiveStateByType<"Radio">["state"],
  ) => void;
};

export const RadioClient = ({
  config,
  liveState,
  onChangeLiveState,
}: RadioClientProps) => {
  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">{config.title}</p>
      <p className="text-(--gray-page)">{config.description}</p>
      <div className="border-(--gray) border-t pt-2 w-full flex flex-col gap-2">
        {config.options.map((option) => {
          const selected = liveState.selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              className="flex items-center gap-2 justify-start w-full "
              onClick={() =>
                onChangeLiveState((currentLiveState) => ({
                  ...currentLiveState,
                  selectedOptionId: option.id,
                }))
              }
            >
              <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest)">
                {selected && (
                  <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                )}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
};
