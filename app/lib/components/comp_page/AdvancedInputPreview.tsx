"use client";

import { ChevronRight, Trash } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveAdvancedInputColor } from "@/app/lib/components/page_components/advanced_input/colors";

type ColorType = "primary" | "secondary" | "accent" | "other";

const COLOR_TYPES: ColorType[] = ["primary", "secondary", "accent", "other"];
const FONT_OPTIONS = ["Inter", "Playfair Display", "Space Grotesk"];

export const AdvancedInputPreview = () => {
  const [addingColor, setAddingColor] = useState(false);
  const [addingFont, setAddingFont] = useState(false);
  const [colors, setColors] = useState<
    Array<{ name: string; type: ColorType }>
  >([]);
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState<ColorType>("other");
  const [fonts, setFonts] = useState<string[]>([]);
  const [fontName, setFontName] = useState(FONT_OPTIONS[0]);

  const addColor = () => {
    const nextColor = colorName.trim();

    if (!nextColor || colors.length >= 3) return;

    setColors((currentColors) => [
      { name: nextColor, type: colorType },
      ...currentColors,
    ]);
    setColorName("");
    setColorType("other");
  };

  const addFont = () => {
    if (fonts.length >= 3 || fonts.includes(fontName)) return;

    setFonts((currentFonts) => [fontName, ...currentFonts]);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col gap-2">
        <p className="@[40rem]:text-xl text-lg font-medium">
          Advanced - colors
        </p>

        <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
          <button
            type="button"
            className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max text-left"
            onClick={() => setAddingColor((current) => !current)}
          >
            New color
            <ChevronRight
              size={18}
              className={`${addingColor && "rotate-90"}`}
            />
          </button>

          {addingColor ? (
            <>
              <input
                type="text"
                placeholder="Color name or hex code..."
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                value={colorName}
                onChange={(event) => setColorName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    addColor();
                  }
                }}
              />

              <Select
                value={colorType}
                onValueChange={(value) => setColorType(value as ColorType)}
              >
                <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                  <SelectGroup className="bg-(--dim)">
                    {COLOR_TYPES.map((type) => (
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
                type="button"
                className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                disabled={colors.length >= 3}
                onClick={addColor}
              >
                Add color
              </button>
            </>
          ) : null}
        </div>

        <div className="w-full flex flex-col gap-2">
          {colors.length > 0 ? (
            colors.map((color, index) => (
              <div
                key={`${color.name}-${index}`}
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
                  type="button"
                  className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--darkest) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                  onClick={() =>
                    setColors((currentColors) =>
                      currentColors.filter(
                        (_, colorIndex) => colorIndex !== index,
                      ),
                    )
                  }
                >
                  <Trash size={14} />
                  Remove
                </button>
              </div>
            ))
          ) : (
            <span className="text-(--gray-page)">No colors yet.</span>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <p className="@[40rem]:text-xl text-lg font-medium">Advanced - fonts</p>

        <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
          <button
            type="button"
            className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-max text-left"
            onClick={() => setAddingFont((current) => !current)}
          >
            New font
            <ChevronRight
              size={18}
              className={`${addingFont && "rotate-90"}`}
            />
          </button>

          {addingFont ? (
            <>
              <Select value={fontName} onValueChange={setFontName}>
                <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                  <SelectGroup className="bg-(--dim)">
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem
                        key={font}
                        value={font}
                        disabled={fonts.includes(font)}
                        className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light)"
                      >
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <button
                type="button"
                className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                disabled={fonts.length >= 3 || fonts.includes(fontName)}
                onClick={addFont}
              >
                Add font
              </button>
            </>
          ) : null}
        </div>

        <div className="w-full flex flex-col gap-2">
          {fonts.length > 0 ? (
            fonts.map((font, index) => (
              <div
                key={font}
                className={`w-full min-w-0 flex items-center border-(--gray) border-dashed justify-between gap-2 flex-wrap ${index !== 0 ? "border-t pt-2" : null}`}
              >
                <span
                  className="min-w-0 wrap-break-word"
                  style={{ fontFamily: font }}
                >
                  {font}
                </span>
                <button
                  type="button"
                  className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--darkest) border-(--gray) border px-2 gap-1 text-sm ml-auto"
                  onClick={() =>
                    setFonts((currentFonts) =>
                      currentFonts.filter(
                        (currentFont) => currentFont !== font,
                      ),
                    )
                  }
                >
                  <Trash size={14} />
                  Remove
                </button>
              </div>
            ))
          ) : (
            <span className="text-(--gray-page)">No fonts yet.</span>
          )}
        </div>
      </div>
    </div>
  );
};
