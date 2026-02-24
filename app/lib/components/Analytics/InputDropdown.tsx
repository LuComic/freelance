"use client";

import type { dropdownItemType } from "@/app/(project_view)/projects/project_1/analytics/page";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export const InputDropdown = ({
  item,
  index,
}: {
  item: dropdownItemType;
  index: number;
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
    >
      <button
        type="button"
        className={`flex font-medium md:text-lg text-base items-center justify-start gap-2`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${isOpen ? "rotate-90" : "rotate-0"}`}
        />
        {item.page}
      </button>
      {isOpen ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          {item.components.map((comp, compIndex) => (
            <div
              key={`${comp.title}-${compIndex}`}
              className="w-full flex flex-col gap-2"
            >
              <p className="text-(--gray-page)">{comp.title}</p>
              <div className="flex flex-col gap-2">
                {comp.value.map((value, valueIndex) => (
                  <div
                    key={`${value}-${valueIndex}`}
                    className="w-full rounded-md border border-(--gray) px-2 py-1"
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
