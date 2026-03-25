"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CalendarEvent,
  CalendarEventColor,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { DatePicker } from "../DatePicker";
import { CalendarModal } from "./CalendarModal";
import { CalendarSurface } from "./CalendarSurface";
import {
  CALENDAR_COLOR_OPTIONS,
  buildEventRange,
  sortCalendarEvents,
} from "./calendarUtils";

type CalendarCreatorProps = {
  liveState: PageComponentLiveStateByType<"Calendar">["state"];
  onCommitLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Calendar">["state"],
    ) => PageComponentLiveStateByType<"Calendar">["state"],
  ) => Promise<void>;
};

export const CalendarCreator = ({
  liveState,
  onCommitLiveState,
}: CalendarCreatorProps) => {
  const [adding, setAdding] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState("10:30");
  const [endTime, setEndTime] = useState("12:30");
  const [selectedColor, setSelectedColor] =
    useState<CalendarEventColor>("none");
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const createEvent = async () => {
    if (!titleInput.trim()) {
      setError("Event name is required.");
      return;
    }

    const nextRange = buildEventRange(dateRange, startTime, endTime);
    if (!nextRange) {
      setError("Choose a valid date range.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: titleInput.trim(),
      color: selectedColor,
      ...nextRange,
    };

    await onCommitLiveState((currentState) => ({
      ...currentState,
      events: sortCalendarEvents([...currentState.events, newEvent]),
    }));

    setTitleInput("");
    setDateRange(undefined);
    setStartTime("10:30");
    setEndTime("12:30");
    setSelectedColor("none");
    setError(null);
  };

  const updateEvent = async (nextEvent: CalendarEvent) => {
    await onCommitLiveState((currentState) => ({
      ...currentState,
      events: sortCalendarEvents(
        currentState.events.map((event) =>
          event.id === nextEvent.id ? nextEvent : event,
        ),
      ),
    }));
  };

  const deleteEvent = async (eventId: string) => {
    await onCommitLiveState((currentState) => ({
      ...currentState,
      events: currentState.events.filter((event) => event.id !== eventId),
    }));

    if (editingEvent?.id === eventId) {
      setEditingEvent(null);
    }
  };

  return (
    <>
      <CalendarModal
        event={editingEvent}
        open={editingEvent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEvent(null);
          }
        }}
        onSave={updateEvent}
      />

      <p className="@[40rem]:text-xl text-lg font-medium mt-2">Calendar</p>
      <p className="text-(--gray-page)">
        A calendar for scheduling different dates for clients and creators
      </p>
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2  w-max"
          onClick={() => setAdding((previousValue) => !previousValue)}
          type="button"
        >
          Schedule
          <ChevronRight size={18} className={`${adding && "rotate-90"}`} />
        </button>
        {adding ? (
          <>
            <input
              type="text"
              placeholder="Creating the MVP..."
              className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
              value={titleInput}
              onChange={(changeEvent) => {
                setTitleInput(changeEvent.target.value);
                setError(null);
              }}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter") {
                  void createEvent();
                }
              }}
            />

            <div className="flex flex-col gap-1">
              <p className="font-medium">Pick the date(s)</p>
              <DatePicker
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
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-medium">Color</p>
              <Select
                value={selectedColor}
                onValueChange={(nextColor) => {
                  setSelectedColor(nextColor as CalendarEventColor);
                  setError(null);
                }}
              >
                <SelectTrigger className="w-full @[40rem]:w-52 bg-(--darkest) border-(--gray-page)">
                  <SelectValue placeholder="Set the status" />
                </SelectTrigger>
                <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
                  <SelectGroup className="bg-(--darkest)">
                    {CALENDAR_COLOR_OPTIONS.map((color) => (
                      <SelectItem
                        key={color}
                        value={color}
                        className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
                      >
                        {color !== "none" ? (
                          <div
                            className="h-auto aspect-square w-4 rounded-full"
                            style={{ backgroundColor: `var(--${color})` }}
                          />
                        ) : null}
                        {color}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {error ? <p className="text-(--declined-border)">{error}</p> : null}

            <button
              className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60"
              onClick={() => void createEvent()}
              type="button"
            >
              Create event
            </button>
          </>
        ) : null}
      </div>

      <CalendarSurface
        events={liveState.events}
        canEdit={true}
        onEditEvent={setEditingEvent}
        onDeleteEvent={deleteEvent}
      />
    </>
  );
};
