"use client";

import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";

type SelectClientProps = {
  config: PageComponentInstanceByType<"Select">["config"];
  liveState: PageComponentLiveStateByType<"Select">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Select">["state"],
    ) => PageComponentLiveStateByType<"Select">["state"],
  ) => void;
};

export const SelectClient = ({
  config,
  liveState,
  onChangeLiveState,
}: SelectClientProps) => {

  const toggleOption = (id: number) => {
    onChangeLiveState((currentLiveState) => ({
      ...currentLiveState,
      selectedOptionIds: currentLiveState.selectedOptionIds.includes(id)
        ? currentLiveState.selectedOptionIds.filter((optionId) => optionId !== id)
        : [...currentLiveState.selectedOptionIds, id],
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">{config.title}</p>
      <p className="text-(--gray-page)">{config.description}</p>
      <div className="w-full flex flex-col gap-2">
        {config.options.map((option) => {
          const selected = liveState.selectedOptionIds.includes(option.id);

          return (
            <button
              key={option.id}
              className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2  border px-2 py-1.5 ${selected ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} rounded-sm`}
              onClick={() => toggleOption(option.id)}
            >
              <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
                {selected && (
                  <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
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
