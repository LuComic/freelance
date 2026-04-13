"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { getProjectPagePath } from "./paths";
import { usePageQueryPreloader } from "./usePageQueryPreloader";

type PageNavigationLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  projectId: string;
  pageId: string;
};

export function PageNavigationLink({
  projectId,
  pageId,
  onMouseEnter,
  onFocus,
  onTouchStart,
  onClick,
  ...props
}: PageNavigationLinkProps) {
  const preloadPage = usePageQueryPreloader();

  const prewarm = () => {
    preloadPage(projectId, pageId);
  };

  return (
    <Link
      {...props}
      href={getProjectPagePath(projectId, pageId)}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        prewarm();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        prewarm();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        prewarm();
      }}
      onClick={(event) => {
        onClick?.(event);
        prewarm();
      }}
    />
  );
}
