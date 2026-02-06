"use client";
import {
  ChevronRight,
  EllipsisVertical,
  Minus,
  Plus,
  UserMinus,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useState } from "react";

interface ConnectionItemProps {
  title: string;
  items: string[];
  type: "friends" | "collabs" | "sent" | "got";
}

export const ConnectionItem = ({ title, items, type }: ConnectionItemProps) => {
  const [itemExpanded, setItemExpanded] = useState(false);
  return (
    <>
      <button
        className="rounded-lg p-1 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start cursor-pointer md:text-base text-sm"
        onClick={() => setItemExpanded(!itemExpanded)}
      >
        <ChevronRight className={`${itemExpanded ? "rotate-90" : ""}`} />
        {title}
      </button>
      {itemExpanded
        ? items.map((item, index) => (
            <span
              className="pl-8 flex w-full items-center cursor-pointer justify-start gap-2 hover:bg-(--darkest-hover) rounded-lg md:text-base text-sm p-1"
              key={index}
            >
              <div className="aspect-square w-5 h-auto bg-(--dim) rounded-full"></div>
              {item}
              {type === "friends" ? (
                <Menubar className="ml-auto h-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                          <Plus />
                          Invite
                        </MenubarItem>
                        <MenubarSeparator className="bg-(--gray)" />
                        <MenubarItem className="hover:bg-(--red)/5! hover:text-(--red)! text-(--red) cursor-pointer">
                          <UserMinus color="var(--red)" />
                          Remove friend
                        </MenubarItem>
                        <MenubarItem className="hover:bg-(--red)/5! hover:text-(--red)! text-(--red) cursor-pointer">
                          <UserX color="var(--red)" />
                          Block
                        </MenubarItem>
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : type === "collabs" ? (
                <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                          <Plus />
                          Invite
                        </MenubarItem>
                        <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                          <UserPlus />
                          Add Friend
                        </MenubarItem>
                        <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                          <Minus />
                          Hide
                        </MenubarItem>
                        <MenubarSeparator className="bg-(--gray)" />
                        <MenubarItem className="hover:bg-(--red)/5! hover:text-(--red)! text-(--red) cursor-pointer">
                          <UserX color="var(--red)" />
                          Block
                        </MenubarItem>
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : type === "got" ? (
                <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                      <EllipsisVertical size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                      <MenubarGroup>
                        <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                          <Plus />
                          Accept
                        </MenubarItem>
                        <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                          <Minus />
                          Hide
                        </MenubarItem>
                        <MenubarSeparator className="bg-(--gray)" />
                        <MenubarItem className="hover:bg-(--red)/5! hover:text-(--red)! text-(--red) cursor-pointer">
                          <UserX color="var(--red)" />
                          Block
                        </MenubarItem>
                      </MenubarGroup>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              ) : (
                type === "sent" && (
                  <Menubar className="h-auto ml-auto bg-transparent border-none shadow-none p-0">
                    <MenubarMenu>
                      <MenubarTrigger className="cursor-pointer data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--light) data-[state=open]:text-(--light) py-0">
                        <EllipsisVertical size={20} />
                      </MenubarTrigger>
                      <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                        <MenubarGroup>
                          <MenubarItem className="hover:bg-(--darkest-hover)! hover:text-(--light)! cursor-pointer">
                            <X />
                            Cancel
                          </MenubarItem>
                          <MenubarSeparator className="bg-(--gray)" />
                          <MenubarItem className="hover:bg-(--red)/5! hover:text-(--red)! text-(--red) cursor-pointer">
                            <UserX color="var(--red)" />
                            Block
                          </MenubarItem>
                        </MenubarGroup>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                )
              )}
            </span>
          ))
        : null}
    </>
  );
};
