"use client";

import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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
  const currentTime = "14:20";

  const getTimePercent = () => {
    const [hours, minutes] = currentTime.split(":");
    const currentTimeNumber = Number(hours) * 60 + Number(minutes);
    const MINUTES_IN_DAY = 1440;
    return Math.round((currentTimeNumber / MINUTES_IN_DAY) * 100);
  };

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
        className={`h-full ${filter !== "day" ? "min-w-[900px] w-max" : "w-full"} min-h-40 max-w-full overflow-x-auto border rounded-md border-(--gray) grid ${
          filter === "day"
            ? "grid-cols-1 grid-rows-1"
            : filter === "week"
              ? "grid-cols-7 grid-rows-1"
              : "grid-cols-7 grid-rows-4 grid-flow-row"
        }`}
      >
        {filter === "day" ? (
          <div key="day" className="w-full h-full flex flex-col relative">
            <div
              className="absolute left-0 w-full h-px bg-(--vibrant) text-(--vibrant) flex items-end justify-end"
              style={{ top: `${getTimePercent()}%` }}
            >
              <span
                className={`p-1 bg-(--darkest) rounded-sm absolute ${Number(currentTime.split(":")[0]) < 1 ? "top-1" : "-top-9"}`}
              >
                {currentTime}
              </span>
            </div>
            {[
              "00:00",
              "01:00",
              "02:00",
              "03:00",
              "04:00",
              "05:00",
              "06:00",
              "07:00",
              "08:00",
              "09:00",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
              "19:00",
              "20:00",
              "21:00",
              "22:00",
              "23:00",
            ].map((time, i) => (
              <div
                key={time}
                className="w-full not-last:border-b border-(--gray) px-3 flex items-center justify-start"
              >
                <span className="text-(--gray-page) text-sm text-left w-14 border-r pr-3 py-2 border-(--gray)">
                  {time}
                </span>
              </div>
            ))}
          </div>
        ) : filter === "week" ? (
          <>
            {[...Array(7)].map((day, i) => (
              <div
                key={day + Math.random().toString()}
                className="not-last:border-r border-(--gray) w-full h-full aspect-square p-2 flex flex-col gap-1"
              >
                <span
                  className={`rounded-lg  p-[0.5px] aspect-square text-left w-max flex items-center justify-center ${i == 3 ? "bg-(--vibrant)/20" : "bg-(--gray)/10 text-(--gray-page)"} `}
                >
                  {i + 1}
                </span>
                {[2, 5].includes(i) && (
                  <div className="w-full max-h-full h-full overflow-y-auto rounded-sm border border-(--gray) bg-(--gray)/10 flex flex-col gap-1 py-1 px-2">
                    <p className="font-medium text-sm text-left">
                      Do something like that
                    </p>
                    <p className="text-left text-sm text-(--gray-page)">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Similique modi pariatur quae tempora vitae officiis ut
                      error mollitia aperiam hic.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          filter === "month" && (
            <>
              {[...Array(28)].map((day, i) => (
                <div
                  key={day + Math.random().toString()}
                  className={`w-full min-h-40 aspect-square ${i === 22 ? "pr-0" : i === 23 ? "pl-0" : i === 13 ? "pr-0" : i === 14 && "pl-0"} p-2 flex flex-col gap-1 ${
                    day % 7 !== 6 ? "border-r border-(--gray)" : ""
                  } ${i < 21 ? "border-b border-(--gray)" : ""}`}
                >
                  <span
                    className={`rounded-lg  p-[0.5px] aspect-square text-left w-max flex items-center justify-center ${i == 3 ? "bg-(--vibrant)/20" : "bg-(--gray)/10 text-(--gray-page)"} `}
                  >
                    {i + 1}
                  </span>
                  {[2, 5, 10, 13, 14, 18, 22, 23, 28].includes(i) && (
                    <div
                      className={`w-full max-h-full h-full overflow-y-auto ${i === 22 ? "rounded-r-none" : i === 23 ? "rounded-l-none" : i === 13 ? "rounded-r-none" : i === 14 && "rounded-l-none"} rounded-sm ${i === 22 ? "border-r-0" : i === 23 ? "border-l-0" : i === 13 ? "border-r-0" : i === 14 && "border-l-0"} border border-(--gray) bg-(--gray)/10 flex flex-col gap-1 py-1 px-2`}
                    >
                      <p className="font-medium text-sm text-left">
                        Do something like that
                      </p>
                      <p className="text-left text-sm text-(--gray-page)">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Similique modi pariatur quae tempora vitae officiis ut
                        error mollitia aperiam hic.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md pl-1 pr-2 py-1 border ${filter !== "day" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md pr-1 pl-2 py-1 border ${filter !== "month" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
