import { formatSlugLabel } from "@/app/lib/components/project/projectSlug";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const projectTitle = formatSlugLabel(projectSlug);

  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <h1 className="@[40rem]:text-3xl text-xl font-medium">{projectTitle}</h1>
      </div>
      <p className="text-(--gray-page)">
        This is the project workspace root. Project pages now live under the
        project slug, for example `/projects/{projectSlug}/your-page-slug`.
      </p>
      <div className="rounded-xl border border-dashed border-(--gray) bg-(--gray)/5 p-4 flex flex-col gap-2">
        <p className="font-medium">Project structure</p>
        <code className="text-(--gray-page)">/projects/{projectSlug}</code>
        <code className="text-(--gray-page)">
          /projects/{projectSlug}/analytics
        </code>
        <code className="text-(--gray-page)">
          /projects/{projectSlug}/settings
        </code>
        <code className="text-(--gray-page)">
          /projects/{projectSlug}/[pageSlug]
        </code>
      </div>
    </>
  );
}
