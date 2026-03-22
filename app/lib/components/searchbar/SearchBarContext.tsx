"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  SearchPerson,
  SearchTemplate,
  SearchTemplateType,
} from "./SearchBarData";

export type SearchTag = "people" | "template";
export type InviteRole = "client" | "coCreator";
export type SearchPersonSelectHandler = (person: SearchPerson) => void;
export type SearchTemplateSelectHandler = (template: SearchTemplate) => void;
export type PersonInviteDefaults = {
  projectId?: Id<"projects">;
  projectName?: string;
  role?: InviteRole;
  expandInviteSection?: boolean;
};
export type TemplateSearchOptions = {
  types?: SearchTemplateType[];
  selectHandler?: SearchTemplateSelectHandler;
};

type SearchBarContextValue = {
  isOpen: boolean;
  activeTag: SearchTag | null;
  personModalPerson: SearchPerson | null;
  personModalInviteDefaults: PersonInviteDefaults | null;
  searchInviteDefaults: PersonInviteDefaults | null;
  peopleSearchSelectHandler: SearchPersonSelectHandler | null;
  templateSearchTypes: SearchTemplateType[] | null;
  templateSearchSelectHandler: SearchTemplateSelectHandler | null;
  openSearch: () => void;
  openTaggedSearch: (
    tag: SearchTag,
    inviteDefaults?: PersonInviteDefaults,
    selectHandler?: SearchPersonSelectHandler,
  ) => void;
  openTemplateSearch: (options?: TemplateSearchOptions) => void;
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
  const [peopleSearchSelectHandler, setPeopleSearchSelectHandler] =
    useState<SearchPersonSelectHandler | null>(null);
  const [templateSearchTypes, setTemplateSearchTypes] = useState<
    SearchTemplateType[] | null
  >(null);
  const [templateSearchSelectHandler, setTemplateSearchSelectHandler] =
    useState<SearchTemplateSelectHandler | null>(null);

  const value = useMemo(
    () => ({
      isOpen,
      activeTag,
      personModalPerson,
      personModalInviteDefaults,
      searchInviteDefaults,
      peopleSearchSelectHandler,
      templateSearchTypes,
      templateSearchSelectHandler,
      openSearch: () => {
        setSearchInviteDefaults(null);
        setPeopleSearchSelectHandler(null);
        setTemplateSearchTypes(null);
        setTemplateSearchSelectHandler(null);
        setIsOpen(true);
      },
      openTaggedSearch: (
        tag: SearchTag,
        inviteDefaults?: PersonInviteDefaults,
        selectHandler?: SearchPersonSelectHandler,
      ) => {
        setActiveTag(tag);
        setSearchInviteDefaults(tag === "people" ? inviteDefaults ?? null : null);
        setPeopleSearchSelectHandler(() =>
          tag === "people" ? selectHandler ?? null : null,
        );
        setTemplateSearchTypes(null);
        setTemplateSearchSelectHandler(null);
        setIsOpen(true);
      },
      openTemplateSearch: (options?: TemplateSearchOptions) => {
        setActiveTag("template");
        setSearchInviteDefaults(null);
        setPeopleSearchSelectHandler(null);
        setTemplateSearchTypes(options?.types ?? null);
        setTemplateSearchSelectHandler(() => options?.selectHandler ?? null);
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
        setPeopleSearchSelectHandler(null);
        setTemplateSearchTypes(null);
        setTemplateSearchSelectHandler(null);
      },
      closePersonModal: () => {
        setPersonModalPerson(null);
        setPersonModalInviteDefaults(null);
      },
      clearTag: () => {
        setActiveTag(null);
        setSearchInviteDefaults(null);
        setPeopleSearchSelectHandler(null);
        setTemplateSearchTypes(null);
        setTemplateSearchSelectHandler(null);
      },
    }),
    [
      activeTag,
      isOpen,
      peopleSearchSelectHandler,
      personModalInviteDefaults,
      personModalPerson,
      searchInviteDefaults,
      templateSearchSelectHandler,
      templateSearchTypes,
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
