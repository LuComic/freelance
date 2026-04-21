"use client";

import { api } from "@/convex/_generated/api";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { getCookie, SHOW_SUGGESTIONS_COOKIE } from "@/app/lib/cookies";
import type {
  PageTemplateBlueprint,
  ProjectTemplateBlueprint,
} from "@/lib/templateBlueprint";
import { useConvex } from "convex/react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/inputLimits";
import { getProjectPagePath } from "../project/paths";
import { PersonModal } from "./PersonModal";
import {
  getEmptyMessage,
  getPersonModalKey,
  getSearchPlaceholder,
  getTagCommandMatch,
  getTagGhostCompletion,
  type SearchPageResult,
  useSearchBarResults,
} from "./SearchBarHelpers";
import { SearchBarItem } from "./SearchBarItem";
import { useSearchBar } from "./SearchBarContext";
import type {
  SearchPerson,
  SearchTemplate,
  SearchTemplateSummary,
} from "./SearchBarData";
import { TemplateModal } from "./TemplateModal";

type SearchItem = {
  key: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onSelect: () => void;
};

export const SearchBar = () => {
  const convex = useConvex();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SearchTemplate | null>(null);
  const [isLoadingTemplatePreview, setIsLoadingTemplatePreview] =
    useState(false);
  const [templateActionError, setTemplateActionError] = useState<string | null>(
    null,
  );
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const pathnameSegments = pathname.split("/").filter(Boolean);
  const currentProjectId =
    pathnameSegments[0] === "projects" ? (pathnameSegments[1] ?? null) : null;
  const {
    isOpen,
    activeTag,
    personModalInviteDefaults,
    personModalPerson,
    peopleSearchSelectHandler,
    searchInviteDefaults,
    templateSearchTypes,
    templateSearchSelectHandler,
    openSearch,
    openTaggedSearch,
    openTemplateSearch,
    openPersonModal,
    closeSearch,
    closePersonModal,
    clearTag,
  } = useSearchBar();
  const {
    normalizedSearchQuery,
    visiblePeopleSearchResults,
    visiblePageSearchResults,
    visibleTemplateSearchResults,
    isLoadingPeople,
    isLoadingPages,
    isLoadingTemplates,
  } = useSearchBarResults({
    isOpen,
    activeTag,
    searchQuery,
    currentProjectId,
    searchInviteDefaults,
    templateSearchTypes,
    setTemplateActionError,
  });
  const tagGhostCompletion =
    activeTag === null ? getTagGhostCompletion(searchQuery) : null;
  const [commandSuggestions, setCommandSuggestions] = useState(false);
  const prioritizedPageSearchResults =
    activeTag === null &&
    normalizedSearchQuery.length === 0 &&
    currentProjectId !== null
      ? [
          ...visiblePageSearchResults.filter(
            (page) => page.projectId === currentProjectId,
          ),
          ...visiblePageSearchResults.filter(
            (page) => page.projectId !== currentProjectId,
          ),
        ].slice(0, 10)
      : visiblePageSearchResults;

  useEffect(() => {
    if (activeTag !== null) {
      return;
    }

    const tagCommandMatch = getTagCommandMatch(searchQuery);

    if (!tagCommandMatch) {
      return;
    }

    if (tagCommandMatch.tag === "people") {
      openTaggedSearch(
        "people",
        searchInviteDefaults ?? undefined,
        peopleSearchSelectHandler ?? undefined,
      );
    } else {
      openTemplateSearch({
        types: templateSearchTypes ?? undefined,
        selectHandler: templateSearchSelectHandler ?? undefined,
      });
    }

    setSearchQuery("");
    setSelectedIndex(0);
    setTemplateActionError(null);
  }, [
    activeTag,
    openTaggedSearch,
    openTemplateSearch,
    peopleSearchSelectHandler,
    searchInviteDefaults,
    searchQuery,
    templateSearchSelectHandler,
    templateSearchTypes,
  ]);

  const handleTemplateSelect = async (template: SearchTemplateSummary) => {
    setTemplateActionError(null);
    setIsLoadingTemplatePreview(true);

    try {
      const preview = await convex.query(
        api.templates.content.getTemplatePreview,
        {
          templateId: template.id,
        },
      );
      const typedPreview: SearchTemplate =
        preview.templateType === "page" && "page" in preview && preview.page
          ? {
              ...preview,
              templateType: "page",
              blueprint: preview.blueprint as PageTemplateBlueprint,
              page: preview.page,
            }
          : preview.templateType === "project" &&
              "pages" in preview &&
              preview.pages
            ? {
                ...preview,
                templateType: "project",
                blueprint: preview.blueprint as ProjectTemplateBlueprint,
                pages: preview.pages,
              }
            : (() => {
                throw new Error("Template preview shape is invalid.");
              })();

      closeSearch();
      setSearchQuery("");
      setSelectedIndex(0);

      if (templateSearchSelectHandler) {
        templateSearchSelectHandler(typedPreview);
      } else {
        setSelectedTemplate(typedPreview);
      }
    } catch (error) {
      setTemplateActionError(
        error instanceof Error
          ? error.message
          : "Could not open this template.",
      );
    } finally {
      setIsLoadingTemplatePreview(false);
    }
  };

  const searchItems: SearchItem[] =
    activeTag === "people"
      ? visiblePeopleSearchResults.map((person: SearchPerson) => ({
          key: String(person.userId),
          title: person.name,
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
        ? visibleTemplateSearchResults.map(
            (template: SearchTemplateSummary) => ({
              key: String(template.id),
              title: template.name,
              subtitle: `by ${template.author}`,
              badge: `${template.templateType} template`,
              onSelect: () => {
                void handleTemplateSelect(template);
              },
            }),
          )
        : prioritizedPageSearchResults.map((page: SearchPageResult) => ({
            key: `${page.projectId}:${page.pageId}`,
            title: page.pageTitle,
            subtitle: page.projectName,
            onSelect: () => {
              closeSearch();
              setSearchQuery("");
              setSelectedIndex(0);
              router.push(getProjectPagePath(page.projectId, page.pageId));
            },
          }));
  const selectedSearchItemIndex =
    searchItems.length === 0
      ? 0
      : Math.min(selectedIndex, searchItems.length - 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
        setSelectedIndex(0);
      }

      if (e.metaKey || e.ctrlKey) {
        setCommandSuggestions(getCookie(SHOW_SUGGESTIONS_COOKIE) !== "false");
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

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setCommandSuggestions(false);
      }
    };

    const handleWindowBlur = () => {
      setCommandSuggestions(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [closeSearch, isOpen, openSearch, searchItems, selectedSearchItemIndex]);

  useEffect(() => {
    if (searchItems.length === 0) return;
    selectedItemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [searchItems.length, selectedSearchItemIndex]);

  const emptyMessage = getEmptyMessage({
    activeTag,
    normalizedSearchQuery,
    isLoadingPeople,
    isLoadingPages,
    isLoadingTemplates,
  });
  const personModalKey = getPersonModalKey(
    personModalPerson,
    personModalInviteDefaults,
  );

  return (
    <>
      {commandSuggestions && (
        <div className="rounded-lg bg-(--darkest) text-(--gray-page) border border-(--gray) fixed z-10 bottom-5 right-5 flex-col hidden md:flex items-start justify-start px-2 py-1 w-max opacity-50 text-sm">
          <span>
            cmd/ctrl + k for <strong>Searchbar</strong>
          </span>
          <span>
            cmd/ctrl + b for <strong>Left Sidebar</strong>
          </span>
          <span>
            cmd/ctrl + shift + L for <strong>Right Sidebar</strong>
          </span>
        </div>
      )}
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
          className="fixed inset-0 z-40 flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-sm"
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
              <div className="relative flex-1">
                {tagGhostCompletion ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center text-base text-(--gray)">
                    <span className="invisible">{searchQuery}</span>
                    <span>{tagGhostCompletion.completion}</span>
                  </div>
                ) : null}

                <input
                  type="text"
                  value={searchQuery}
                  maxLength={MAX_SEARCH_QUERY_LENGTH}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                    setTemplateActionError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && tagGhostCompletion) {
                      e.preventDefault();
                      setSearchQuery(tagGhostCompletion.command);
                      setSelectedIndex(0);
                      setTemplateActionError(null);
                      return;
                    }

                    if (
                      e.key === "Backspace" &&
                      searchQuery.length === 0 &&
                      activeTag
                    ) {
                      e.preventDefault();
                      clearTag();
                    }
                  }}
                  placeholder={getSearchPlaceholder(activeTag)}
                  className="w-full bg-transparent text-(--light) text-base outline-none placeholder:text-(--gray)"
                  autoFocus
                />
              </div>
              <KbdGroup>
                <Kbd className="bg-(--gray) text-(--light)">Ctrl + K</Kbd>
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

            {templateActionError ? (
              <div className="px-4 pb-3 text-sm text-(--declined-border)">
                {templateActionError}
              </div>
            ) : null}

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
                <span>
                  {isLoadingTemplatePreview && activeTag === "template"
                    ? "loading..."
                    : "open"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
