"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SearchPerson } from "./SearchBarData";

export type SearchTag = "people" | "template";
export type InviteRole = "client" | "coCreator";
export type PersonInviteDefaults = {
  projectId?: Id<"projects">;
  projectName?: string;
  role?: InviteRole;
  expandInviteSection?: boolean;
};

type SearchBarContextValue = {
  isOpen: boolean;
  activeTag: SearchTag | null;
  personModalPerson: SearchPerson | null;
  personModalInviteDefaults: PersonInviteDefaults | null;
  searchInviteDefaults: PersonInviteDefaults | null;
  openSearch: () => void;
  openTaggedSearch: (tag: SearchTag, inviteDefaults?: PersonInviteDefaults) => void;
  openPersonModal: (
    person: SearchPerson,
    inviteDefaults?: PersonInviteDefaults,
  ) => void;
  closeSearch: () => void;
  closePersonModal: () => void;
  clearTag: () => void;
};

const SearchBarContext = createContext<SearchBarContextValue | null>(null);

export const SearchBarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<SearchTag | null>(null);
  const [personModalPerson, setPersonModalPerson] = useState<SearchPerson | null>(
    null,
  );
  const [personModalInviteDefaults, setPersonModalInviteDefaults] =
    useState<PersonInviteDefaults | null>(null);
  const [searchInviteDefaults, setSearchInviteDefaults] =
    useState<PersonInviteDefaults | null>(null);

  const value = useMemo(
    () => ({
      isOpen,
      activeTag,
      personModalPerson,
      personModalInviteDefaults,
      searchInviteDefaults,
      openSearch: () => {
        setSearchInviteDefaults(null);
        setIsOpen(true);
      },
      openTaggedSearch: (tag: SearchTag, inviteDefaults?: PersonInviteDefaults) => {
        setActiveTag(tag);
        setSearchInviteDefaults(tag === "people" ? inviteDefaults ?? null : null);
        setIsOpen(true);
      },
      openPersonModal: (
        person: SearchPerson,
        inviteDefaults?: PersonInviteDefaults,
      ) => {
        setPersonModalPerson(person);
        setPersonModalInviteDefaults(inviteDefaults ?? null);
      },
      closeSearch: () => {
        setIsOpen(false);
        setActiveTag(null);
        setSearchInviteDefaults(null);
      },
      closePersonModal: () => {
        setPersonModalPerson(null);
        setPersonModalInviteDefaults(null);
      },
      clearTag: () => {
        setActiveTag(null);
        setSearchInviteDefaults(null);
      },
    }),
    [
      activeTag,
      isOpen,
      personModalInviteDefaults,
      personModalPerson,
      searchInviteDefaults,
    ],
  );

  return (
    <SearchBarContext.Provider value={value}>
      {children}
    </SearchBarContext.Provider>
  );
};

export const useSearchBar = () => {
  const context = useContext(SearchBarContext);

  if (!context) {
    throw new Error("useSearchBar must be used within SearchBarProvider");
  }

  return context;
};
