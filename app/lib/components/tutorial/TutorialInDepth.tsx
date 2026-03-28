"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const screenshots = [
  {
    src: "/tutorial/analytics-tutorial.png",
    alt: "Analytics view tutorial screenshot",
    title: "Analytics",
  },
  {
    src: "/tutorial/ideas.png",
    alt: "Ideas board tutorial screenshot",
    title: "Page for collecting different ideas from clients and creators",
  },
  {
    src: "/tutorial/pref-live.png",
    alt: "Preference page tutorial screenshot",
    title: "From just a Select and a Radio to a Dropdown and client input page",
  },
  {
    src: "/tutorial/progress-edit.png",
    alt: "Progress edit tutorial screenshot",
    title: "Editing/creating a page with Dropdowns, Kanban and Calendar",
  },
] as const;

export const TutorialInDepth = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full p-2 flex flex-col gap-2">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        In-depth
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-3 pb-2">
          <p className="text-(--gray-page)">
            Analytics page of the same project - freelancer can quickly and
            easily see the changes the client made.
            <br />
            Other images show a more advanced version of the same project,
            client&apos;s view and the workflow.
          </p>
          <div className="flex flex-col gap-2">
            {screenshots.map((screenshot) => (
              <div key={screenshot.src} className="flex flex-col gap-1">
                <p className="font-medium">{screenshot.title}</p>
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  className="w-full rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
