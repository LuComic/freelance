"use client";

import { useState } from "react";

export const Prologue = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <p className="md:text-3xl text-xl font-medium">Components</p>
      <p className="text-(--gray-page) text-lg border-y border-(--gray) py-2">
        In Pageboard, pages are created using components. You can insert them
        with either &quot;/&quot;
        {showMore
          ? "or picking the component from the right sidebar. Components are the backbone of the project, allowing you to get client's preferences, input, feedback and more."
          : "..."}
        <button
          className="inline border-none p-0 text-(--vibrant) ml-1.5 hover:text-(--vibrant-hover)"
          onClick={() => setShowMore((prev) => !prev)}
        >
          {showMore ? "show less" : "show more"}
        </button>
      </p>
    </>
  );
};
