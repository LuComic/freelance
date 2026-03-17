"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { CalendarSurface } from "./CalendarSurface";

type CalendarClientProps = {
  liveState: PageComponentLiveStateByType<"Calendar">["state"];
};

export const CalendarClient = ({ liveState }: CalendarClientProps) => {
  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Calendar</p>
      <p className="text-(--gray-page)">
        A calendar for scheduling different dates for clients and creators
      </p>
      <CalendarSurface events={liveState.events} />
    </>
  );
};
