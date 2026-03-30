"use client";

import type { CSSProperties } from "react";
import type { CalendarEvent } from "@/lib/pageDocument";
import {
  formatEventTimeRange,
  getEventColorClasses,
  isEventContinuingInRow,
} from "./calendarUtils";
import { CalendarEventMenu } from "./CalendarEventMenu";

const SEGMENT_EDGE_OFFSET_PX = 8;

function getConnectedSegmentClass(
  hasSegmentBeforeDate: boolean,
  hasSegmentAfterDate: boolean,
) {
  if (hasSegmentBeforeDate && hasSegmentAfterDate) {
    return "rounded-none border-x-0";
  }

  if (hasSegmentBeforeDate) {
    return "rounded-l-none border-l-0 rounded-r-sm";
  }

  if (hasSegmentAfterDate) {
    return "rounded-r-none border-r-0 rounded-l-sm";
  }

  return "rounded-sm";
}

function getConnectedSegmentStyle(
  hasSegmentBeforeDate: boolean,
  hasSegmentAfterDate: boolean,
): CSSProperties | undefined {
  if (hasSegmentBeforeDate && hasSegmentAfterDate) {
    return {
      marginLeft: `-${SEGMENT_EDGE_OFFSET_PX}px`,
      width: `calc(100% + ${SEGMENT_EDGE_OFFSET_PX * 2}px)`,
    };
  }

  if (hasSegmentBeforeDate) {
    return {
      marginLeft: `-${SEGMENT_EDGE_OFFSET_PX}px`,
      width: `calc(100% + ${SEGMENT_EDGE_OFFSET_PX}px)`,
    };
  }

  if (hasSegmentAfterDate) {
    return {
      width: `calc(100% + ${SEGMENT_EDGE_OFFSET_PX}px)`,
    };
  }

  return undefined;
}

type CalendarMonthLikeEventProps = {
  event: CalendarEvent;
  date: Date;
  rowDates: Array<Date | null>;
  compact?: boolean;
  eventCount?: number;
  canEdit?: boolean;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void | Promise<void>;
  onOpenDay: (date: Date) => void;
};

export const CalendarMonthLikeEvent = ({
  event,
  date,
  rowDates,
  compact,
  eventCount = 1,
  canEdit = false,
  onEditEvent,
  onDeleteEvent,
  onOpenDay,
}: CalendarMonthLikeEventProps) => {
  const hasSegmentBeforeDate = isEventContinuingInRow(
    event,
    date,
    rowDates,
    "prev",
  );

  const hasSegmentAfterDate = isEventContinuingInRow(
    event,
    date,
    rowDates,
    "next",
  );
  const colorClasses = getEventColorClasses(event.color);

  return (
    <div
      className={`relative z-10 shrink-0 ${eventCount >= 2 ? "" : "h-full"} w-full overflow-x-hidden overflow-y-visible border flex flex-col gap-1 py-1 px-2 text-left ${colorClasses.border} ${colorClasses.background} ${getConnectedSegmentClass(
        hasSegmentBeforeDate,
        hasSegmentAfterDate,
      )}`.trim()}
      style={getConnectedSegmentStyle(
        hasSegmentBeforeDate,
        hasSegmentAfterDate,
      )}
    >
      <div className="flex items-center justify-start gap-2">
        {!compact &&
        canEdit &&
        !hasSegmentBeforeDate &&
        onEditEvent &&
        onDeleteEvent ? (
          <div>
            <CalendarEventMenu
              event={event}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
            />
          </div>
        ) : null}
        <p className="font-medium text-sm text-left truncate">{event.title}</p>
      </div>
      {eventCount < 2 ? (
        <button
          type="button"
          className="text-left text-sm text-(--gray-page)"
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onOpenDay(date);
          }}
        >
          {formatEventTimeRange(event)}
        </button>
      ) : null}
    </div>
  );
};
