"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

export const TutorialCreator = () => {
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
        Freelancer/creator
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-3 pb-2">
          <p className="text-(--gray-page)">
            Creates a project, adds a Select and a Radio component, and
            configures them to collect the client&apos;s website preferences.
          </p>
          <video
            controls
            preload="metadata"
            className="w-full max-w-4xl rounded-md border border-(--gray) bg-(--darkest)"
          >
            <source src="/tutorial/creator-pov.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : null}
    </div>
  );
};
