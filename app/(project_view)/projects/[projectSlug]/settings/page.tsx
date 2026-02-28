"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function SettingsPage() {
  const params = useParams<{ projectSlug: string }>();
  const router = useRouter();
  const projectSlug = params.projectSlug;
  const [generalOpen, setGeneralOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [coCreatorsOpen, setCoCreatorsOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
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
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const lastRouteCorrectionKeyRef = useRef<string | null>(null);

  const [clients, setClients] = useState([
    "alice@client.co",
    "brand-team@client.co",
  ]);
  const [newClient, setNewClient] = useState("");

  const [coCreators, setCoCreators] = useState([
    "marco@studio.co",
    "sara@studio.co",
  ]);
  const [newCoCreator, setNewCoCreator] = useState("");

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
        router.replace("/projects");
        router.refresh();
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
    });
  }, [projectData?.project.id]);

  const currentProjectId = useMemo(
    () => projectData?.project.id ?? projectIdSnapshot,
    [projectData?.project.id, projectIdSnapshot],
  );

  const handleProjectRename = async () => {
    if (!currentProjectId || isSavingName) {
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
    if (!currentProjectId || isDeletingProject) {
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
      router.replace("/projects");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete project.",
      );
      setIsDeleteConfirming(false);
    } finally {
      setIsDeletingProject(false);
    }
  };

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
        <div className="w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setGeneralOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${generalOpen ? "rotate-90" : "rotate-0"}`}
            />
            General
          </button>

          {generalOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <p className="text-(--gray-page)">Project name</p>
              <div className="w-max rounded-md border px-2 py-1 border-(--gray)">
                {projectData === undefined
                  ? "Loading..."
                  : currentProjectName || "Not set"}
              </div>

              <p className="text-(--gray-page)">Rename project</p>
              <input
                type="text"
                placeholder="Enter a new project name..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                disabled={projectData === undefined || projectData === null || isSavingName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleProjectRename();
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--vibrant)"
                onClick={() => void handleProjectRename()}
                disabled={!canSaveName}
              >
                {isSavingName ? "Saving..." : "Save"}
              </button>
              {renameError ? (
                <p className="text-sm text-(--declined-border)">{renameError}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setClientsOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${clientsOpen ? "rotate-90" : "rotate-0"}`}
            />
            Clients
          </button>

          {clientsOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <p className="text-(--gray-page)">Current clients</p>
              <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                {clients.map((client) => (
                  <div
                    key={client}
                    className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                  >
                    {client}
                    <button
                      type="button"
                      className="hover:bg-(--gray)/20 p-1 rounded-sm"
                      onClick={() =>
                        setClients((prev) =>
                          prev.filter((value) => value !== client),
                        )
                      }
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-(--gray-page)">Manage clients</p>
              <input
                type="text"
                placeholder="Add a client email..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const nextValue = newClient.trim();
                    if (!nextValue) return;
                    setClients((prev) => [nextValue, ...prev]);
                    setNewClient("");
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                onClick={() => {
                  const nextValue = newClient.trim();
                  if (!nextValue) return;
                  setClients((prev) => [nextValue, ...prev]);
                  setNewClient("");
                }}
              >
                Add
              </button>
            </div>
          ) : null}
        </div>

        <div className="w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setCoCreatorsOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${coCreatorsOpen ? "rotate-90" : "rotate-0"}`}
            />
            Co-creators
          </button>

          {coCreatorsOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <p className="text-(--gray-page)">Current co-creators</p>
              <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                {coCreators.map((coCreator) => (
                  <div
                    key={coCreator}
                    className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                  >
                    {coCreator}
                    <button
                      type="button"
                      className="hover:bg-(--gray)/20 p-1 rounded-sm"
                      onClick={() =>
                        setCoCreators((prev) =>
                          prev.filter((value) => value !== coCreator),
                        )
                      }
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-(--gray-page)">Manage co-creators</p>
              <input
                type="text"
                placeholder="Add a co-creator email..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={newCoCreator}
                onChange={(e) => setNewCoCreator(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const nextValue = newCoCreator.trim();
                    if (!nextValue) return;
                    setCoCreators((prev) => [nextValue, ...prev]);
                    setNewCoCreator("");
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                onClick={() => {
                  const nextValue = newCoCreator.trim();
                  if (!nextValue) return;
                  setCoCreators((prev) => [nextValue, ...prev]);
                  setNewCoCreator("");
                }}
              >
                Add
              </button>
            </div>
          ) : null}
        </div>

        <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setDangerOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${dangerOpen ? "rotate-90" : "rotate-0"}`}
            />
            Danger zone
          </button>

          {dangerOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <p className="text-(--gray-page)">Delete project</p>
              <button
                type="button"
                className="w-max rounded-md border px-2 py-1 border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                onClick={() => void handleDeleteProject()}
                disabled={
                  projectData === undefined ||
                  projectData === null ||
                  isDeletingProject
                }
              >
                {isDeletingProject
                  ? "Deleting..."
                  : isDeleteConfirming
                    ? "Are you sure?"
                    : "Delete project"}
              </button>
              {deleteError ? (
                <p className="text-sm text-(--declined-border)">{deleteError}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
