"use client";

import { InputDropdown } from "@/app/lib/components/analytics/InputDropdown";
import type { AnalyticsPageData } from "@/app/lib/components/analytics/types";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AnalyticsPage() {
  const params = useParams<{ projectSlug: string }>();
  const router = useRouter();
  const projectSlug = params.projectSlug;
  const [projectIdSnapshot, setProjectIdSnapshot] = useState<string | null>(
    null,
  );
  const [resolvedProjectSlugSnapshot, setResolvedProjectSlugSnapshot] =
    useState<string | null>(null);
  const [pendingRouteProjectId, setPendingRouteProjectId] = useState<
    string | null
  >(null);
  const lastRouteCorrectionKeyRef = useRef<string | null>(null);
  const canUseProjectIdFallback =
    projectIdSnapshot !== null &&
    (resolvedProjectSlugSnapshot === projectSlug ||
      pendingRouteProjectId === projectIdSnapshot);
  const data = useQuery(
    api.pageRuntime.analytics.getProjectAnalyticsBySlug,
    projectSlug
      ? {
          projectSlug,
          projectId: canUseProjectIdFallback
            ? (projectIdSnapshot as never)
            : undefined,
        }
      : "skip",
  ) as AnalyticsPageData | null | undefined;

  useEffect(() => {
    if (data === null) {
      queueMicrotask(() => {
        router.replace("/projects");
        router.refresh();
      });
      return;
    }

    if (!data) {
      return;
    }

    queueMicrotask(() => {
      setProjectIdSnapshot(data.project.id);
      setResolvedProjectSlugSnapshot(data.project.slug);
    });
  }, [data, router]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (projectSlug !== data.project.slug) {
      const correctionKey = `${data.project.id}:${data.project.slug}`;

      if (lastRouteCorrectionKeyRef.current === correctionKey) {
        return;
      }

      lastRouteCorrectionKeyRef.current = correctionKey;
      queueMicrotask(() => {
        setPendingRouteProjectId(data.project.id);
        window.history.replaceState(
          window.history.state,
          "",
          `/projects/${data.project.slug}/analytics`,
        );
      });
      return;
    }

    lastRouteCorrectionKeyRef.current = null;
  }, [data, projectSlug]);

  useEffect(() => {
    if (
      pendingRouteProjectId !== null &&
      data &&
      projectSlug === data.project.slug
    ) {
      queueMicrotask(() => {
        setPendingRouteProjectId(null);
      });
    }
  }, [data, pendingRouteProjectId, projectSlug]);

  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Analytics</p>
      </div>
      <p className="text-(--gray-page)">
        Here you can see the most recent live-mode changes project members have
        made and what options are currently selected. All of these come from
        Input components.
      </p>

      <div className="w-full border-b border-(--gray) pb-2">
        <p className="@[40rem]:text-xl text-lg font-medium">Current inputs</p>
      </div>
      <div className="flex flex-col items-start justify-start w-full">
        {data === undefined ? (
          <p className="text-(--gray-page)">Loading inputs...</p>
        ) : data === null ? (
          <p className="text-(--gray-page)">Redirecting to projects...</p>
        ) : data.inputs.length === 0 ? (
          <p className="text-(--gray-page)">No pages found for this project.</p>
        ) : (
          data.inputs.map((item, index) => (
            <InputDropdown
              key={`${item.page}-${index}`}
              item={item}
              index={index}
            />
          ))
        )}
      </div>

      <div className="w-full border-b border-(--gray) pb-2">
        <p className="@[40rem]:text-xl text-lg font-medium">Latest changes</p>
      </div>
      <div className="flex flex-col items-start justify-start w-full">
        {data === undefined ? (
          <p className="text-(--gray-page)">Loading latest changes...</p>
        ) : data === null ? (
          <p className="text-(--gray-page)">Redirecting to projects...</p>
        ) : data.latestChanges.length === 0 ? (
          <p className="text-(--gray-page)">No tracked live changes yet.</p>
        ) : (
          data.latestChanges.map((item, index) => (
            <div
              key={item.id}
              className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
            >
              <div className="flex items-center justify-start gap-2 text-(--gray-page)">
                <p className="font-medium @[40rem]:text-lg text-base text-(--light)">
                  {item.page}
                </p>
                <p>/</p>
                <p>{item.title}</p>
                <p>/</p>
                <p>by {item.actorName}</p>
              </div>
              <div className="flex flex-col gap-2">
                {item.entries.map((entry, entryIndex) => (
                  <div
                    key={`${item.id}-${entry.kind}-${entryIndex}`}
                    className={`w-full rounded-md px-2 py-1 ${
                      entry.kind === "removed"
                        ? "border border-(--declined-border) bg-(--declined-bg)/10"
                        : "border border-(--accepted-border) bg-(--accepted-bg)/10"
                    }`}
                  >
                    <span
                      className={`mr-2 ${
                        entry.kind === "removed"
                          ? "text-(--declined-border)"
                          : "text-(--accepted-border)"
                      }`}
                    >
                      {entry.kind === "removed" ? "-" : "+"}
                    </span>
                    {entry.value}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
