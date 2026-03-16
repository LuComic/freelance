"use client";

import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Pencil,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DatePicker } from "./DatePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { TestingCompEditModal } from "./TestingCompEditModal";

type TestingComponentProps = {
  instanceId?: string;
  mockText?: string;
};

const CONSTANT_COLOR_SELECTION = [
  "none",
  "red",
  "green",
  "yellow",
  "pink",
  "purple",
  "cyan",
];

const DAY_HOURS = [
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
];

export function TestingComponent() {
  const [filter, setFilter] = useState("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);
  const dayContainerRef = useRef<HTMLDivElement | null>(null);
  const hourRowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    const intervalId = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (filter !== "day") return;

    const updateCurrentTimeOffset = () => {
      const container = dayContainerRef.current;

      if (!container || hourRowRefs.current.length === 0) {
        setCurrentTimeOffset(0);
        return;
      }

      const [hours, minutes] = currentTime.split(":");
      const hourIndex = Number(hours);
      const minuteValue = Number(minutes);
      const previousHoursHeight = hourRowRefs.current
        .slice(0, hourIndex)
        .reduce((sum, row) => sum + (row?.offsetHeight ?? 0), 0);
      const currentHourHeight =
        hourRowRefs.current[hourIndex]?.offsetHeight ?? 0;

      setCurrentTimeOffset(
        previousHoursHeight + (currentHourHeight * minuteValue) / 60,
      );
    };

    updateCurrentTimeOffset();

    const resizeObserver = new ResizeObserver(updateCurrentTimeOffset);
    if (dayContainerRef.current) {
      resizeObserver.observe(dayContainerRef.current);
    }

    hourRowRefs.current.forEach((row) => {
      if (row) resizeObserver.observe(row);
    });

    window.addEventListener("resize", updateCurrentTimeOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCurrentTimeOffset);
    };
  }, [currentTime, filter]);

  const getTimePercent = () => {
    const [hours, minutes] = currentTime.split(":");
    const currentTimeNumber = Number(hours) * 60 + Number(minutes);
    const MINUTES_IN_DAY = 1440;
    return Math.round((currentTimeNumber / MINUTES_IN_DAY) * 100);
  };

  const toggleFilter = (filt: string) => {
    setFilter(filt);
    setSelectedDay(null);
  };

  useEffect(() => {
    if (selectedDay) {
      setFilter("");
    }
  }, [selectedDay]);

  return (
    <div className="w-full flex flex-col gap-2">
      <TestingCompEditModal
        date={editingDay ?? 1}
        open={editingDay !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDay(null);
          }
        }}
      />

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
              placeholder="Creating the MVP..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
            />

            <div className="flex flex-col gap-1">
              <p className="font-medium">Pick the date(s)</p>
              <DatePicker />
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-medium">Color</p>
              <Select>
                <SelectTrigger className="w-full @[40rem]:w-52 bg-(--darkest) border-(--gray-page)">
                  <SelectValue placeholder="Set the status" />
                </SelectTrigger>
                <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
                  <SelectGroup className="bg-(--darkest)">
                    {CONSTANT_COLOR_SELECTION.map((color) => (
                      <SelectItem
                        key={color}
                        value={color}
                        className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
                      >
                        {color !== "none" ? (
                          <div
                            className="h-auto aspect-square w-4 rounded-full"
                            style={{ backgroundColor: "var(--" + color + ")" }}
                          ></div>
                        ) : null}
                        {color}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <button className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover) ">
              Submit
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "day" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => toggleFilter("day")}
        >
          Today
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "week" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => toggleFilter("week")}
        >
          7 Week
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${filter !== "month" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => toggleFilter("month")}
        >
          30 Month
        </button>
      </div>

      {selectedDay ? (
        <p className="@[40rem]:text-xl text-lg font-medium">
          {/* This would show the selected day, together with the month's name*/}
          {selectedDay.toString()}. March
        </p>
      ) : filter === "day" ? (
        <p className="@[40rem]:text-xl text-lg font-medium">
          {/* This would show which day of the month it is, together with the month's name*/}
          Today, 15. March
        </p>
      ) : null}

      <div
        className={`h-full ${filter !== "day" ? "min-w-[900px] w-max" : "w-full"} min-h-40 max-w-full overflow-x-auto border rounded-md border-(--gray) grid ${
          filter === "day" || filter === ""
            ? "grid-cols-1 grid-rows-1"
            : filter === "week"
              ? "grid-cols-7 grid-rows-1"
              : "grid-cols-7 grid-rows-4 grid-flow-row"
        }`}
      >
        {filter === "day" || filter === "" ? (
          <div
            ref={dayContainerRef}
            key="day"
            className="w-full h-full flex flex-col relative"
          >
            <div
              className="absolute left-0 w-full h-px bg-(--vibrant) text-(--vibrant) flex items-end justify-end"
              style={{
                top:
                  currentTimeOffset > 0
                    ? `${currentTimeOffset}px`
                    : `${getTimePercent()}%`,
              }}
            >
              <span
                className={`p-1 bg-(--darkest) rounded-sm absolute ${Number(currentTime.split(":")[0]) < 1 ? "top-1" : "-top-9"}`}
              >
                {currentTime}
              </span>
            </div>
            {DAY_HOURS.map((time, i) => (
              <div
                key={time}
                ref={(element) => {
                  hourRowRefs.current[i] = element;
                }}
                className="w-full not-last:border-b border-(--gray) px-3 flex items-center justify-start"
              >
                <span className="h-full text-(--gray-page) text-sm text-left min-w-14 w-14 border-r pr-3 py-2 border-(--gray)">
                  {time}
                </span>
                <div className="p-2">
                  {i === 10 ? (
                    <div className="w-full rounded-sm border border-(--gray) bg-(--gray)/10 flex flex-col gap-1 py-1 px-2">
                      <p className="font-medium text-sm text-left">
                        <span className="text-(--gray-page) mr-2">10:30 -</span>
                        Do something like that
                      </p>
                      <p className="text-left text-sm text-(--gray-page)">
                        Lorem ipsum dolor sit, amet consectetur adipisicing
                        elit. Animi vero aliquid odio dolores nihil illum
                        repellendus ea necessitatibus suscipit, recusandae nisi
                        debitis alias sequi assumenda accusamus illo consequatur
                        ad modi officiis ducimus dolorem minus commodi
                        laudantium! Vel magni facilis numquam, nulla cumque iure
                        porro qui assumenda voluptatum? Beatae iure numquam
                        dolorem fuga non architecto consequuntur voluptates
                        incidunt adipisci facere itaque minus ex, magni
                        dignissimos expedita, a cupiditate cum distinctio velit
                        similique neque quas sapiente. Mollitia neque
                        praesentium ipsum fugiat, soluta iusto veritatis
                        perspiciatis dignissimos, pariatur hic quod aliquam rem
                        quos nam velit asperiores ab nostrum id. Quod ad hic
                        unde a nemo animi facere nisi culpa sint, eveniet enim
                        odit, molestias provident delectus. Vero hic
                        exercitationem suscipit soluta dignissimos officia! Ut
                        repellat architecto suscipit quia iure beatae quam
                        voluptas vitae esse itaque mollitia ad ducimus atque
                        iste quisquam aut ullam dolorum deserunt vero, sed
                        eveniet labore quas officiis laborum. Maxime sequi
                        veritatis consequatur dolor nesciunt exercitationem,
                        minima cumque. Eos, necessitatibus accusantium! Minima
                        doloremque voluptatem nemo! Repudiandae ullam sed non
                        maiores consectetur quam, obcaecati doloremque, corrupti
                        repellat ex recusandae voluptatibus dignissimos
                        molestias adipisci quidem consequatur. Minima ullam sed
                        autem inventore maxime, est aliquam corporis. Veniam
                        pariatur facilis placeat esse vitae nesciunt.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : filter === "week" ? (
          <>
            {[...Array(7)].map((_, i) => (
              <button
                key={`week-day-${i}`}
                className="not-last:border-r border-(--gray) w-full h-full aspect-square p-2 flex flex-col gap-1 hover:bg-(--gray)/5"
                onClick={() => setSelectedDay(i + 1)}
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
              </button>
            ))}
          </>
        ) : (
          filter === "month" && (
            <>
              {[...Array(28)].map((_, i) => (
                <div
                  key={`month-day-${i}`}
                  className={`w-full min-h-40 aspect-square ${i === 22 ? "pr-0" : i === 23 ? "pl-0" : i === 13 ? "pr-0" : i === 14 && "pl-0"} p-2 flex flex-col gap-1 ${
                    i % 7 !== 6 ? "border-r border-(--gray)" : ""
                  } ${i < 21 ? "border-b border-(--gray)" : ""} hover:bg-(--gray)/5`}
                >
                  <span
                    className={`rounded-lg  p-[0.5px] aspect-square text-left w-max flex items-center justify-center ${i == 3 ? "bg-(--vibrant)/20" : "bg-(--gray)/10 text-(--gray-page)"} `}
                  >
                    {i + 1}
                  </span>
                  {[2, 5, 10, 13, 14, 18, 22, 23, 27].includes(i) && (
                    <div
                      className={`w-full max-h-full h-full overflow-y-auto ${i === 22 ? "rounded-r-none" : i === 23 ? "rounded-l-none" : i === 13 ? "rounded-r-none" : i === 14 && "rounded-l-none"} rounded-sm ${i === 22 ? "border-r-0" : i === 23 ? "border-l-0" : i === 13 ? "border-r-0" : i === 14 && "border-l-0"} border ${i === 5 ? "border-(--cyan) bg-(--cyan-bg)/10" : i === 13 ? "border-(--red) bg-(--red-bg)/10" : i === 14 ? "border-(--red) bg-(--red-bg)/10" : i === 27 ? "border-(--purple) bg-(--purple-bg)/10" : "border-(--gray) bg-(--gray)/10"}  flex flex-col gap-1 py-1 px-2`}
                    >
                      <div className="flex items-center justify-start gap-2">
                        <Menubar className="ml-auto h-auto bg-transparent border-none shadow-none p-0">
                          <MenubarMenu>
                            <MenubarTrigger className="data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) p-0">
                              <EllipsisVertical size={15} />
                            </MenubarTrigger>
                            <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                              <MenubarGroup>
                                <MenubarItem
                                  className="hover:bg-(--darkest-hover)! hover:text-(--light)!"
                                  onSelect={() => setEditingDay(i + 1)}
                                >
                                  <div className="flex items-center justify-start gap-2 w-full">
                                    <Pencil />
                                    Edit
                                  </div>
                                </MenubarItem>
                                <MenubarItem
                                  asChild
                                  className="hover:bg-(--declined-bg)/5! hover:text-(--declined-border)! text-(--declined-border)"
                                >
                                  <button className="flex items-center justify-start gap-2 w-full">
                                    <Trash color="var(--declined-border)" />
                                    Delete
                                  </button>
                                </MenubarItem>
                              </MenubarGroup>
                            </MenubarContent>
                          </MenubarMenu>
                        </Menubar>
                        <p className="font-medium text-sm text-left">
                          Do something like that
                        </p>
                      </div>
                      <button
                        className="text-left text-sm text-(--gray-page)"
                        onClick={() => setSelectedDay(i + 1)}
                      >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Similique modi pariatur quae tempora vitae officiis ut
                        error mollitia aperiam hic.
                      </button>
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
