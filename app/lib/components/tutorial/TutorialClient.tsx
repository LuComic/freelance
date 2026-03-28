"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

export const TutorialClient = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full p-2 flex flex-col gap-2 bg-(--gray)/10">
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${open ? "rotate-90" : "rotate-0"}`}
        />
        Client
      </button>

      {open ? (
        <div className="pl-7 flex flex-col gap-3 pb-2">
          <p className="text-(--gray-page)">
            Shows the same project from the client&apos;s side, filling in the
            inputs and interacting with the page that the freelancer prepared.
          </p>
          <video
            controls
            preload="metadata"
            className="w-full max-w-4xl rounded-md border border-(--gray) bg-(--darkest)"
          >
            <source src="/tutorial/client-pov.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : null}
    </div>
  );
};
