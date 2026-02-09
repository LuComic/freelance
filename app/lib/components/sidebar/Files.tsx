"use client";

import { FileItem } from "./FileItem";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SOME_DATA: { id: string; title: string; items: string[] }[] = [
  {
    id: "getting_started",
    title: "Getting Started",
    items: ["Creating a project - Creator", "Joining a project - Client"],
  },
  {
    id: "project_1",
    title: "Project 1",
    items: ["Preferences"],
  },
];

export const Files = () => {
  const pathname = usePathname();
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    // If there is no path or we're on the root, show default "Projects"
    if (!pathname || pathname === "/") {
      setCurrentName("");
      return;
    }

    // Take the first non-empty segment from the path (e.g. "/project_1/xyz" -> "project_1")
    // filter(Boolean) takes only valid url parts
    const firstSegment = pathname.split("/").filter(Boolean)[0];

    const matched = SOME_DATA.find((item) => item.id === firstSegment);

    if (matched) {
      setCurrentName(matched.title);
    } else {
      setCurrentName("");
    }
  }, [pathname]);

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">
        {currentName || "Projects"}
      </p>
      {SOME_DATA.map((item) => (
        <FileItem
          key={item.id}
          title={item.title}
          items={item.items}
          id={item.id}
        />
      ))}
    </div>
  );
};
