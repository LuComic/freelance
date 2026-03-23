"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPageTemplateBlueprint,
  createProjectTemplateBlueprint,
  getOrderedTemplateItemLabels,
} from "@/lib/templateBlueprint";
import type { PageDocumentV1 } from "@/lib/pageDocument";
import { SavePageTemplate } from "./SavePageTemplate";
import { SaveProjectTemplate } from "./SaveProjectTemplate";
import type { TemplatePage } from "../searchbar/SearchBarData";
import { useOptionalPageDocument } from "./PageDocumentContext";

type SaveTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ProjectTemplateSourcePage = {
  id: string;
  title: string;
  document: PageDocumentV1;
  components: string[];
};

export const SaveTemplateModal = ({
  open,
  onOpenChange,
}: SaveTemplateModalProps) => {
  const pageDocument = useOptionalPageDocument();
  const hasActivePage = Boolean(
    pageDocument?.activePage && pageDocument.document,
  );
  const activeProjectId = hasActivePage
    ? pageDocument!.activePage!.project.id
    : null;
  const saveTemplate = useMutation(api.templates.mutations.saveTemplate);
  const projectTemplateSource = useQuery(
    api.templates.queries.getProjectTemplateSource,
    open && hasActivePage
      ? {
          projectId: activeProjectId as never,
        }
      : "skip",
  );
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateType, setTemplateType] = useState<"page" | "project">("page");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);
  const currentPagePreview = useMemo<TemplatePage | null>(
    () =>
      pageDocument?.activePage && pageDocument.document
        ? {
            title: pageDocument.activePage.page.title || "Current page",
            description: "",
            components: getOrderedTemplateItemLabels(pageDocument.document),
          }
        : null,
    [pageDocument],
  );
  const projectPagesPreview = useMemo<ProjectTemplateSourcePage[]>(() => {
    if (!pageDocument?.activePage || !pageDocument.document) {
      return [];
    }

    const activePageSummary = {
      id: pageDocument.activePage.page.id,
      title: pageDocument.activePage.page.title,
      document: pageDocument.document,
      components: getOrderedTemplateItemLabels(pageDocument.document),
    };
    const sourcePages = (projectTemplateSource?.pages ??
      []) as ProjectTemplateSourcePage[];

    if (sourcePages.length === 0) {
      return [activePageSummary];
    }

    return sourcePages.map((page: ProjectTemplateSourcePage) =>
      page.id === activePageSummary.id ? activePageSummary : page,
    );
  }, [pageDocument, projectTemplateSource]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [closeModal, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTemplateName("");
    setTemplateDescription("");
    setTemplateType("page");
    setVisibility("private");
    setError(null);
    setIsSaving(false);
  }, [open]);

  const handleSave = async () => {
    if (
      !templateName.trim() ||
      isSaving ||
      !pageDocument?.activePage ||
      !pageDocument.document
    ) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const blueprint =
        templateType === "page"
          ? createPageTemplateBlueprint(pageDocument.document)
          : createProjectTemplateBlueprint(projectPagesPreview);

      await saveTemplate({
        name: templateName,
        description: templateDescription || undefined,
        visibility,
        blueprint,
      });
      closeModal();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save this template.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="w-full max-h-[85vh] h-auto flex flex-col items-start justify-start gap-2 p-3 md:max-w-3xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="md:text-3xl text-xl font-medium">Save Template</p>
            <p className="text-(--gray-page)">
              Save this structure as a reusable template with placeholder text
              for editable fields.
            </p>
          </div>
        </div>

        <div className="w-full border-y border-(--gray) py-3 flex flex-col gap-2">
          <p className="text-(--gray-page)">Template type</p>
          <div className="w-full flex items-center gap-4">
            {(["page", "project"] as const).map((type) => {
              const selected = templateType === type;

              return (
                <button
                  key={type}
                  type="button"
                  className="flex items-center gap-2 justify-start"
                  onClick={() => setTemplateType(type)}
                >
                  <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--dim)">
                    {selected ? (
                      <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                    ) : null}
                  </span>
                  <span className="capitalize">{type} template</span>
                </button>
              );
            })}
          </div>

          <p className="text-(--gray-page)">Template name</p>
          <input
            type="text"
            className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
            placeholder="Template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />

          <p className="text-(--gray-page)">Template description</p>
          <textarea
            rows={3}
            className="rounded-md bg-(--dim) px-2 py-1.5 outline-none resize-none"
            placeholder="Template description..."
            value={templateDescription}
            onChange={(event) => setTemplateDescription(event.target.value)}
          />

          <p className="text-(--gray-page)">Visibility</p>
          <Select
            value={visibility}
            onValueChange={(value) =>
              setVisibility(value as "private" | "public")
            }
          >
            <SelectTrigger className="w-full bg-(--qutie-dark) border-(--gray)">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent className="bg-(--quite-dark) border-none text-(--gray-page)">
              <SelectGroup className="bg-(--quite-dark)">
                <SelectItem
                  value="private"
                  className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                >
                  Private
                </SelectItem>
                <SelectItem
                  value="public"
                  className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                >
                  Public
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full flex flex-col gap-2">
          {templateType === "page" ? (
            currentPagePreview ? (
              <SavePageTemplate page={currentPagePreview} />
            ) : (
              <p className="text-(--gray-page)">
                Open a project page to save a template.
              </p>
            )
          ) : projectTemplateSource === undefined ? (
            <p className="text-(--gray-page)">Loading project pages...</p>
          ) : (
            <SaveProjectTemplate
              pages={projectPagesPreview.map(
                (page: ProjectTemplateSourcePage) => ({
                  title: page.title,
                  description: "",
                  components: page.components,
                }),
              )}
            />
          )}
        </div>

        {error ? (
          <p className="text-sm text-(--declined-border)">{error}</p>
        ) : null}

        <div className="w-full flex items-center gap-1">
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void handleSave()}
            disabled={
              !hasActivePage ||
              !templateName.trim() ||
              isSaving ||
              (templateType === "project" &&
                projectTemplateSource === undefined)
            }
          >
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
};
