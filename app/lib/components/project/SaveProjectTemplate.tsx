"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { TemplatePage } from "../searchbar/SearchBarData";

type SaveProjectTemplateProps = {
  pages: TemplatePage[];
};

export const SaveProjectTemplate = ({ pages }: SaveProjectTemplateProps) => {
  const [pageDropdowns, setPageDropdowns] = useState<boolean[]>(
    pages.map(() => false),
  );

  return (
    <div className="w-full flex flex-col">
      {pages.map((page, pageIndex) => (
        <div
          key={page.title}
          className={`${pageIndex % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
        >
          <button
            type="button"
            className="flex font-medium md:text-lg text-base items-center justify-start gap-2"
            onClick={() =>
              setPageDropdowns((prev) =>
                prev.map((value, index) =>
                  index === pageIndex ? !value : value,
                ),
              )
            }
          >
            <ChevronRight
              size={18}
              className={`${pageDropdowns[pageIndex] ? "rotate-90" : ""}`}
            />
            <span className="w-full text-left">{page.title}</span>
          </button>

          {pageDropdowns[pageIndex] ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                {page.components.map((componentName, componentIndex) => (
                  <div
                    key={`${page.title}-${componentName}-${componentIndex}`}
                    className="px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page)"
                  >
                    {componentName}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};
