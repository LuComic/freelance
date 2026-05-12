"use client";

import { api } from "@/convex/_generated/api";
import type { ConvexReactClient } from "convex/react";
import type {
  PageTemplateBlueprint,
  ProjectTemplateBlueprint,
} from "@/lib/templateBlueprint";
import { getProjectPagePath } from "../project/paths";
import type { PersonInviteDefaults } from "./SearchBarContext";
import type { SearchPageResult } from "./SearchBarHelpers";
import type {
  SearchPerson,
  SearchTemplate,
  SearchTemplateSummary,
} from "./SearchBarData";

export type SearchItem = {
  key: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onSelect: () => void;
};

export const handleTemplateSelect = async ({
  convex,
  template,
  templateSearchSelectHandler,
  closeSearch,
  setSearchQuery,
  setSelectedIndex,
  setSelectedTemplate,
  setTemplateActionError,
  setIsLoadingTemplatePreview,
}: {
  convex: ConvexReactClient;
  template: SearchTemplateSummary;
  templateSearchSelectHandler: ((template: SearchTemplate) => void) | null;
  closeSearch: () => void;
  setSearchQuery: (value: string) => void;
  setSelectedIndex: (value: number) => void;
  setSelectedTemplate: (template: SearchTemplate | null) => void;
  setTemplateActionError: (value: string | null) => void;
  setIsLoadingTemplatePreview: (value: boolean) => void;
}) => {
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
      error instanceof Error ? error.message : "Could not open this template.",
    );
  } finally {
    setIsLoadingTemplatePreview(false);
  }
};

export const getSearchItems = ({
  activeTag,
  visiblePeopleSearchResults,
  visibleTemplateSearchResults,
  prioritizedPageSearchResults,
  peopleSearchSelectHandler,
  searchInviteDefaults,
  openPersonModal,
  closeSearch,
  setSearchQuery,
  setSelectedIndex,
  routerPush,
  onTemplateSelect,
}: {
  activeTag: "people" | "template" | null;
  visiblePeopleSearchResults: SearchPerson[];
  visibleTemplateSearchResults: SearchTemplateSummary[];
  prioritizedPageSearchResults: SearchPageResult[];
  peopleSearchSelectHandler: ((person: SearchPerson) => void) | null;
  searchInviteDefaults: PersonInviteDefaults | null;
  openPersonModal: (
    person: SearchPerson,
    inviteDefaults?: PersonInviteDefaults,
  ) => void;
  closeSearch: () => void;
  setSearchQuery: (value: string) => void;
  setSelectedIndex: (value: number) => void;
  routerPush: (href: string) => void;
  onTemplateSelect: (template: SearchTemplateSummary) => void;
}): SearchItem[] =>
  activeTag === "people"
    ? visiblePeopleSearchResults.map((person) => ({
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
      ? visibleTemplateSearchResults.map((template) => ({
          key: String(template.id),
          title: template.name,
          subtitle: `by ${template.author}`,
          badge: `${template.templateType} template`,
          onSelect: () => onTemplateSelect(template),
        }))
      : prioritizedPageSearchResults.map((page) => ({
          key: `${page.projectId}:${page.pageId}`,
          title: page.pageTitle,
          subtitle: page.projectName,
          onSelect: () => {
            closeSearch();
            setSearchQuery("");
            setSelectedIndex(0);
            routerPush(getProjectPagePath(page.projectId, page.pageId));
          },
        }));
