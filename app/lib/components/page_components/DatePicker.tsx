"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { format } from "date-fns";
import { CalendarIcon, Clock2Icon } from "lucide-react";
import { type DateRange } from "react-day-picker";

export const DatePicker = ({ modal }: { modal?: boolean }) => {
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
        className={`w-auto p-0 border-0 ${modal ? "bg-(--dim)" : "bg-(--darkest)"}`}
        align="start"
      >
        <Card
          className={`w-auto p-0 gap-0 border-0 ${modal ? "bg-(--dim)" : "bg-(--darkest)"} rounded-md`}
        >
          <CardContent className="p-0">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              className="[&_button[data-range-middle=true]]:bg-(--vibrant)/20 [&_button[data-range-middle=true]]:text-(--light) text-(--light)"
              classNames={{
                // Today: subtle underline dot instead of background
                today: "text-(--vibrant)",
                button_previous: modal
                  ? "bg-(--dim)! text-(--light) hover:bg-(--quite-dark-hover)! hover:text-(--light) p-1 rounded-md"
                  : "bg-(--darkest)! text-(--light) hover:bg-(--quite-dark-hover)! hover:text-(--light) p-1 rounded-md",
                button_next: modal
                  ? "bg-(--dim)! text-(--light) hover:bg-(--quite-dark-hover)! hover:text-(--light) p-1 rounded-md"
                  : "bg-(--darkest)! text-(--light) hover:bg-(--quite-dark-hover)! hover:text-(--light) p-1 rounded-md",

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
          </CardContent>
          <CardFooter
            className={`w-auto pb-3 px-3 gap-2 border-0 text-(--light) rounded-md ${
              modal ? "bg-(--dim)" : "bg-(--darkest)"
            }`}
          >
            <FieldGroup className="gap-4">
              <Field className="gap-2">
                <FieldLabel htmlFor="time-from">Start Time</FieldLabel>
                <InputGroup className="border-(--gray) rounded-sm">
                  <InputGroupInput
                    id="time-from"
                    type="time"
                    step="1"
                    defaultValue="10:30:00"
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none "
                  />
                  <InputGroupAddon>
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="time-to">End Time</FieldLabel>
                <InputGroup className="border-(--gray) rounded-sm">
                  <InputGroupInput
                    id="time-to"
                    type="time"
                    step="1"
                    defaultValue="12:30:00"
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none font-normal"
                  />
                  <InputGroupAddon>
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
