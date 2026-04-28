"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
import type {
  PageComponentInstanceByType,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { MAX_OPTION_LABEL_LENGTH } from "@/lib/inputLimits";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADVANCED_INPUT_COLOR_TYPES,
  createAdvancedInputEntryId,
  type AdvancedInputColorType,
} from "./advancedInputEntries";
import { resolveAdvancedInputColor } from "./colors";
import { ADVANCED_INPUT_FONTS, getAdvancedInputFont } from "./fonts";

type AdvancedInputClientProps = {
  config: PageComponentInstanceByType<"AdvancedInput">["config"];
  liveState: PageComponentLiveStateByType<"AdvancedInput">["state"];
  onChangeLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"AdvancedInput">["state"],
    ) => PageComponentLiveStateByType<"AdvancedInput">["state"],
  ) => void;
};

export const AdvancedInputClient = ({
  config,
  liveState,
  onChangeLiveState,
}: AdvancedInputClientProps) => {
  const [adding, setAdding] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const [colorType, setColorType] = useState<AdvancedInputColorType>("other");
  const [fontId, setFontId] = useState<string>(ADVANCED_INPUT_FONTS[0].id);
  const selectedFontIds = useMemo(
    () => new Set(liveState.fonts.map((font) => font.fontId)),
    [liveState.fonts],
  );

  const addColor = () => {
    const name = colorInput.trim();

    if (!name) return;

    onChangeLiveState((currentState) => ({
      ...currentState,
      colors: [
        {
          id: createAdvancedInputEntryId("color"),
          name,
          type: colorType,
        },
        ...currentState.colors,
      ],
    }));
    setColorInput("");
    setColorType("other");
  };

  const addFont = () => {
    if (!getAdvancedInputFont(fontId) || selectedFontIds.has(fontId)) return;

    onChangeLiveState((currentState) => ({
      ...currentState,
      fonts: [
        {
          id: createAdvancedInputEntryId("font"),
          fontId,
        },
        ...currentState.fonts,
      ],
    }));
  };

  const removeColor = (id: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      colors: currentState.colors.filter((color) => color.id !== id),
    }));
  };

  const removeFont = (id: string) => {
    onChangeLiveState((currentState) => ({
      ...currentState,
      fonts: currentState.fonts.filter((font) => font.id !== id),
    }));
  };

  const activeEntries =
    config.mode === "colors" ? liveState.colors : liveState.fonts;

  return (
    <>
      {!config.title && !config.description && activeEntries.length === 0 ? (
        <p className="text-(--gray-page)">Advanced input (no value)</p>
      ) : (
        <>
          <p className="@[40rem]:text-xl text-lg font-medium">{config.title}</p>
          <p className="text-(--gray-page)">{config.description}</p>

          <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
            <button
              className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max"
              onClick={() => setAdding((prev) => !prev)}
            >
              {config.mode === "colors" ? "New color" : "New font"}
              <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
            </button>

            {adding && config.mode === "colors" && (
              <>
                <input
                  type="text"
                  placeholder="Color name or hex code..."
                  className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                  value={colorInput}
                  maxLength={MAX_OPTION_LABEL_LENGTH}
                  onChange={(event) => setColorInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addColor();
                    }
                  }}
                />
                <Select
                  value={colorType}
                  onValueChange={(value) =>
                    setColorType(value as AdvancedInputColorType)
                  }
                >
                  <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                    <SelectGroup className="bg-(--dim)">
                      {ADVANCED_INPUT_COLOR_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light)"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <button
                  className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                  onClick={addColor}
                >
                  Add color
                </button>
              </>
            )}

            {adding && config.mode === "fonts" && (
              <>
                <Select value={fontId} onValueChange={setFontId}>
                  <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                    <SelectGroup className="bg-(--dim)">
                      {ADVANCED_INPUT_FONTS.map((font) => (
                        <SelectItem
                          key={font.id}
                          value={font.id}
                          disabled={selectedFontIds.has(font.id)}
                          className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light)"
                        >
                          <span style={{ fontFamily: font.family }}>
                            {font.name} - {font.type} - {font.feeling}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <button
                  className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                  onClick={addFont}
                  disabled={selectedFontIds.has(fontId)}
                >
                  Add font
                </button>
              </>
            )}
          </div>

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
                    <span className="min-w-0 wrap-break-word">
                      {color.name}
                    </span>
                    <span className="text-(--gray-page)">{color.type}</span>
                    <button
                      className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--darkest) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                      onClick={() => removeColor(color.id)}
                    >
                      <Trash size={14} />
                      Remove
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
                      className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--darkest) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                      onClick={() => removeFont(fontEntry.id)}
                    >
                      <Trash size={14} />
                      Remove
                    </button>
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-(--gray-page)">No fonts yet.</span>
            )}
          </div>
        </>
      )}
    </>
  );
};
