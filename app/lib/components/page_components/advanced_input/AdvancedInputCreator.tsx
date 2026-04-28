"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_SHORT_TITLE_LENGTH,
} from "@/lib/inputLimits";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdvancedInputModeLabel,
  type AdvancedInputMode,
} from "./advancedInputEntries";
import { resolveAdvancedInputColor } from "./colors";
import { getAdvancedInputFont } from "./fonts";

type AdvancedInputCreatorProps = {
  config: PageComponentInstanceByType<"AdvancedInput">["config"];
  liveState: PageComponentLiveStateByType<"AdvancedInput">["state"];
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"AdvancedInput">["config"],
    ) => PageComponentInstanceByType<"AdvancedInput">["config"],
  ) => void;
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"AdvancedInput">["state"],
    ) => PageComponentLiveStateByType<"AdvancedInput">["state"],
  ) => void;
};

export const AdvancedInputCreator = ({
  config,
  liveState,
  onChangeConfig,
  onChangeLiveState,
}: AdvancedInputCreatorProps) => {
  const [editing, setEditing] = useState(false);

  const deleteColor = (id: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      colors: currentState.colors.filter((color) => color.id !== id),
    }));
  };

  const deleteFont = (id: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      fonts: currentState.fonts.filter((font) => font.id !== id),
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium mt-2">
        Advanced input setup
      </p>
      <p className="text-(--gray-page)">
        Client submissions are listed here. Creators can remove entries.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max"
          onClick={() => setEditing((prev) => !prev)}
        >
          Edit field
          <ChevronRight size={18} className={`${editing && "rotate-90"}`} />
        </button>

        {editing && (
          <>
            <input
              type="text"
              placeholder="Field title..."
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={config.title}
              maxLength={MAX_SHORT_TITLE_LENGTH}
              onChange={(event) =>
                onChangeConfig((currentConfig) => ({
                  ...currentConfig,
                  title: event.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Field description..."
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={config.description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(event) =>
                onChangeConfig((currentConfig) => ({
                  ...currentConfig,
                  description: event.target.value,
                }))
              }
            />
            <Select
              value={config.mode}
              onValueChange={(value) =>
                onChangeConfig((currentConfig) => ({
                  ...currentConfig,
                  mode: value as AdvancedInputMode,
                }))
              }
            >
              <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                <SelectGroup className="bg-(--dim)">
                  {(["colors", "fonts"] as const).map((mode) => (
                    <SelectItem
                      key={mode}
                      value={mode}
                      className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light)"
                    >
                      {getAdvancedInputModeLabel(mode)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {liveState.colors.length > 0 || liveState.fonts.length > 0 ? (
        <div className="w-full flex flex-col gap-2">
          {config.mode === "colors" ? (
            liveState.colors.length > 0 ? (
              liveState.colors.map((color, index) => (
                <div
                  key={color.id}
                  className={`w-full min-w-0 flex items-center border-(--gray) border-dashed justify-between gap-2 flex-wrap ${index !== 0 ? "border-t pt-2" : null}`}
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-sm border border-(--gray)"
                    style={{
                      backgroundColor: resolveAdvancedInputColor(color.name),
                    }}
                  />
                  <span className="min-w-0 wrap-break-word">{color.name}</span>
                  <span className="text-(--gray-page)">{color.type}</span>
                  <button
                    className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--dim) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                    onClick={() => deleteColor(color.id)}
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <span className="text-(--gray-page)">No colors yet.</span>
            )
          ) : liveState.fonts.length > 0 ? (
            liveState.fonts.map((fontEntry, index) => {
              const font = getAdvancedInputFont(fontEntry.fontId);

              return font ? (
                <div
                  key={fontEntry.id}
                  className={`w-full min-w-0 flex items-center border-(--gray) border-dashed justify-between gap-2 flex-wrap ${index !== 0 ? "border-t pt-2" : null}`}
                >
                  <span
                    className="min-w-0 wrap-break-word"
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </span>
                  <button
                    className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--dim) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                    onClick={() => deleteFont(fontEntry.id)}
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>
              ) : null;
            })
          ) : (
            <span className="text-(--gray-page)">No fonts yet.</span>
          )}
        </div>
      ) : null}
    </>
  );
};
