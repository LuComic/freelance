"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

export function useProjectSettingsController(projectId: string) {
  const [nameDraft, setNameDraft] = useState("");
  const [savedNameSnapshot, setSavedNameSnapshot] = useState<string | null>(
    null,
  );
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savedDescriptionSnapshot, setSavedDescriptionSnapshot] = useState<
    string | null
  >(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(
    null,
  );
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isLeaveConfirming, setIsLeaveConfirming] = useState(false);
  const [isLeavingProject, setIsLeavingProject] = useState(false);
  const [pendingMemberRemovalUserId, setPendingMemberRemovalUserId] =
    useState<Id<"users"> | null>(null);
  const ensuredJoinCodeProjectIdRef = useRef<string | null>(null);
  const [joinCodeSnapshot, setJoinCodeSnapshot] = useState<string | null>(null);
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null);
  const [isEnsuringJoinCode, setIsEnsuringJoinCode] = useState(false);
  const [isRegeneratingJoinCode, setIsRegeneratingJoinCode] = useState(false);

  const redirectToProjectsIndex = () => {
    window.location.replace("/projects");
  };

  const projectData = useQuery(
    api.projects.queries.getProjectRoot,
    projectId ? { projectId: projectId as never } : "skip",
  );
  const renameProject = useMutation(api.projects.mutations.renameProject);
  const updateProjectDescription = useMutation(
    api.projects.mutations.updateProjectDescription,
  );
  const deleteProject = useMutation(api.projects.mutations.deleteProject);
  const leaveProject = useMutation(api.projects.mutations.leaveProject);
  const removeProjectMember = useMutation(
    api.projects.members.removeProjectMember,
  );
  const ensureProjectJoinCode = useMutation(
    api.projects.join.ensureProjectJoinCode,
  );
  const regenerateProjectJoinCode = useMutation(
    api.projects.join.regenerateProjectJoinCode,
  );
  const currentProjectName = projectData?.project.name ?? "";
  const currentProjectDescription = projectData?.project.description ?? "";
  const isNameDirty =
    savedNameSnapshot !== null && nameDraft.trim() !== savedNameSnapshot;
  const isDescriptionDirty =
    savedDescriptionSnapshot !== null &&
    descriptionDraft.trim() !== savedDescriptionSnapshot;
  const canSaveName =
    projectData !== undefined &&
    projectData !== null &&
    !isSavingName &&
    nameDraft.trim().length > 0 &&
    nameDraft.trim() !== (savedNameSnapshot ?? currentProjectName);
  const canSaveDescription =
    projectData !== undefined &&
    projectData !== null &&
    !isSavingDescription &&
    descriptionDraft.trim() !==
      (savedDescriptionSnapshot ?? currentProjectDescription);

  useEffect(() => {
    if (projectData === null) {
      queueMicrotask(() => {
        redirectToProjectsIndex();
      });
      return;
    }

    if (!projectData) {
      return;
    }

    queueMicrotask(() => {
      if (savedNameSnapshot === null || !isNameDirty) {
        setNameDraft(projectData.project.name);
        setSavedNameSnapshot(projectData.project.name);
      }

      if (savedDescriptionSnapshot === null || !isDescriptionDirty) {
        const nextDescription = projectData.project.description ?? "";
        setDescriptionDraft(nextDescription);
        setSavedDescriptionSnapshot(nextDescription);
      }
    });
  }, [
    isDescriptionDirty,
    isNameDirty,
    projectData,
    savedDescriptionSnapshot,
    savedNameSnapshot,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      setIsDeleteConfirming(false);
      setDeleteError(null);
      setIsLeaveConfirming(false);
      setLeaveError(null);
    });
  }, [projectData?.project.id]);

  useEffect(() => {
    queueMicrotask(() => {
      setMemberActionError(null);
      setPendingMemberRemovalUserId(null);
      setJoinCodeError(null);
      setJoinCodeSnapshot(null);
      ensuredJoinCodeProjectIdRef.current = null;
    });
  }, [projectData?.project.id]);

  const currentProjectId =
    projectData === null ? null : (projectData?.project.id ?? projectId);
  const projectMembers = useQuery(
    api.projects.members.getProjectMembers,
    currentProjectId ? { projectId: currentProjectId as never } : "skip",
  );
  const projectJoinCode = useQuery(
    api.projects.join.getProjectJoinCode,
    currentProjectId ? { projectId: currentProjectId as never } : "skip",
  );
  const canManageMembers =
    projectMembers?.viewerRole === "owner" ||
    projectMembers?.viewerRole === "coCreator";
  const canRemoveMembers = projectMembers?.viewerRole === "owner";
  const canDeleteProject = projectMembers?.viewerRole === "owner";
  const canLeaveProject =
    projectMembers !== undefined &&
    projectMembers !== null &&
    projectMembers.viewerRole !== "owner";
  const canRenameProject =
    projectMembers?.viewerRole === "owner" ||
    projectMembers?.viewerRole === "coCreator";

  useEffect(() => {
    if (!currentProjectId || projectJoinCode === undefined) {
      return;
    }

    if (projectJoinCode === null) {
      queueMicrotask(() => {
        setJoinCodeSnapshot(null);
        setJoinCodeError(null);
      });
      ensuredJoinCodeProjectIdRef.current = null;
      return;
    }

    if (projectJoinCode.joinCode) {
      queueMicrotask(() => {
        setJoinCodeSnapshot(projectJoinCode.joinCode);
        setJoinCodeError(null);
      });
      ensuredJoinCodeProjectIdRef.current = null;
      return;
    }

    if (ensuredJoinCodeProjectIdRef.current === currentProjectId) {
      return;
    }

    ensuredJoinCodeProjectIdRef.current = currentProjectId;
    setIsEnsuringJoinCode(true);
    setJoinCodeError(null);

    void ensureProjectJoinCode({
      projectId: currentProjectId as never,
    })
      .then((result) => {
        setJoinCodeSnapshot(result.joinCode);
      })
      .catch((error) => {
        setJoinCodeError(
          error instanceof Error
            ? error.message
            : "Could not load the join code.",
        );
      })
      .finally(() => {
        setIsEnsuringJoinCode(false);
      });
  }, [currentProjectId, ensureProjectJoinCode, projectJoinCode]);

  const handleProjectRename = async () => {
    if (!currentProjectId || isSavingName || !canRenameProject) {
      return;
    }

    const trimmedName = nameDraft.trim();
    if (!trimmedName) {
      setRenameError("Project name cannot be empty.");
      return;
    }

    if (trimmedName === (savedNameSnapshot ?? currentProjectName)) {
      setRenameError(null);
      setNameDraft(savedNameSnapshot ?? currentProjectName);
      return;
    }

    setIsSavingName(true);
    setRenameError(null);

    try {
      const result = await renameProject({
        projectId: currentProjectId as never,
        name: trimmedName,
      });
      setNameDraft(result.name);
      setSavedNameSnapshot(result.name);
    } catch (error) {
      setRenameError(
        error instanceof Error ? error.message : "Could not rename project.",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleProjectDescriptionSave = async () => {
    if (!currentProjectId || isSavingDescription || !canRenameProject) {
      return;
    }

    const trimmedDescription = descriptionDraft.trim();
    if (
      trimmedDescription ===
      (savedDescriptionSnapshot ?? currentProjectDescription)
    ) {
      setDescriptionError(null);
      setDescriptionDraft(
        savedDescriptionSnapshot ?? currentProjectDescription,
      );
      return;
    }

    setIsSavingDescription(true);
    setDescriptionError(null);

    try {
      const result = await updateProjectDescription({
        projectId: currentProjectId as never,
        description: descriptionDraft,
      });
      setDescriptionDraft(result.description ?? "");
      setSavedDescriptionSnapshot(result.description ?? "");
    } catch (error) {
      setDescriptionError(
        error instanceof Error
          ? error.message
          : "Could not update project description.",
      );
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProjectId || isDeletingProject || !canDeleteProject) {
      return;
    }

    if (!isDeleteConfirming) {
      setDeleteError(null);
      setIsDeleteConfirming(true);
      return;
    }

    setDeleteError(null);
    setIsDeletingProject(true);

    try {
      await deleteProject({
        projectId: currentProjectId as never,
      });
      redirectToProjectsIndex();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete project.",
      );
      setIsDeleteConfirming(false);
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!currentProjectId || isLeavingProject || !canLeaveProject) {
      return;
    }

    if (!isLeaveConfirming) {
      setLeaveError(null);
      setIsLeaveConfirming(true);
      return;
    }

    setLeaveError(null);
    setIsLeavingProject(true);

    try {
      await leaveProject({
        projectId: currentProjectId as never,
      });
      redirectToProjectsIndex();
    } catch (error) {
      setLeaveError(
        error instanceof Error ? error.message : "Could not leave project.",
      );
      setIsLeaveConfirming(false);
    } finally {
      setIsLeavingProject(false);
    }
  };

  const handleRemoveProjectMember = async (targetUserId: Id<"users">) => {
    if (!currentProjectId || pendingMemberRemovalUserId !== null) {
      return;
    }

    setMemberActionError(null);
    setPendingMemberRemovalUserId(targetUserId);

    try {
      await removeProjectMember({
        projectId: currentProjectId as never,
        targetUserId: targetUserId as never,
      });
    } catch (error) {
      setMemberActionError(
        error instanceof Error
          ? error.message
          : "Could not update this project member.",
      );
    } finally {
      setPendingMemberRemovalUserId(null);
    }
  };

  const handleRegenerateJoinCode = async () => {
    if (
      !currentProjectId ||
      isRegeneratingJoinCode ||
      !projectJoinCode?.canRegenerate
    ) {
      return;
    }

    setJoinCodeError(null);
    setIsRegeneratingJoinCode(true);

    try {
      const result = await regenerateProjectJoinCode({
        projectId: currentProjectId as never,
      });
      setJoinCodeSnapshot(result.joinCode);
    } catch (error) {
      setJoinCodeError(
        error instanceof Error
          ? error.message
          : "Could not regenerate the join code.",
      );
    } finally {
      setIsRegeneratingJoinCode(false);
    }
  };

  return {
    projectData,
    projectMembers,
    joinCode: projectJoinCode?.joinCode ?? joinCodeSnapshot,
    canRegenerateJoinCode: projectJoinCode?.canRegenerate ?? false,
    joinCodeError,
    isJoinCodeLoading: projectJoinCode === undefined || isEnsuringJoinCode,
    isRegeneratingJoinCode,
    currentProjectName,
    canManageMembers,
    canRemoveMembers,
    canDeleteProject,
    canLeaveProject,
    nameDraft,
    setNameDraft,
    currentProjectDescription,
    descriptionDraft,
    setDescriptionDraft,
    canSaveName: canSaveName && canRenameProject,
    canSaveDescription: canSaveDescription && canRenameProject,
    renameError,
    descriptionError,
    isSavingName,
    isSavingDescription,
    handleProjectRename,
    handleProjectDescriptionSave,
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
  };
}
