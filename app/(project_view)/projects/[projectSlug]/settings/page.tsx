"use client";

import { useParams } from "next/navigation";
import { ProjectDangerSection } from "@/app/lib/components/project/settings/ProjectDangerSection";
import { ProjectEmailListSection } from "@/app/lib/components/project/settings/ProjectEmailListSection";
import { ProjectGeneralSection } from "@/app/lib/components/project/settings/ProjectGeneralSection";
import { useProjectSettingsController } from "@/app/lib/components/project/settings/useProjectSettingsController";

export default function SettingsPage() {
  const params = useParams<{ projectSlug: string }>();
  const projectSlug = params.projectSlug;
  const {
    projectData,
    currentProjectName,
    nameDraft,
    setNameDraft,
    canSaveName,
    renameError,
    isSavingName,
    handleProjectRename,
    deleteError,
    isDeleteConfirming,
    isDeletingProject,
    handleDeleteProject,
  } = useProjectSettingsController(projectSlug);

  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Project Settings</p>
      </div>
      <p className="text-(--gray-page)">
        Manage project details, collaborators, and platform settings for this
        workspace.
      </p>

      <div className="flex flex-col items-start justify-start w-full">
        <ProjectGeneralSection
          currentProjectName={currentProjectName}
          isLoading={projectData === undefined}
          isUnavailable={projectData === null}
          nameDraft={nameDraft}
          setNameDraft={setNameDraft}
          canSaveName={canSaveName}
          renameError={renameError}
          isSavingName={isSavingName}
          onRename={handleProjectRename}
        />
        <ProjectEmailListSection
          title="Clients"
          currentLabel="Current clients"
          manageLabel="Manage clients"
          placeholder="Add a client email..."
          initialValues={["alice@client.co", "brand-team@client.co"]}
          shaded
        />
        <ProjectEmailListSection
          title="Co-creators"
          currentLabel="Current co-creators"
          manageLabel="Manage co-creators"
          placeholder="Add a co-creator email..."
          initialValues={["marco@studio.co", "sara@studio.co"]}
        />
        <ProjectDangerSection
          isLoading={projectData === undefined}
          isUnavailable={projectData === null}
          isDeletingProject={isDeletingProject}
          isDeleteConfirming={isDeleteConfirming}
          deleteError={deleteError}
          onDelete={handleDeleteProject}
        />
      </div>
    </>
  );
}
