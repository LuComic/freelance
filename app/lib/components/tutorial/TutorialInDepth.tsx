"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const screenshots = [
  {
    src: "/tutorial/analytics-view.png",
    alt: "Analytics view tutorial screenshot",
    title: "Analytics",
  },
  {
    src: "/tutorial/input-view.png",
    alt: "Input page tutorial screenshot",
    title: "Page for collecting different ideas",
  },
  {
    src: "/tutorial/edit-view.png",
    alt: "Edit view tutorial screenshot",
    title: "Editing/creating a page with Dropdowns, Kanban and Calendar",
  },
  {
    src: "/tutorial/chat-view.png",
    alt: "Chat view tutorial screenshot",
    title: "Each project even has a chat for communication",
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
            Other images show a more advanced pages, client&apos;s view and the
            workflow.
          </p>
          <div className="flex flex-col gap-2">
            {screenshots.map((screenshot) => (
              <div key={screenshot.src} className="flex flex-col gap-1">
                <p className="font-medium">{screenshot.title}</p>
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={3248}
                  height={2120}
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
