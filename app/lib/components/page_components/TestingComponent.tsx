"use client";

import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

type TestingComponentProps = {
  instanceId?: string;
  mockText?: string;
};

export function TestingComponent({
  instanceId,
  mockText = "TestingComponent mock data",
}: TestingComponentProps) {
  const pageDocument = useOptionalPageDocument();
  const component =
    instanceId && pageDocument
      ? pageDocument.document?.components[instanceId]
      : null;
  const text =
    component?.type === "TestingComponent"
      ? component.config.mockText
      : mockText;

  const [filter, setFilter] = useState("day");
  const [adding, setAdding] = useState(false);

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="@[40rem]:text-xl text-lg font-medium">Calendar</p>
      <p className="text-(--gray-page)">
        A calendar for scheduling different dates for clients and creators
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setAdding((prev) => !prev)}
        >
          Schedule
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding && (
          <>
            <input
              type="text"
              placeholder="I'd like this feature added..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
            />

            <p>Pick the date(s)</p>
            <DatePicker />

            <button className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover) ">
              Submit
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "day" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setFilter("day")}
        >
          1 Day
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "week" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setFilter("week")}
        >
          7 Week
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "month" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setFilter("month")}
        >
          30 Month
        </button>
      </div>

      <div
        className={`w-max h-full min-w-[900px] min-h-40 max-w-full overflow-x-auto border rounded-md border-(--gray) grid ${
          filter === "day"
            ? "grid-cols-1 grid-rows-1"
            : filter === "week"
              ? "grid-cols-7 grid-rows-1"
              : "grid-cols-7 grid-rows-4 grid-flow-row"
        }`}
      >
        {filter === "day" ? (
          <div key="day" className="w-full h-full"></div>
        ) : filter === "week" ? (
          <>
            {[...Array(7)].map((day) => (
              <div
                key={day + Math.random().toString()}
                className="not-last:border-r border-(--gray) w-full h-full aspect-square"
              ></div>
            ))}
          </>
        ) : (
          filter === "month" && (
            <>
              {[...Array(28)].map((day) => (
                <div
                  key={day + Math.random().toString()}
                  className={`w-full min-h-40 aspect-square ${
                    day % 7 !== 6 ? "border-r border-(--gray)" : ""
                  } ${day < 21 ? "border-b border-(--gray)" : ""}`}
                ></div>
              ))}
            </>
          )
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "day" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
        >
          Back
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "month" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
