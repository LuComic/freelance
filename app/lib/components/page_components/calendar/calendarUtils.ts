"use client";

import {
  addDays,
  endOfDay,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  isToday,
  startOfDay,
  startOfMonth,
  type Interval,
} from "date-fns";
import { type DateRange } from "react-day-picker";
import type { CalendarEvent, CalendarEventColor } from "@/lib/pageDocument";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const CALENDAR_COLOR_OPTIONS: CalendarEventColor[] = [
  "none",
  "red",
  "green",
  "yellow",
  "pink",
  "purple",
  "cyan",
];

export const DAY_HOURS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

const MINUTES_IN_DAY = 24 * 60;

const EVENT_COLOR_CLASSES: Record<
  CalendarEventColor,
  {
    border: string;
    background: string;
  }
> = {
  none: {
    border: "border-(--gray)",
    background: "bg-(--gray)/10",
  },
  red: {
    border: "border-(--red)",
    background: "bg-(--red-bg)/10",
  },
  green: {
    border: "border-(--green)",
    background: "bg-(--green-bg)/10",
  },
  yellow: {
    border: "border-(--yellow)",
    background: "bg-(--yellow-bg)/10",
  },
  pink: {
    border: "border-(--pink)",
    background: "bg-(--pink-bg)/10",
  },
  purple: {
    border: "border-(--purple)",
    background: "bg-(--purple-bg)/10",
  },
  cyan: {
    border: "border-(--cyan)",
    background: "bg-(--cyan-bg)/10",
  },
};

export function getEventColorClasses(color: CalendarEventColor) {
  return EVENT_COLOR_CLASSES[color];
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((left, right) => {
    if (left.startAt !== right.startAt) {
      return left.startAt - right.startAt;
    }

    if (left.endAt !== right.endAt) {
      return right.endAt - left.endAt;
    }

    return left.title.localeCompare(right.title);
  });
}

export function buildMonthCells(anchorDate: Date) {
  const monthStart = startOfMonth(anchorDate);
  const leadingBlankCount = (getDay(monthStart) + 6) % 7;
  const currentMonthDates = Array.from(
    { length: getDaysInMonth(anchorDate) },
    (_, index) => addDays(monthStart, index),
  );
  const totalCellCount = leadingBlankCount + currentMonthDates.length;
  const trailingBlankCount = (7 - (totalCellCount % 7 || 7)) % 7;

  return [
    ...Array.from({ length: leadingBlankCount }, () => null),
    ...currentMonthDates,
    ...Array.from({ length: trailingBlankCount }, () => null),
  ];
}

export function chunkWeekRows<T>(items: T[]) {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += 7) {
    rows.push(items.slice(index, index + 7));
  }

  return rows;
}

export function getMonthRows(anchorDate: Date) {
  return chunkWeekRows(buildMonthCells(anchorDate));
}

export function getWeekRow(anchorDate: Date) {
  const rows = getMonthRows(anchorDate);
  return (
    rows.find((row) =>
      row.some(
        (cellDate) => cellDate !== null && isSameDay(cellDate, anchorDate),
      ),
    ) ??
    rows[0] ??
    Array.from({ length: 7 }, () => null)
  );
}

export function eventOccursOnDate(event: CalendarEvent, date: Date) {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = endOfDay(date).getTime();

  return event.startAt <= dayEnd && event.endAt >= dayStart;
}

export function getRowEventSegments(
  events: CalendarEvent[],
  rowDates: Array<Date | null>,
) {
  return rowDates.map((date) => {
    if (!date) {
      return [];
    }

    return sortCalendarEvents(events).filter((event) =>
      eventOccursOnDate(event, date),
    );
  });
}

export function isEventContinuingInRow(
  event: CalendarEvent,
  date: Date,
  rowDates: Array<Date | null>,
  direction: "prev" | "next",
) {
  const adjacentDate = addDays(date, direction === "prev" ? -1 : 1);

  return (
    rowDates.some(
      (rowDate) => rowDate !== null && isSameDay(rowDate, adjacentDate),
    ) && eventOccursOnDate(event, adjacentDate)
  );
}

export function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  const nextDate = new Date(date);

  nextDate.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );

  return nextDate;
}

export function buildEventRange(
  range: DateRange | undefined,
  startTime: string,
  endTime: string,
) {
  if (!range?.from) {
    return null;
  }

  const from = combineDateAndTime(range.from, startTime);
  const to = combineDateAndTime(range.to ?? range.from, endTime);

  if (to.getTime() <= from.getTime()) {
    return null;
  }

  return {
    startAt: from.getTime(),
    endAt: to.getTime(),
  };
}

export function getEventDateRange(event: CalendarEvent): DateRange {
  return {
    from: new Date(event.startAt),
    to: new Date(event.endAt),
  };
}

export function getEventStartTime(event: CalendarEvent) {
  return format(new Date(event.startAt), "HH:mm");
}

export function getEventEndTime(event: CalendarEvent) {
  return format(new Date(event.endAt), "HH:mm");
}

export function formatEventTimeRange(
  event: Pick<CalendarEvent, "startAt" | "endAt">,
) {
  return `${format(new Date(event.startAt), "HH:mm")} - ${format(
    new Date(event.endAt),
    "HH:mm",
  )}`;
}

export function getDayViewHeading(date: Date) {
  return isToday(date)
    ? `Today, ${format(date, "d. MMMM")}`
    : format(date, "EEEE, d. MMMM");
}

export function getDayPosition(event: CalendarEvent, date: Date) {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = endOfDay(date).getTime();
  const startAt = Math.max(dayStart, event.startAt);
  const endAt = Math.min(dayEnd, event.endAt);
  const startMinutes = (startAt - dayStart) / 60000;
  const endMinutes = Math.max(startMinutes + 15, (endAt - dayStart) / 60000);

  return {
    startMinutes,
    endMinutes: Math.min(MINUTES_IN_DAY, endMinutes),
  };
}

export function getEventsForDate(events: CalendarEvent[], date: Date) {
  return sortCalendarEvents(events).filter((event) =>
    eventOccursOnDate(event, date),
  );
}

export function getTimelineEventsForDate(events: CalendarEvent[], date: Date) {
  return getEventsForDate(events, date).map((event) => ({
    event,
    position: getDayPosition(event, date),
  }));
}

export function isVisibleToday(date: Date) {
  return isToday(date);
}

export function getDateCellInterval(date: Date): Interval {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}
