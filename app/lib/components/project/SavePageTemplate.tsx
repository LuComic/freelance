"use client";

import type { TemplatePage } from "../searchbar/SearchBarData";

type SavePageTemplateProps = {
  page: TemplatePage;
};

export const SavePageTemplate = ({ page }: SavePageTemplateProps) => {
  return (
    <div className="w-full flex flex-col gap-2">
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
  );
};
