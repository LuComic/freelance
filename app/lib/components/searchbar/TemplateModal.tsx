"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { SearchTemplate } from "./SearchBarData";
import { useOptionalPageDocument } from "../project/PageDocumentContext";

type TemplateModalProps = {
  template: SearchTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TemplateModal = ({
  template,
  open,
  onOpenChange,
}: TemplateModalProps) => {
  const pageDocument = useOptionalPageDocument();
  const currentProfile = useQuery(api.users.queries.currentProfile);
  const applyProjectTemplate = useMutation(
    api.templates.mutations.applyProjectTemplate,
  );
  const deleteTemplate = useMutation(api.templates.mutations.deleteTemplate);
  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);
  const [pageDropdowns, setPageDropdowns] = useState<Record<string, boolean>>(
    {},
  );
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseTemplate = Boolean(pageDocument?.activePage);
  const canDeleteTemplate = currentProfile?.id === template?.authorUserId;

  const handleUseTemplate = async () => {
    if (!template || !pageDocument?.activePage || isApplying) {
      return;
    }

    setError(null);
    setIsApplying(true);

    try {
      if (template.templateType === "page") {
        await pageDocument.applyPageTemplate({
          templateId: template.id,
          expectedUpdatedAt: template.updatedAt,
        });
      } else {
        await applyProjectTemplate({
          projectId: pageDocument.activePage.project.id as never,
          templateId: template.id,
          expectedUpdatedAt: template.updatedAt,
        });
      }

      closeModal();
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Could not use this template.",
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!template || !canDeleteTemplate || isDeletingTemplate) {
      return;
    }

    if (!isDeleteConfirming) {
      setError(null);
      setIsDeleteConfirming(true);
      return;
    }

    setError(null);
    setIsDeletingTemplate(true);

    try {
      await deleteTemplate({
        templateId: template.id,
      });
      closeModal();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this template.",
      );
      setIsDeleteConfirming(false);
    } finally {
      setIsDeletingTemplate(false);
    }
  };

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
    setPageDropdowns({});
    setError(null);
    setIsApplying(false);
    setIsDeleteConfirming(false);
    setIsDeletingTemplate(false);
  }, [template]);

  if (!open || !template) return null;

  return (
    <div
      className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="w-full max-h-[85vh] h-auto flex flex-col items-start justify-start gap-3 p-3 md:max-w-3xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="md:text-3xl text-xl font-medium">{template.name}</p>
            <p className="text-(--gray-page)">by {template.author}</p>
          </div>
        </div>

        <div className="w-full border-y border-(--gray) py-3 flex items-center justify-between">
          <p className="text-(--gray-page) capitalize">
            {template.templateType} template
          </p>
          {canDeleteTemplate ? (
            <button
              type="button"
              className="w-max rounded-md border px-2 py-1 border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--declined-bg)/10"
              onClick={() => void handleDeleteTemplate()}
              disabled={isDeletingTemplate}
            >
              {isDeletingTemplate
                ? "Deleting..."
                : isDeleteConfirming
                  ? "Are you sure?"
                  : "Delete template"}
            </button>
          ) : null}
        </div>

        <p className="text-(--gray-page) border-b border-(--gray) pb-3 w-full">
          {template.description?.trim() || "No description provided."}
        </p>

        <div className="w-full flex flex-col gap-2">
          {template.templateType === "page" ? (
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                {template.page.components.map(
                  (componentName, componentIndex) => (
                    <div
                      key={`${componentName}-${componentIndex}`}
                      className="px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page)"
                    >
                      {componentName}
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col">
              {template.pages.map((page, index) => (
                <div
                  key={`${page.title}-${index}`}
                  className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
                >
                  <button
                    type="button"
                    className="flex font-medium md:text-lg text-base items-center justify-start gap-2"
                    onClick={() =>
                      setPageDropdowns((prev) => ({
                        ...prev,
                        [`${page.title}-${index}`]:
                          !prev[`${page.title}-${index}`],
                      }))
                    }
                  >
                    <ChevronRight
                      size={20}
                      className={`${pageDropdowns[`${page.title}-${index}`] ? "rotate-90" : "rotate-0"}`}
                    />
                    {page.title}
                  </button>

                  {pageDropdowns[`${page.title}-${index}`] ? (
                    <div className="pl-7 flex flex-col gap-2 pb-2">
                      <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                        {page.components.map(
                          (componentName, componentIndex) => (
                            <div
                              key={`${page.title}-${componentName}-${componentIndex}`}
                              className="px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page)"
                            >
                              {componentName}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {!canUseTemplate ? (
          <p className="text-sm text-(--declined-border)">
            Open a project page to use a template.
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-(--declined-border)">{error}</p>
        ) : null}

        <div className="w-full flex items-center gap-1">
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            type="button"
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canUseTemplate || isApplying}
            onClick={() => void handleUseTemplate()}
          >
            {isApplying ? "Using..." : "Use"}
          </button>
        </div>
      </div>
    </div>
  );
};
