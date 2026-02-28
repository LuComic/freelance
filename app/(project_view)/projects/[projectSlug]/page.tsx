"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams<{ projectSlug: string }>();
  const projectSlug = params.projectSlug;
  const data = useQuery(
    api.projects.queries.getProjectRootBySlug,
    projectSlug ? { projectSlug } : "skip",
  );

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
