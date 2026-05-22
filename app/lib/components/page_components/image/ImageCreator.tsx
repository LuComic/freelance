"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { PageComponentInstanceByType } from "@/lib/pageDocument";

type ImageConfig = PageComponentInstanceByType<"Image">["config"];

type Props = {
  config: ImageConfig;
  onChangeConfig: (updater: (config: ImageConfig) => ImageConfig) => void;
};

const parseDimension = (value: string) => {
  if (value.trim() === "") return null;

  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(2400, Math.max(1, Math.floor(number)))
    : null;
};

export const ImageCreator = ({ config, onChangeConfig }: Props) => {
  const [configuring, setConfiguring] = useState(false);

  return (
    <>
      <p className="text-lg font-medium">Image</p>
      <p className="text-(--gray-page)">Configure the uploaded image.</p>

      <div className="border-(--gray) border-b py-2 w-full flex flex-col gap-2">
        <button
          className="text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setConfiguring((prev) => !prev)}
        >
          Configure image
          <ChevronRight size={18} className={`${configuring && "rotate-90"}`} />
        </button>

        {configuring && (
          <>
            <p className="text-(--gray-page)">Width, height</p>
            <div className="flex items-center justify-between w-full gap-2">
              <input
                type="number"
                min={1}
                max={2400}
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
                value={config.widthPx ?? ""}
                onChange={(event) =>
                  onChangeConfig((current) => ({
                    ...current,
                    widthPx: parseDimension(event.target.value),
                  }))
                }
                placeholder="Width"
              />
              <input
                type="number"
                min={1}
                max={2400}
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
                value={config.heightPx ?? ""}
                onChange={(event) =>
                  onChangeConfig((current) => ({
                    ...current,
                    heightPx: parseDimension(event.target.value),
                  }))
                }
                placeholder="Height (auto)"
              />
            </div>

            <input
              type="text"
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              value={config.altText}
              maxLength={300}
              onChange={(event) =>
                onChangeConfig((current) => ({
                  ...current,
                  altText: event.target.value.slice(0, 300),
                }))
              }
              placeholder="Image alt text"
            />

            <button
              type="button"
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={() =>
                onChangeConfig((current) => ({ ...current, heightPx: null }))
              }
            >
              Adjust height
            </button>
          </>
        )}
      </div>
    </>
  );
};
