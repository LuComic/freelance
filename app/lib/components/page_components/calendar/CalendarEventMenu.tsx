"use client";

import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import type { CalendarEvent } from "@/lib/pageDocument";

type CalendarEventMenuProps = {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void | Promise<void>;
};

export const CalendarEventMenu = ({
  event,
  onEdit,
  onDelete,
}: CalendarEventMenuProps) => {
  return (
    <Menubar
      className="h-auto bg-transparent border-none shadow-none p-0"
      onClick={(clickEvent) => clickEvent.stopPropagation()}
    >
      <MenubarMenu>
        <MenubarTrigger className="data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) p-0">
          <EllipsisVertical size={15} />
        </MenubarTrigger>
        <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
          <MenubarGroup>
            <MenubarItem
              className="hover:bg-(--darkest-hover)! hover:text-(--light)!"
              onSelect={() => onEdit(event)}
            >
              <div className="flex items-center justify-start gap-2 w-full">
                <Pencil />
                Edit
              </div>
            </MenubarItem>
            <MenubarItem
              asChild
              className="hover:bg-(--declined-bg)/5! hover:text-(--declined-border)! text-(--declined-border)"
            >
              <button
                className="flex items-center justify-start gap-2 w-full"
                onClick={() => void onDelete(event.id)}
                type="button"
              >
                <Trash color="var(--declined-border)" />
                Delete
              </button>
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
