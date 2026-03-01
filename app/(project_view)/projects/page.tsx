"use client";

import { api } from "@/convex/_generated/api";
import { CreateProjectModal } from "@/app/lib/components/project/CreateProjectModal";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function Page() {
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);

  return (
    <div className="h-full @[40rem]:max-w-2/3 mx-auto w-full flex flex-col gap-4 items-start justify-center">
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Welcome back!</p>
      </div>

      <div className="flex @[64rem]:flex-row flex-col items-start @[64rem]:items-center justify-center gap-2">
        <CreateProjectModal
          trigger={<span>Create project</span>}
          buttonClassName="rounded-md bg-(--vibrant) px-2 py-1 hover:bg-(--vibrant-hover)"
        />
        <span className="text-(--gray-page) @[64rem]:inline hidden">or</span>
        <span className="font-medium @[64rem]:mt-0 mt-4">Join via code</span>
        <form>
          <input
            type="text"
            placeholder="project code"
            className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
          />
          <button className="ml-2 rounded-md bg-(--vibrant) px-2 py-1 hover:bg-(--vibrant-hover)">
            Join
          </button>
        </form>
      </div>

      <div className="w-full flex flex-col items-start justify-start overflow-hidden rounded-md border border-(--gray)">
        <div className="w-full flex items-center justify-start p-2 bg-(--darkest) text-(--gray-page) border-b border-(--gray)">
          Projects
        </div>
        {projects === undefined ? (
          <div className="w-full p-4 text-(--gray-page)">
            Loading projects...
          </div>
        ) : projects.length > 0 ? (
          <div className="w-full flex flex-col">
            {projects.map((project) => (
              <div
                key={project.id}
                className="w-full p-3 border-b last:border-b-0 border-(--gray) flex flex-col gap-1"
              >
                <Link
                  href={
                    project.pages[0]
                      ? `/projects/${project.slug}/${project.pages[0].slug}`
                      : `/projects/${project.slug}`
                  }
                  className="font-medium hover:text-(--vibrant)"
                >
                  {project.name}
                </Link>
                {project.description ? (
                  <p className="text-(--gray-page)">{project.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full p-4 text-(--gray-page)">
            No projects yet. Create one to start working.
          </div>
        )}
      </div>
    </div>
  );
}
