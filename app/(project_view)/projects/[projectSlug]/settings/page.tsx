"use client";

import { useParams } from "next/navigation";
import { ProjectDangerSection } from "@/app/lib/components/project/settings/ProjectDangerSection";
import { ProjectEmailListSection } from "@/app/lib/components/project/settings/ProjectEmailListSection";
import { ProjectGeneralSection } from "@/app/lib/components/project/settings/ProjectGeneralSection";
import { useProjectSettingsController } from "@/app/lib/components/project/settings/useProjectSettingsController";
import { useSearchBar } from "@/app/lib/components/searchbar/SearchBarContext";

export default function SettingsPage() {
  const params = useParams<{ projectSlug: string }>();
  const projectSlug = params.projectSlug;
  const { openTaggedSearch } = useSearchBar();
  const {
    projectData,
    projectMembers,
    joinCode,
    canRegenerateJoinCode,
    joinCodeError,
    isJoinCodeLoading,
    isRegeneratingJoinCode,
    currentProjectName,
    canManageMembers,
    canRemoveMembers,
    canDeleteProject,
    canLeaveProject,
    nameDraft,
    setNameDraft,
    canSaveName,
    renameError,
    isSavingName,
    handleProjectRename,
    deleteError,
    isDeleteConfirming,
    isDeletingProject,
    leaveError,
    isLeaveConfirming,
    isLeavingProject,
    memberActionError,
    pendingMemberRemovalUserId,
    handleDeleteProject,
    handleLeaveProject,
    handleRemoveProjectMember,
    handleRegenerateJoinCode,
  } = useProjectSettingsController(projectSlug);

  const project = projectData?.project ?? null;
  const clients =
    projectMembers?.clients.map((member) => ({
      userId: member.userId,
      name: member.name,
    })) ?? [];
  const coCreators =
    projectMembers?.coCreators.map((member) => ({
      userId: member.userId,
      name: member.name,
    })) ?? [];

  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">
          Project Settings
        </p>
      </div>
      <p className="text-(--gray-page)">
        Manage project details, collaborators, and platform settings for this
        workspace.
      </p>
      <p className="text-(--gray-page)">
        Owner: {projectData?.project.owner.name ?? "Loading..."}
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
          members={clients}
          joinCode={isJoinCodeLoading ? null : joinCode}
          canCopyJoinCode={!isJoinCodeLoading}
          canRegenerateJoinCode={canRegenerateJoinCode}
          isRegeneratingJoinCode={isRegeneratingJoinCode}
          canManage={canManageMembers}
          canRemove={canRemoveMembers}
          pendingRemovalUserId={pendingMemberRemovalUserId}
          error={joinCodeError ?? memberActionError}
          onRemove={(userId) => void handleRemoveProjectMember(userId)}
          onRegenerateJoinCode={() => void handleRegenerateJoinCode()}
          onManage={() => {
            if (!project) {
              return;
            }

            openTaggedSearch("people", {
              projectId: project.id,
              projectName: project.name,
              role: "client",
              expandInviteSection: false,
            });
          }}
          shaded={true}
        />
        <ProjectEmailListSection
          title="Co-creators"
          currentLabel="Current co-creators"
          manageLabel="Manage co-creators"
          members={coCreators}
          canManage={canManageMembers}
          canRemove={canRemoveMembers}
          pendingRemovalUserId={pendingMemberRemovalUserId}
          error={memberActionError}
          onRemove={(userId) => void handleRemoveProjectMember(userId)}
          onManage={() => {
            if (!project) {
              return;
            }

            openTaggedSearch("people", {
              projectId: project.id,
              projectName: project.name,
              role: "coCreator",
              expandInviteSection: false,
            });
          }}
        />
        <ProjectDangerSection
          isLoading={projectData === undefined}
          isUnavailable={projectData === null}
          canDeleteProject={canDeleteProject}
          canLeaveProject={canLeaveProject}
          isDeletingProject={isDeletingProject}
          isDeleteConfirming={isDeleteConfirming}
          isLeavingProject={isLeavingProject}
          isLeaveConfirming={isLeaveConfirming}
          deleteError={deleteError}
          leaveError={leaveError}
          onDelete={handleDeleteProject}
          onLeave={handleLeaveProject}
        />
      </div>
    </>
  );
}
