"use client";

import type { PageComponentLiveStateByType } from "@/lib/pageDocument";
import { CalendarSurface } from "./CalendarSurface";

type CalendarClientProps = {
  liveState: PageComponentLiveStateByType<"Calendar">["state"];
};

export const CalendarClient = ({ liveState }: CalendarClientProps) => {
  return <CalendarSurface events={liveState.events} />;
};
