"use client";

import { useState } from "react";
import { useOptionalPageDocument } from "@/app/lib/components/project/PageDocumentContext";
import type {
  CalendarEvent,
  PageComponentLiveStateByType,
} from "@/lib/pageDocument";
import { CalendarModal } from "./CalendarModal";
import { sortCalendarEvents } from "./calendarUtils";
import { CalendarSurface } from "./CalendarSurface";

type CalendarClientProps = {
  liveState: PageComponentLiveStateByType<"Calendar">["state"];
  onCommitLiveState: (
    updater: (
      state: PageComponentLiveStateByType<"Calendar">["state"],
    ) => PageComponentLiveStateByType<"Calendar">["state"],
  ) => Promise<void>;
};

export const CalendarClient = ({
  liveState,
  onCommitLiveState,
}: CalendarClientProps) => {
  const pageDocument = useOptionalPageDocument();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const canEditEvents =
    pageDocument?.viewerRole === "owner" ||
    pageDocument?.viewerRole === "coCreator";

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

      <CalendarSurface
        events={liveState.events}
        canEdit={canEditEvents}
        onEditEvent={canEditEvents ? setEditingEvent : undefined}
        onDeleteEvent={canEditEvents ? deleteEvent : undefined}
      />
    </>
  );
};
