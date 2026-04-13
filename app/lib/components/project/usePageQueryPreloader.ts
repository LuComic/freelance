"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getProjectPagePath } from "./paths";

const PAGE_QUERY_PREWARM_MS = 15_000;
const recentPagePrewarmTimestamps = new Map<string, number>();

export function usePageQueryPreloader() {
  const router = useRouter();
  const convex = useConvex();

  return useCallback(
    (projectId: string, pageId: string) => {
      const now = Date.now();
      const cacheKey = `${projectId}:${pageId}`;
      const lastPrewarmAt = recentPagePrewarmTimestamps.get(cacheKey);

      router.prefetch(getProjectPagePath(projectId, pageId));

      if (
        lastPrewarmAt !== undefined &&
        now - lastPrewarmAt < PAGE_QUERY_PREWARM_MS
      ) {
        return;
      }

      recentPagePrewarmTimestamps.set(cacheKey, now);
      const prewarmPageQuery = () => {
        convex.prewarmQuery({
          query: api.pages.queries.getPageEditor,
          args: {
            projectId: projectId as never,
            pageId: pageId as never,
          },
          extendSubscriptionFor: PAGE_QUERY_PREWARM_MS,
        });
      };

      if (typeof window === "undefined") {
        prewarmPageQuery();
        return;
      }

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(prewarmPageQuery, { timeout: 250 });
        return;
      }

      setTimeout(prewarmPageQuery, 0);
    },
    [convex, router],
  );
}
