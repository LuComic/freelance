"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export function useProjectSettingsController(projectSlug: string) {
  const router = useRouter();
  const [projectIdSnapshot, setProjectIdSnapshot] = useState<string | null>(null);
  const [resolvedProjectSlugSnapshot, setResolvedProjectSlugSnapshot] = useState<
    string | null
  >(null);
  const [pendingRouteProjectId, setPendingRouteProjectId] = useState<
    string | null
  >(null);
  const [nameDraft, setNameDraft] = useState("");
  const [savedNameSnapshot, setSavedNameSnapshot] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isLeaveConfirming, setIsLeaveConfirming] = useState(false);
  const [isLeavingProject, setIsLeavingProject] = useState(false);
  const [pendingMemberRemovalUserId, setPendingMemberRemovalUserId] = useState<
    Id<"users"> | null
  >(null);
  const lastRouteCorrectionKeyRef = useRef<string | null>(null);

  const redirectToProjectsIndex = () => {
    window.location.replace("/projects");
  };

  const canUseProjectIdFallback =
    projectIdSnapshot !== null &&
    (resolvedProjectSlugSnapshot === projectSlug ||
      pendingRouteProjectId === projectIdSnapshot);
  const projectData = useQuery(
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
  const renameProject = useMutation(api.projects.mutations.renameProject);
  const deleteProject = useMutation(api.projects.mutations.deleteProject);
  const leaveProject = useMutation(api.projects.mutations.leaveProject);
  const removeProjectMember = useMutation(api.projects.members.removeProjectMember);
  const currentProjectName = projectData?.project.name ?? "";
  const isNameDirty =
    savedNameSnapshot !== null && nameDraft.trim() !== savedNameSnapshot;
  const canSaveName =
    projectData !== undefined &&
    projectData !== null &&
    !isSavingName &&
    nameDraft.trim().length > 0 &&
    nameDraft.trim() !== (savedNameSnapshot ?? currentProjectName);

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
      setProjectIdSnapshot(projectData.project.id);
      setResolvedProjectSlugSnapshot(projectData.project.slug);

      if (savedNameSnapshot === null || !isNameDirty) {
        setNameDraft(projectData.project.name);
        setSavedNameSnapshot(projectData.project.name);
      }
    });
  }, [isNameDirty, projectData, router, savedNameSnapshot]);

  useEffect(() => {
    if (!projectData) {
      return;
    }

    if (projectSlug !== projectData.project.slug) {
      const correctionKey = `${projectData.project.id}:${projectData.project.slug}`;
      if (lastRouteCorrectionKeyRef.current === correctionKey) {
        return;
      }

      lastRouteCorrectionKeyRef.current = correctionKey;
      queueMicrotask(() => {
        setPendingRouteProjectId(projectData.project.id);
        window.history.replaceState(
          window.history.state,
          "",
          `/projects/${projectData.project.slug}/settings`,
        );
      });
      return;
    }

    lastRouteCorrectionKeyRef.current = null;
  }, [projectData, projectSlug]);

  useEffect(() => {
    if (
      pendingRouteProjectId !== null &&
      projectData &&
      projectSlug === projectData.project.slug
    ) {
      queueMicrotask(() => {
        setPendingRouteProjectId(null);
      });
    }
  }, [pendingRouteProjectId, projectData, projectSlug]);

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
    });
  }, [projectData?.project.id]);

  const currentProjectId = useMemo(
    () => projectData?.project.id ?? projectIdSnapshot,
    [projectData?.project.id, projectIdSnapshot],
  );
  const projectMembers = useQuery(
    api.projects.members.getProjectMembers,
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
      setProjectIdSnapshot(result.projectId);
      setResolvedProjectSlugSnapshot(result.projectSlug);
      setPendingRouteProjectId(result.projectId);
      setNameDraft(result.name);
      setSavedNameSnapshot(result.name);
      router.replace(`/projects/${result.projectSlug}/settings`);
    } catch (error) {
      setRenameError(
        error instanceof Error ? error.message : "Could not rename project.",
      );
    } finally {
      setIsSavingName(false);
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

  return {
    projectData,
    projectMembers,
    currentProjectName,
    canManageMembers,
    canRemoveMembers,
    canDeleteProject,
    canLeaveProject,
    nameDraft,
    setNameDraft,
    canSaveName: canSaveName && canRenameProject,
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
  };
}
