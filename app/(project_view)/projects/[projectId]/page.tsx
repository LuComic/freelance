"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageNavigationLink } from "@/app/lib/components/project/PageNavigationLink";

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;
  const data = useQuery(
    api.projects.queries.getProjectRoot,
    projectId ? { projectId: projectId as never } : "skip",
  );

  useEffect(() => {
    if (data === null) {
      queueMicrotask(() => {
        router.replace("/projects");
        router.refresh();
      });
    }
  }, [data, router]);

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
              <PageNavigationLink
                key={page.id}
                projectId={data.project.id}
                pageId={page.id}
                className="text-(--gray-page) hover:text-(--vibrant)"
              >
                {page.title}
              </PageNavigationLink>
            ))}
          </>
        ) : (
          <p className="text-(--gray-page)">No pages found for this project.</p>
        )}
      </div>
    </>
  );
}
