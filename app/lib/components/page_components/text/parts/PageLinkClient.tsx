"use client";

import type { PageComponentInstanceByType } from "@/lib/pageDocument";
import {
  getPageLinkFallbackText,
  type ProjectPageOption,
} from "./PageLink.shared";
import { PageNavigationLink } from "@/app/lib/components/project/PageNavigationLink";

type PageLinkClientProps = {
  config: PageComponentInstanceByType<"PageLink">["config"];
  projectId: string;
  targetPage: ProjectPageOption | null;
};

export const PageLinkClient = ({
  config,
  projectId,
  targetPage,
}: PageLinkClientProps) => {
  const displayText =
    config.text.trim() || getPageLinkFallbackText(targetPage?.title);

  if (!targetPage) {
    return (
      <span className="mb-1 w-max text-(--gray-page) underline underline-offset-4">
        {displayText}
      </span>
    );
  }

  return (
    <PageNavigationLink
      projectId={projectId}
      pageId={targetPage.id}
      className="w-max text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover) page-link-selected"
    >
      {displayText}
    </PageNavigationLink>
  );
};
