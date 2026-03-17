"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEvent, CalendarEventColor } from "@/lib/pageDocument";
import { DatePicker } from "../DatePicker";
import {
  CALENDAR_COLOR_OPTIONS,
  buildEventRange,
  getEventDateRange,
  getEventEndTime,
  getEventStartTime,
} from "./calendarUtils";
import { format, isSameDay } from "date-fns";

type CalendarModalProps = {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nextEvent: CalendarEvent) => Promise<void> | void;
};

export const CalendarModal = ({
  event,
  open,
  onOpenChange,
  onSave,
}: CalendarModalProps) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<CalendarEventColor>("none");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState("10:30");
  const [endTime, setEndTime] = useState("12:30");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!event) {
      setTitle("");
      setColor("none");
      setDateRange(undefined);
      setStartTime("10:30");
      setEndTime("12:30");
      setError(null);
      return;
    }

    setTitle(event.title);
    setColor(event.color);
    setDateRange(getEventDateRange(event));
    setStartTime(getEventStartTime(event));
    setEndTime(getEventEndTime(event));
    setError(null);
  }, [event]);

  if (!open || !event) {
    return null;
  }

  return (
    <div
      className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/60"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-h-1/2 h-auto flex flex-col items-start justify-start gap-2 p-3 @[40rem]:max-w-xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-center justify-start gap-4">
          <p className="@[40rem]:text-3xl text-xl font-medium capitalize">
            {event.title}
          </p>
          <span className="px-2 py-0.5 border text-nowrap rounded-md border-(--gray-page) text-(--gray-page)">
            {format(new Date(event.startAt), "d. MMMM")}
            {!isSameDay(new Date(event.startAt), new Date(event.endAt)) &&
              " - " + format(new Date(event.endAt), "d. MMMM")}
          </span>
        </div>
        <p className="text-(--gray-page)">Event name</p>
        <input
          type="text"
          className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
          placeholder="Project name..."
          value={title}
          onChange={(changeEvent) => {
            setTitle(changeEvent.target.value);
            setError(null);
          }}
        />

        <p className="text-(--gray-page)">Event date</p>
        <DatePicker
          modal={true}
          value={dateRange}
          onValueChange={(nextRange) => {
            setDateRange(nextRange);
            setError(null);
          }}
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={(nextTime) => {
            setStartTime(nextTime);
            setError(null);
          }}
          onEndTimeChange={(nextTime) => {
            setEndTime(nextTime);
            setError(null);
          }}
        />

        <div className="flex flex-col gap-1 w-full">
          <p className="text-(--gray-page)">Color</p>
          <Select
            value={color}
            onValueChange={(nextColor) => {
              setColor(nextColor as CalendarEventColor);
              setError(null);
            }}
          >
            <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
              <SelectValue placeholder="Set the status" />
            </SelectTrigger>
            <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
              <SelectGroup className="bg-(--darkest)">
                {CALENDAR_COLOR_OPTIONS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="data-highlighted:bg-(--dim) data-highlighted:text-(--light)"
                  >
                    {option !== "none" ? (
                      <div
                        className="h-auto aspect-square w-4 rounded-full"
                        style={{ backgroundColor: `var(--${option})` }}
                      />
                    ) : null}
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <p className="text-sm text-(--declined-border)">{error}</p>
        ) : null}

        <div className="w-full flex items-center gap-1 mt-4">
          <button
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 disabled:opacity-60"
            disabled={isSaving}
            onClick={async () => {
              if (!title.trim()) {
                setError("Event name is required.");
                return;
              }

              const nextRange = buildEventRange(dateRange, startTime, endTime);
              if (!nextRange) {
                setError("Choose a valid date range.");
                return;
              }

              setIsSaving(true);
              try {
                await onSave({
                  ...event,
                  title: title.trim(),
                  color,
                  ...nextRange,
                });
                onOpenChange(false);
              } finally {
                setIsSaving(false);
              }
            }}
            type="button"
          >
            <Check size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
