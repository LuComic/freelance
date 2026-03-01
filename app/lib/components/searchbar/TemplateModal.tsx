"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { SearchTemplate } from "./SearchBarData";

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
  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);
  const [pageDropdowns, setPageDropdowns] = useState<Record<string, boolean>>(
    {},
  );

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

  if (!open || !template) return null;

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
            <p className="md:text-3xl text-xl font-medium">{template.name}</p>
            <p className="text-(--gray-page)">by {template.author}</p>
          </div>
        </div>

        <div className="w-full border-y border-(--gray) py-3 flex flex-col gap-1">
          <p className="text-(--gray-page)">{template.templateType} template</p>
        </div>

        <div className="w-full flex flex-col gap-2">
          {template.templateType === "page" ? (
            <div className="w-full flex flex-col gap-2">
              <p className="font-medium">{template.page.title}</p>
              <p className="text-(--gray-page)">{template.page.description}</p>
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
                  key={page.title}
                  className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
                >
                  <button
                    type="button"
                    className="flex font-medium md:text-lg text-base items-center justify-start gap-2"
                    onClick={() =>
                      setPageDropdowns((prev) => ({
                        ...prev,
                        [page.title]: !prev[page.title],
                      }))
                    }
                  >
                    <ChevronRight
                      size={20}
                      className={`${pageDropdowns[page.title] ? "rotate-90" : "rotate-0"}`}
                    />
                    {page.title}
                  </button>

                  {pageDropdowns[page.title] ? (
                    <div className="pl-7 flex flex-col gap-2 pb-2">
                      <p className="text-(--gray-page)">{page.description}</p>
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
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20"
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
};
