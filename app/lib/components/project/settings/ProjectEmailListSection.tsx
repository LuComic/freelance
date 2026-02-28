"use client";

import { ChevronRight, Trash } from "lucide-react";
import { useState } from "react";

type ProjectEmailListSectionProps = {
  title: string;
  currentLabel: string;
  manageLabel: string;
  placeholder: string;
  initialValues: string[];
  shaded?: boolean;
};

export function ProjectEmailListSection({
  title,
  currentLabel,
  manageLabel,
  placeholder,
  initialValues,
  shaded = false,
}: ProjectEmailListSectionProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [draft, setDraft] = useState("");

  return (
    <div className={`${shaded ? "bg-(--gray)/10 " : ""}w-full p-2 flex flex-col gap-2`}>
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
        <div className="pl-7 flex flex-col gap-2 pb-2">
          <p className="text-(--gray-page)">{currentLabel}</p>
          <div className="flex items-center justify-start gap-2 w-full flex-wrap">
            {values.map((value) => (
              <div
                key={value}
                className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
              >
                {value}
                <button
                  type="button"
                  className="hover:bg-(--gray)/20 p-1 rounded-sm"
                  onClick={() =>
                    setValues((prev) => prev.filter((entry) => entry !== value))
                  }
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>

          <p className="text-(--gray-page)">{manageLabel}</p>
          <input
            type="text"
            placeholder={placeholder}
            className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const nextValue = draft.trim();
                if (!nextValue) return;
                setValues((prev) => [nextValue, ...prev]);
                setDraft("");
              }
            }}
          />
          <button
            type="button"
            className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
            onClick={() => {
              const nextValue = draft.trim();
              if (!nextValue) return;
              setValues((prev) => [nextValue, ...prev]);
              setDraft("");
            }}
          >
            Add
          </button>
        </div>
      ) : null}
    </div>
  );
}
