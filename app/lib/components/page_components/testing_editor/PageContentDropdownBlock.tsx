"use client";

import { ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

export function PageContentDropdownBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full p-2 flex flex-col gap-2 bg-(--gray)/10 my-1">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        {title}
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">{children}</div>
      ) : null}
    </div>
  );
}
