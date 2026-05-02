"use client";

import type {
  FocusEventHandler,
  MouseEventHandler,
  ReactNode,
  TouchEventHandler,
} from "react";
import Link from "next/link";
import { getProjectPagePath } from "./paths";
import { usePageQueryPreloader } from "./usePageQueryPreloader";

type PageNavigationLinkProps = {
  projectId: string;
  pageId: string;
  name: string;
  icon?: ReactNode;
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  onTouchStart?: TouchEventHandler<HTMLAnchorElement>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function PageNavigationLink({
  projectId,
  pageId,
  name,
  icon,
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
      prefetch={false}
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
      }}
      onClick={(event) => {
        onClick?.(event);
      }}
    >
      {icon}
      {name}
    </Link>
  );
}
