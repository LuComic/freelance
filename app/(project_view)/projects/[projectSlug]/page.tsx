"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProjectPage() {
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
    api.projects.queries.getProjectRootBySlug,
    projectSlug
      ? {
          projectSlug,
          projectId: canUseProjectIdFallback
            ? (projectIdSnapshot as never)
            : undefined,
        }
      : "skip",
  );

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
          `/projects/${data.project.slug}`,
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
        <h1 className="@[40rem]:text-3xl text-xl font-medium">
          {data?.project.name ?? "Loading project..."}
        </h1>
      </div>
      <p className="text-(--gray-page)">
        This is the project overview. Open a page to either edit or view it.
      </p>
      <div className="rounded-xl border border-dashed border-(--gray) bg-(--gray)/10 p-4 flex flex-col gap-2">
        {data === undefined ? (
          <p className="text-(--gray-page)">Loading pages...</p>
        ) : data === null ? (
          <p className="text-(--gray-page)">Redirecting to projects...</p>
        ) : data.pages.length > 0 ? (
          <>
            <p className="font-medium">Pages</p>
            {data.pages.map((page) => (
              <Link
                key={page.id}
                href={`/projects/${data.project.slug}/${page.slug}`}
                className="text-(--gray-page) hover:text-(--vibrant)"
              >
                {page.title}
              </Link>
            ))}
          </>
        ) : (
          <p className="text-(--gray-page)">No pages found for this project.</p>
        )}
      </div>
    </>
  );
}
