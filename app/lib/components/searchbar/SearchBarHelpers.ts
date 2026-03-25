"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import type { PersonInviteDefaults, SearchTag } from "./SearchBarContext";
import type {
  SearchPerson,
  SearchTemplateSummary,
  SearchTemplateType,
} from "./SearchBarData";

const TAG_COMMANDS = [
  { command: "/people", tag: "people" },
  { command: "/template", tag: "template" },
] as const;

export type SearchPageResult = {
  projectId: string;
  projectSlug: string;
  projectName: string;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  pageDescription: string | null;
  projectUpdatedAt: number;
  pageUpdatedAt: number;
};

export const getSearchPlaceholder = (activeTag: SearchTag | null) => {
  if (activeTag === "people") {
    return "Search for users...";
  }

  if (activeTag === "template") {
    return "Search templates...";
  }

  return "Search pages across projects...";
};

export const getTagCommandMatch = (searchQuery: string) => {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  return (
    TAG_COMMANDS.find(({ command }) => command === normalizedSearchQuery) ??
    null
  );
};

export const getTagGhostCompletion = (searchQuery: string) => {
  const normalizedSearchQuery = searchQuery.toLowerCase();

  if (
    normalizedSearchQuery.length === 0 ||
    !normalizedSearchQuery.startsWith("/") ||
    normalizedSearchQuery.includes(" ")
  ) {
    return null;
  }

  const matchingCommands = TAG_COMMANDS.filter(({ command }) =>
    command.startsWith(normalizedSearchQuery),
  );

  if (matchingCommands.length !== 1) {
    return null;
  }

  const [{ command }] = matchingCommands;

  if (command === normalizedSearchQuery) {
    return null;
  }

  return {
    command,
    completion: command.slice(normalizedSearchQuery.length),
  };
};

export const getEmptyMessage = ({
  activeTag,
  normalizedSearchQuery,
  isLoadingPeople,
  isLoadingPages,
  isLoadingTemplates,
}: {
  activeTag: SearchTag | null;
  normalizedSearchQuery: string;
  isLoadingPeople: boolean;
  isLoadingPages: boolean;
  isLoadingTemplates: boolean;
}) => {
  if (activeTag === "people") {
    if (normalizedSearchQuery.length < 2) {
      return "Type at least 2 characters";
    }

    return isLoadingPeople ? "Searching people..." : "No people found";
  }

  if (activeTag === "template") {
    return isLoadingTemplates ? "Loading templates..." : "No templates found";
  }

  if (isLoadingPages) {
    return "Loading pages...";
  }

  return normalizedSearchQuery.length === 0 ? "No pages yet" : "No pages found";
};

export const getPersonModalKey = (
  personModalPerson: SearchPerson | null,
  personModalInviteDefaults: PersonInviteDefaults | null,
) => {
  if (!personModalPerson) {
    return "person-modal";
  }

  return [
    personModalPerson.userId,
    personModalInviteDefaults?.projectId ?? "",
    personModalInviteDefaults?.role ?? "",
    personModalInviteDefaults?.expandInviteSection ? "expanded" : "collapsed",
  ].join(":");
};

export const useSearchBarResults = ({
  isOpen,
  activeTag,
  searchQuery,
  templateSearchTypes,
  setTemplateActionError,
}: {
  isOpen: boolean;
  activeTag: SearchTag | null;
  searchQuery: string;
  templateSearchTypes: SearchTemplateType[] | null;
  setTemplateActionError: (value: string | null) => void;
}) => {
  const deferredSearchQuery = useDeferredValue(
    activeTag === "people" ? "" : searchQuery,
  );
  const normalizedSearchQuery = searchQuery.trim();
  const [debouncedPeopleQuery, setDebouncedPeopleQuery] = useState("");
  const [resolvedPeopleSearchState, setResolvedPeopleSearchState] = useState<{
    query: string;
    results: SearchPerson[];
  }>();
  const [resolvedPageSearchResults, setResolvedPageSearchResults] = useState<
    SearchPageResult[] | undefined
  >(undefined);
  const [resolvedTemplateSearchResults, setResolvedTemplateSearchResults] =
    useState<SearchTemplateSummary[] | undefined>(undefined);

  const peopleSearchArgs =
    isOpen && activeTag === "people" && debouncedPeopleQuery.length >= 2
      ? {
          query: debouncedPeopleQuery,
          limit: 10,
        }
      : "skip";
  const pageSearchArgs =
    isOpen && activeTag === null
      ? {
          query: deferredSearchQuery.trim(),
          limit: 10,
        }
      : "skip";
  const templateSearchArgs =
    isOpen && activeTag === "template"
      ? {
          query: deferredSearchQuery.trim(),
          limit: 10,
          types: templateSearchTypes ?? undefined,
        }
      : "skip";

  const pageSearchResults = useQuery(
    api.search.queries.searchPagesAcrossProjects,
    pageSearchArgs,
  );
  const peopleSearchResults = useQuery(
    api.search.queries.searchPeople,
    peopleSearchArgs,
  );
  const templateSearchResults = useQuery(
    api.templates.queries.searchVisibleTemplates,
    templateSearchArgs,
  );

  const visiblePeopleSearchResults: SearchPerson[] =
    peopleSearchResults ?? resolvedPeopleSearchState?.results ?? [];
  const visiblePageSearchResults: SearchPageResult[] =
    pageSearchResults ?? resolvedPageSearchResults ?? [];
  const visibleTemplateSearchResults: SearchTemplateSummary[] =
    templateSearchResults ?? resolvedTemplateSearchResults ?? [];

  const isLoadingPeople =
    isOpen &&
    activeTag === "people" &&
    normalizedSearchQuery.length >= 2 &&
    (debouncedPeopleQuery !== normalizedSearchQuery ||
      (peopleSearchResults === undefined &&
        visiblePeopleSearchResults.length === 0));
  const isLoadingPages =
    isOpen &&
    activeTag === null &&
    pageSearchResults === undefined &&
    visiblePageSearchResults.length === 0;
  const isLoadingTemplates =
    isOpen &&
    activeTag === "template" &&
    templateSearchResults === undefined &&
    visibleTemplateSearchResults.length === 0;

  useEffect(() => {
    if (!isOpen || activeTag !== "people") {
      startTransition(() => {
        setDebouncedPeopleQuery("");
        setResolvedPeopleSearchState(undefined);
      });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedPeopleQuery(normalizedSearchQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [activeTag, isOpen, normalizedSearchQuery]);

  useEffect(() => {
    if (!isOpen || activeTag !== "people" || debouncedPeopleQuery.length < 2) {
      startTransition(() => {
        setResolvedPeopleSearchState(undefined);
      });
      return;
    }

    if (peopleSearchResults !== undefined) {
      startTransition(() => {
        setResolvedPeopleSearchState({
          query: debouncedPeopleQuery,
          results: peopleSearchResults,
        });
      });
    }
  }, [activeTag, debouncedPeopleQuery, isOpen, peopleSearchResults]);

  useEffect(() => {
    if (!isOpen || activeTag !== null) {
      startTransition(() => {
        setResolvedPageSearchResults(undefined);
      });
      return;
    }

    if (pageSearchResults !== undefined) {
      startTransition(() => {
        setResolvedPageSearchResults(pageSearchResults);
      });
    }
  }, [activeTag, isOpen, pageSearchResults]);

  useEffect(() => {
    if (!isOpen || activeTag !== "template") {
      startTransition(() => {
        setResolvedTemplateSearchResults(undefined);
        setTemplateActionError(null);
      });
      return;
    }

    if (templateSearchResults !== undefined) {
      startTransition(() => {
        setResolvedTemplateSearchResults(templateSearchResults);
      });
    }
  }, [activeTag, isOpen, setTemplateActionError, templateSearchResults]);

  return {
    normalizedSearchQuery,
    visiblePeopleSearchResults,
    visiblePageSearchResults,
    visibleTemplateSearchResults,
    isLoadingPeople,
    isLoadingPages,
    isLoadingTemplates,
  };
};
