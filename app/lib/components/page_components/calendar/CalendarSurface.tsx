"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isToday,
} from "date-fns";
import { useEffect, useRef, useState } from "react";
import type { CalendarEvent } from "@/lib/pageDocument";
import {
  DAY_HOURS,
  WEEKDAYS,
  formatEventTimeRange,
  getDayViewHeading,
  getEventColorClasses,
  getEventsForDate,
  getMonthRows,
  getRowEventSegments,
  getTimelineEventsForDate,
  getWeekRow,
  isVisibleToday,
  sortCalendarEvents,
} from "./calendarUtils";
import { CalendarEventMenu } from "./CalendarEventMenu";
import { CalendarMonthLikeEvent } from "./CalendarMonthLikeEvent";

type CalendarSurfaceProps = {
  events: CalendarEvent[];
  canEdit?: boolean;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void | Promise<void>;
};

type CalendarViewMode = "day" | "week" | "month";

function getOffsetForMinutes(minutes: number, hourOffsets: number[]) {
  const boundedMinutes = Math.max(0, Math.min(24 * 60 - 1, minutes));
  const hourIndex = Math.min(23, Math.floor(boundedMinutes / 60));
  const nextOffset =
    hourOffsets[hourIndex + 1] ??
    hourOffsets[hourIndex] ??
    hourOffsets[hourOffsets.length - 1] ??
    0;
  const currentOffset = hourOffsets[hourIndex] ?? 0;
  const rowHeight = Math.max(0, nextOffset - currentOffset);
  const minuteOffset = boundedMinutes - hourIndex * 60;

  return currentOffset + (rowHeight * minuteOffset) / 60;
}

function getMonthCellBorderClass(
  rowIndex: number,
  cellIndex: number,
  rowCount: number,
) {
  return `${cellIndex !== 6 ? "border-r border-(--gray)" : ""} ${
    rowIndex < rowCount - 1 ? "border-b border-(--gray)" : ""
  }`.trim();
}

export const CalendarSurface = ({
  events,
  canEdit = false,
  onEditEvent,
  onDeleteEvent,
}: CalendarSurfaceProps) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [hourOffsets, setHourOffsets] = useState<number[]>([0]);
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);
  const [eventColumnLeft, setEventColumnLeft] = useState(0);
  const dayContainerRef = useRef<HTMLDivElement | null>(null);
  const eventColumnRef = useRef<HTMLDivElement | null>(null);
  const hourRowRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (viewMode !== "day") {
      return;
    }

    const updateLayoutMetrics = () => {
      const nextHourOffsets = [0];
      let runningHeight = 0;

      for (const row of hourRowRefs.current) {
        runningHeight += row?.offsetHeight ?? 0;
        nextHourOffsets.push(runningHeight);
      }

      setHourOffsets(nextHourOffsets);
      setEventColumnLeft(eventColumnRef.current?.offsetLeft ?? 0);

      if (isVisibleToday(anchorDate)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        setCurrentTimeOffset(
          getOffsetForMinutes(currentMinutes, nextHourOffsets),
        );
      } else {
        setCurrentTimeOffset(0);
      }
    };

    updateLayoutMetrics();

    const resizeObserver = new ResizeObserver(updateLayoutMetrics);

    if (dayContainerRef.current) {
      resizeObserver.observe(dayContainerRef.current);
    }

    if (eventColumnRef.current) {
      resizeObserver.observe(eventColumnRef.current);
    }

    for (const row of hourRowRefs.current) {
      if (row) {
        resizeObserver.observe(row);
      }
    }

    window.addEventListener("resize", updateLayoutMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayoutMetrics);
    };
  }, [anchorDate, now, viewMode]);

  const sortedEvents = sortCalendarEvents(events);
  const monthRows = getMonthRows(anchorDate);
  const weekRow = getWeekRow(anchorDate);
  const weekEventSegments = getRowEventSegments(sortedEvents, weekRow);
  const dayEvents = getTimelineEventsForDate(sortedEvents, anchorDate);
  const laneEnds: number[] = [];
  const positionedDayEvents = dayEvents.map(({ event, position }) => {
    let laneIndex = laneEnds.findIndex(
      (laneEnd) => laneEnd <= position.startMinutes,
    );

    if (laneIndex === -1) {
      laneIndex = laneEnds.length;
      laneEnds.push(position.endMinutes);
    } else {
      laneEnds[laneIndex] = position.endMinutes;
    }

    return {
      event,
      laneIndex,
      position,
    };
  });
  const laneCount = Math.max(1, laneEnds.length);

  const moveRange = (direction: "back" | "next") => {
    const delta = direction === "back" ? -1 : 1;

    setAnchorDate((currentDate) => {
      if (viewMode === "day") {
        return addDays(currentDate, delta);
      }

      if (viewMode === "week") {
        return addWeeks(currentDate, delta);
      }

      return addMonths(currentDate, delta);
    });
  };

  const openDay = (date: Date) => {
    setAnchorDate(date);
    setViewMode("day");
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!onDeleteEvent) {
      return;
    }

    void onDeleteEvent(eventId);
  };

  return (
    <>
      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${(viewMode !== "day" || positionedDayEvents.length > 0) && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => {
            setAnchorDate(new Date());
            setViewMode("day");
          }}
          type="button"
        >
          Today
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${viewMode !== "week" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setViewMode("week")}
          type="button"
        >
          7 Week
        </button>
        <button
          className={`flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border ${viewMode !== "month" && "text-(--gray-page) border-(--gray-page)"}  hover:bg-(--gray)/20`}
          onClick={() => setViewMode("month")}
          type="button"
        >
          30 Month
        </button>
      </div>

      {viewMode === "day" ? (
        <p className="@[40rem]:text-xl text-lg font-medium">
          {getDayViewHeading(anchorDate)}
        </p>
      ) : null}

      {viewMode !== "day" ? (
        <div className="grid grid-cols-7 w-full">
          {WEEKDAYS.map((day) => (
            <>
              <span
                key={day}
                className="text-(--gray-page) @[40rem]:text-base text-sm hidden @[40rem]:inline"
              >
                {day}
              </span>
              <span
                key={day + "id"}
                className="text-(--gray-page) @[40rem]:text-base text-sm inline @[40rem]:hidden"
              >
                {day.slice(0, 3)}
              </span>
            </>
          ))}
        </div>
      ) : null}

      <div
        className={`h-full ${viewMode !== "day" ? "" : ""} w-full min-h-20 @[40rem]:min-h-40 max-w-full overflow-x-auto border rounded-md border-(--gray) grid ${
          viewMode === "day"
            ? "grid-cols-1 grid-rows-1"
            : viewMode === "week"
              ? "grid-cols-7 grid-rows-1"
              : "grid-cols-7 grid-flow-row"
        }`}
        style={
          viewMode === "month"
            ? {
                gridTemplateRows: `repeat(${monthRows.length}, minmax(0, 1fr))`,
              }
            : undefined
        }
      >
        {viewMode === "day" ? (
          <div
            ref={dayContainerRef}
            className="w-full h-full flex flex-col relative"
          >
            {isVisibleToday(anchorDate) ? (
              <div
                className="absolute left-0 w-full h-px bg-(--vibrant) text-(--vibrant) flex items-end justify-end z-20"
                style={{ top: `${currentTimeOffset}px` }}
              >
                <span
                  className={`p-1 bg-(--darkest) rounded-sm absolute ${now.getHours() < 1 ? "top-1" : "-top-9"}`}
                >
                  {format(now, "HH:mm")}
                </span>
              </div>
            ) : null}

            {positionedDayEvents.length > 0 ? (
              <div
                className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
                style={{ left: `${eventColumnLeft}px` }}
              >
                {positionedDayEvents.map(({ event, laneIndex, position }) => {
                  const top = getOffsetForMinutes(
                    position.startMinutes,
                    hourOffsets,
                  );
                  const bottom = getOffsetForMinutes(
                    position.endMinutes,
                    hourOffsets,
                  );
                  const colorClasses = getEventColorClasses(event.color);

                  return (
                    <div
                      key={event.id}
                      className={`absolute rounded-sm border flex flex-col gap-1 py-1 px-2 text-left pointer-events-auto overflow-hidden ${colorClasses.border} ${colorClasses.background}`}
                      style={{
                        top: `${top}px`,
                        left: `calc(${(100 / laneCount) * laneIndex}% + 0.5rem)`,
                        width: `calc(${100 / laneCount}% - 1rem)`,
                        height: `${Math.max(40, bottom - top)}px`,
                      }}
                    >
                      <div className="flex gap-2 w-full items-center justify-start font-medium text-sm text-left">
                        <span className="text-(--gray-page)">
                          {formatEventTimeRange(event)}
                        </span>
                        <span className="truncate">{event.title}</span>
                        {canEdit && onEditEvent && onDeleteEvent ? (
                          <div className="ml-auto">
                            <CalendarEventMenu
                              event={event}
                              onEdit={onEditEvent}
                              onDelete={handleDeleteEvent}
                            />
                          </div>
                        ) : null}
                      </div>
                      <p className="text-left text-sm text-(--gray-page)">
                        {!isSameDay(
                          new Date(event.startAt),
                          new Date(event.endAt),
                        ) &&
                          format(new Date(event.startAt), "d. MMMM") +
                            " - " +
                            format(new Date(event.endAt), "d. MMMM")}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {DAY_HOURS.map((time, index) => (
              <div
                key={time}
                ref={(element) => {
                  hourRowRefs.current[index] = element;
                }}
                className="w-full not-last:border-b border-(--gray) px-3 flex items-center justify-start"
              >
                <span className="h-full text-(--gray-page) text-sm text-left min-w-14 w-14 border-r pr-3 py-2 border-(--gray)">
                  {time}
                </span>
                <div
                  ref={index === 0 ? eventColumnRef : undefined}
                  className="flex-1 py-2 relative"
                />
              </div>
            ))}
          </div>
        ) : viewMode === "week" ? (
          <>
            {weekRow.map((date, index) =>
              date ? (
                (() => {
                  const visibleWeekEvents = weekEventSegments[index];

                  return (
                    <div
                      key={date.toISOString()}
                      className="not-last:border-r border-(--gray) w-full h-full aspect-square p-2 flex flex-col gap-1 hover:bg-(--gray)/5"
                      onClick={() => openDay(date)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDay(date);
                        }
                      }}
                    >
                      <span
                        className={`rounded-md @[40rem]:text-base text-sm p-[0.5px] aspect-square text-left w-max flex items-center justify-center ${
                          isToday(date)
                            ? "bg-(--vibrant)/20"
                            : "bg-(--gray)/10 text-(--gray-page)"
                        }`}
                      >
                        {format(date, "d")}
                      </span>
                      <div className="-mx-2 px-2 min-h-0 flex-1 overflow-x-hidden overflow-y-auto flex flex-col gap-1">
                        {visibleWeekEvents.map((event) => (
                          <CalendarMonthLikeEvent
                            key={`${event.id}-${date.toISOString()}`}
                            event={event}
                            date={date}
                            rowDates={weekRow}
                            compact={true}
                            eventCount={visibleWeekEvents.length}
                            canEdit={canEdit}
                            onEditEvent={onEditEvent}
                            onDeleteEvent={handleDeleteEvent}
                            onOpenDay={openDay}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div
                  key={`week-empty-${index}`}
                  className="not-last:border-r align-middle justify-center border-(--gray) w-full h-full aspect-square grid grid-cols-6 gap-4"
                >
                  {Array.from({ length: 6 }).map((_, emptyIndex) => (
                    <span
                      key={emptyIndex}
                      className="w-full h-full bg-(--gray)/10"
                    />
                  ))}
                </div>
              ),
            )}
          </>
        ) : (
          monthRows.flatMap((row, rowIndex) =>
            row.map((date, cellIndex) =>
              date ? (
                (() => {
                  const visibleMonthEvents = getEventsForDate(
                    sortedEvents,
                    date,
                  );

                  return (
                    <div
                      key={date.toISOString()}
                      className={`w-full min-h-20 @[40rem]:min-h-40 aspect-square p-2 flex flex-col gap-1 hover:bg-(--gray)/5 ${getMonthCellBorderClass(
                        rowIndex,
                        cellIndex,
                        monthRows.length,
                      )}`.trim()}
                      onClick={() => openDay(date)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDay(date);
                        }
                      }}
                    >
                      <span
                        className={`rounded-md @[40rem]:text-base text-sm p-[0.5px] aspect-square text-left w-max flex items-center justify-center ${
                          isToday(date)
                            ? "bg-(--vibrant)/20"
                            : "bg-(--gray)/10 text-(--gray-page)"
                        }`}
                      >
                        {format(date, "d")}
                      </span>
                      <div className="-mx-2 px-2 min-h-0 flex-1 overflow-x-hidden overflow-y-auto flex flex-col gap-1">
                        {visibleMonthEvents.map((event) => (
                          <CalendarMonthLikeEvent
                            key={`${event.id}-${date.toISOString()}`}
                            event={event}
                            date={date}
                            rowDates={row}
                            compact={false}
                            eventCount={visibleMonthEvents.length}
                            canEdit={canEdit}
                            onEditEvent={onEditEvent}
                            onDeleteEvent={handleDeleteEvent}
                            onOpenDay={openDay}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div
                  key={`month-empty-${rowIndex}-${cellIndex}`}
                  className={`w-full min-h-20 @[40rem]:min-h-40 aspect-square p-2 ${getMonthCellBorderClass(
                    rowIndex,
                    cellIndex,
                    monthRows.length,
                  )}`.trim()}
                />
              ),
            ),
          )
        )}
      </div>

      <div className="grid grid-cols-2 @[40rem]:flex items-center justify-between @[40rem]:justify-start w-full gap-2">
        <button
          className="flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md pl-1 pr-2 py-1 border text-(--gray-page) border-(--gray-page)  hover:bg-(--gray)/20"
          onClick={() => moveRange("back")}
          type="button"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          className="flex items-center justify-center gap-1 w-full @[40rem]:w-max rounded-md pr-1 pl-2 py-1 border text-(--gray-page) border-(--gray-page) hover:bg-(--gray)/20"
          onClick={() => moveRange("next")}
          type="button"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
};
