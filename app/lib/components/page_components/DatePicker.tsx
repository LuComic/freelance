"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

export const DatePicker = () => {
  const [date, setDate] = React.useState<DateRange | undefined>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker-range"
          className="w-full @[40rem]:w-max bg-(--darkest) border-(--gray-page) font-normal hover:bg-(--darkest) hover:text-(--light)"
        >
          <CalendarIcon />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-0 bg-(--darkest)"
        align="start"
      >
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          className="[&_button[data-range-middle=true]]:bg-(--vibrant)/20 [&_button[data-range-middle=true]]:text-(--light) text-(--light)"
          classNames={{
            // Today: subtle underline dot instead of background
            today: "text-(--vibrant)",
            button_previous:
              "bg-(--darkest)! text-(--light) hover:bg-(--quite-dark-hover)! hover:text-(--light) p-1 rounded-md",
            button_next:
              "bg-(--darkest)! text-(--light) hover:bg-(--quite-dark-hover)! hover:text-(--light) p-1 rounded-md",

            // Bar segments — fix the rounded sides
            range_start: "bg-(--vibrant) rounded-l-md",
            range_end: "bg-(--vibrant) rounded-r-md",
            range_middle:
              "aria-selected:bg-(--vibrant)/20! aria-selected:text-(--light) rounded-none",
            // Hover on day cells
            day: "[&>button]:hover:bg-(--gray-page)/20 [&>button]:hover:text-(--light) rounded-none",

            // The button circle on top of the bar
            day_button:
              "rounded-md " +
              "data-[range-start=true]:bg-(--vibrant)! data-[range-start=true]:text-(--light)! data-[range-start=true]:rounded-l-md data-[range-start=true]:rounded-r-none " +
              "data-[range-end=true]:bg-(--vibrant)! data-[range-end=true]:text-(--light)! data-[range-end=true]:rounded-r-md data-[range-end=true]:rounded-l-none",

            // Selected single day
            selected: "bg-(--vibrant)! text-(--light)! rounded-md",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
