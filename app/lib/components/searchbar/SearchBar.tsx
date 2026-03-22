"use client";

import { api } from "@/convex/_generated/api";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { PersonModal } from "./PersonModal";
import { SearchBarItem } from "./SearchBarItem";
import { useSearchBar } from "./SearchBarContext";
import {
  PLACEHOLDER_TEMPLATES,
  type SearchPerson,
  type SearchTemplate,
} from "./SearchBarData";
import { TemplateModal } from "./TemplateModal";

type SearchItem = {
  key: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onSelect: () => void;
};

type SearchPageResult = {
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

export const SearchBar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SearchTemplate | null>(null);
  const [debouncedPeopleQuery, setDebouncedPeopleQuery] = useState("");
  const [resolvedPeopleSearchState, setResolvedPeopleSearchState] = useState<{
    query: string;
    results: SearchPerson[];
  }>();
  const [resolvedPageSearchResults, setResolvedPageSearchResults] = useState<
    SearchPageResult[] | undefined
  >(undefined);
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen,
    activeTag,
    personModalInviteDefaults,
    personModalPerson,
    peopleSearchSelectHandler,
    searchInviteDefaults,
    openSearch,
    openPersonModal,
    closeSearch,
    closePersonModal,
    clearTag,
  } = useSearchBar();
  const deferredSearchQuery = useDeferredValue(
    activeTag === null ? searchQuery : "",
  );
  const normalizedSearchQuery = searchQuery.trim();
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
  const pageSearchResults = useQuery(
    api.search.queries.searchPagesAcrossProjects,
    pageSearchArgs,
  );
  const peopleSearchResults = useQuery(
    api.search.queries.searchPeople,
    peopleSearchArgs,
  );
  const visiblePeopleSearchResults =
    peopleSearchResults ?? resolvedPeopleSearchState?.results ?? [];
  const visiblePageSearchResults =
    pageSearchResults ?? resolvedPageSearchResults ?? [];
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

  const filteredTemplates = PLACEHOLDER_TEMPLATES.filter((template) => {
    const normalizedQuery = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(normalizedQuery) ||
      template.author.toLowerCase().includes(normalizedQuery)
    );
  });

  const searchItems: SearchItem[] =
    activeTag === "people"
      ? visiblePeopleSearchResults.map((person) => ({
          key: String(person.userId),
          title: person.name,
          subtitle: person.email ?? undefined,
          onSelect: () => {
            if (peopleSearchSelectHandler) {
              peopleSearchSelectHandler(person);
            } else {
              openPersonModal(person, searchInviteDefaults ?? undefined);
            }
            closeSearch();
            setSearchQuery("");
            setSelectedIndex(0);
          },
        }))
      : activeTag === "template"
        ? filteredTemplates.map((template) => ({
            key: template.name,
            title: template.name,
            subtitle: `by ${template.author}`,
            badge: `${template.templateType} template`,
            onSelect: () => {
              setSelectedTemplate(template);
              closeSearch();
              setSearchQuery("");
              setSelectedIndex(0);
            },
          }))
        : visiblePageSearchResults.map((page) => ({
            key: `${page.projectId}:${page.pageId}`,
            title: page.pageTitle,
            subtitle: page.projectName,
            onSelect: () => {
              closeSearch();
              setSearchQuery("");
              setSelectedIndex(0);
              router.push(`/projects/${page.projectSlug}/${page.pageSlug}`);
            },
          }));
  const selectedSearchItemIndex =
    searchItems.length === 0
      ? 0
      : Math.min(selectedIndex, searchItems.length - 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        closeSearch();
        setSearchQuery("");
        setSelectedIndex(0);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchItems.length - 1 ? prev + 1 : prev,
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }

      if (e.key === "Enter" && searchItems.length > 0) {
        e.preventDefault();
        searchItems[selectedSearchItemIndex]?.onSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch, isOpen, openSearch, searchItems, selectedSearchItemIndex]);

  useEffect(() => {
    if (searchItems.length === 0) return;
    selectedItemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [searchItems.length, selectedSearchItemIndex]);

  const emptyMessage =
    activeTag === "people"
      ? normalizedSearchQuery.length < 2
        ? "Type at least 2 characters"
        : isLoadingPeople
          ? "Searching people..."
          : "No people found"
      : activeTag === "template"
        ? "No templates found"
        : isLoadingPages
          ? "Loading pages..."
          : normalizedSearchQuery.length === 0
            ? "No pages yet"
            : "No pages found";
  const personModalKey = personModalPerson
    ? [
        personModalPerson.userId,
        personModalInviteDefaults?.projectId ?? "",
        personModalInviteDefaults?.role ?? "",
        personModalInviteDefaults?.expandInviteSection
          ? "expanded"
          : "collapsed",
      ].join(":")
    : "person-modal";

  return (
    <>
      {personModalPerson ? (
        <PersonModal
          key={personModalKey}
          person={personModalPerson}
          inviteDefaults={personModalInviteDefaults}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              closePersonModal();
            }
          }}
        />
      ) : null}
      <TemplateModal
        template={selectedTemplate}
        open={selectedTemplate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTemplate(null);
          }
        }}
      />
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center pt-[10vh] bg-black/60"
          onClick={() => {
            closeSearch();
            setSearchQuery("");
            setSelectedIndex(0);
          }}
        >
          <div
            className="w-full max-w-2xl bg-(--darkest) rounded-xl overflow-hidden border border-(--gray)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-(--darkest-hover)">
              <Search size={20} color="var(--gray)" />
              {activeTag ? (
                <span className="rounded-md border border-(--vibrant) bg-(--vibrant)/10 px-2 h-full text-sm">
                  {activeTag}
                </span>
              ) : null}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    searchQuery.length === 0 &&
                    activeTag
                  ) {
                    e.preventDefault();
                    clearTag();
                  }
                }}
                placeholder={
                  activeTag === "people"
                    ? "Search for users..."
                    : activeTag === "template"
                      ? "Search templates..."
                      : "Search pages across projects..."
                }
                className="flex-1 bg-transparent text-(--light) text-base outline-none placeholder:text-(--gray)"
                autoFocus
              />
              <KbdGroup>
                <Kbd className="bg-(--gray) text-(--light)">Ctrl + P</Kbd>
              </KbdGroup>
            </div>

            <div className="flex flex-col gap-1 w-full max-h-96 overflow-y-auto p-2">
              {searchItems.length > 0 ? (
                searchItems.map((item, index) => (
                  <SearchBarItem
                    key={item.key}
                    ref={
                      index === selectedSearchItemIndex ? selectedItemRef : null
                    }
                    title={item.title}
                    subtitle={item.subtitle}
                    badge={item.badge}
                    isSelected={index === selectedSearchItemIndex}
                    onClick={item.onSelect}
                  />
                ))
              ) : (
                <div className="px-4 py-8 text-center text-(--gray)">
                  {emptyMessage}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-(--darkest-hover) flex items-center gap-6 text-sm text-(--gray)">
              <div className="flex items-center gap-2">
                <Kbd className="bg-(--gray) text-(--light)">esc</Kbd>
                <span>close</span>
              </div>
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd className="bg-(--gray) text-(--light)">↓</Kbd>
                  <Kbd className="bg-(--gray) text-(--light)">↑</Kbd>
                </KbdGroup>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd className="bg-(--gray) text-(--light)">↵</Kbd>
                <span>open</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
