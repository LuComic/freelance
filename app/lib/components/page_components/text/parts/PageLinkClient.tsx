"use client";

import Link from "next/link";
import type { PageComponentInstanceByType } from "@/lib/pageDocument";
import type { ProjectPageOption } from "./PageLink";

type PageLinkClientProps = {
  config: PageComponentInstanceByType<"PageLink">["config"];
  projectSlug: string;
  targetPage: ProjectPageOption | null;
};

export const PageLinkClient = ({
  config,
  projectSlug,
  targetPage,
}: PageLinkClientProps) => {
  const trimmedText = config.text.trim();

  if (!trimmedText) {
    return null;
  }

  if (!targetPage) {
    return (
      <span className="mb-1 w-max text-(--gray-page) underline underline-offset-4">
        {trimmedText}
      </span>
    );
  }

  return (
    <Link
      href={`/projects/${projectSlug}/${targetPage.slug}`}
      className="w-max text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover) page-link-selected"
    >
      {trimmedText}
    </Link>
  );
};
