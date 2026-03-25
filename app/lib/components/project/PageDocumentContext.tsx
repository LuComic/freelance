"use client";

import { api } from "@/convex/_generated/api";
import type { PlanTier } from "@/lib/billing/plans";
import { currentEntitlementsQuery } from "@/lib/convexFunctionReferences";
import {
  createComponentInstanceId,
  createComponentToken,
  createDefaultComponentDocument,
  type PageComponentDocument,
  type PageComponentDocumentByType,
  type PageComponentLiveState,
  type PageComponentLiveStateByType,
  type PageComponentType,
  type PageDocumentV1,
} from "@/lib/pageDocument";
import { useMutation, useQuery } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  useEditMode,
  type InsertableComponentCommand,
} from "./EditModeContext";
import {
  canReuseActivePageForRoute,
  getPageRoute,
  resolveDeleteRedirectPath,
} from "./page_document_helpers/routing";
import { sanitizeDocumentBeforeCreatorSave } from "./page_document_helpers/sanitizeDocumentBeforeSave";
import type {
  ActivePageDocumentContextValue,
  ActivePageState,
  DeleteStatus,
  PageDocumentContextValue,
  ProjectPageSummary,
  SaveStatus,
  ViewerProjectRole,
} from "./page_document_helpers/types";
import { canInsertComponentCommand } from "../page_components/componentCatalog";
import { resolveComponentTypeFromCommand } from "../page_components/testing_editor/commands";
import {
  createDropdownScaffold,
  DROPDOWN_SLASH_COMMAND,
  getDropdownScaffoldCursorOffset,
} from "../page_components/testing_editor/dropdownBlocks";

type ProjectMemberListItem = {
  userId: string;
};

type ListedProjectSummary = {
  id: string;
  pages: ProjectPageSummary[];
};

const PageDocumentContext = createContext<PageDocumentContextValue | null>(
  null,
);

export function PageDocumentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLive, setModeLock } = useEditMode();
  const pathname = usePathname();
  const router = useRouter();
  const route = getPageRoute(pathname);
  const [activePage, setActivePage] = useState<ActivePageState | null>(null);
  const [viewerRole, setViewerRole] = useState<ViewerProjectRole | null>(null);
  const [document, setDocument] = useState<PageDocumentV1 | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingRouteProjectId, setPendingRouteProjectId] = useState<
    string | null
  >(null);
  const [pendingRoutePageId, setPendingRoutePageId] = useState<string | null>(
    null,
  );
  const [savedTitleSnapshot, setSavedTitleSnapshot] = useState<string | null>(
    null,
  );
  const [savedDocumentSnapshot, setSavedDocumentSnapshot] = useState<
    string | null
  >(null);
  const componentSeedRef = useRef(0);
  const lastHydratedPageKeyRef = useRef<string | null>(null);
  const lastRouteCorrectionKeyRef = useRef<string | null>(null);
  const activePageRef = useRef<ActivePageState | null>(null);
  const projectVisitHistoryRef = useRef<Map<string, string[]>>(new Map());
  const pendingDeleteRedirectPathRef = useRef<string | null>(null);
  const documentRef = useRef<PageDocumentV1 | null>(null);
  const currentDocumentSnapshot = document ? JSON.stringify(document) : null;
  const hasUnsavedChanges =
    activePage !== null &&
    document !== null &&
    (activePage.page.title !== savedTitleSnapshot ||
      currentDocumentSnapshot !== savedDocumentSnapshot);
  const canUseActivePageFallback = canReuseActivePageForRoute({
    route,
    activePage,
    pendingRouteProjectId,
    pendingRoutePageId,
  });
  const pageQueryArgs =
    route === null
      ? "skip"
      : {
          projectSlug: route.projectSlug,
          projectId: canUseActivePageFallback
            ? (activePage?.project.id as never)
            : undefined,
          pageSlug: route.pageSlug,
          pageId: canUseActivePageFallback
            ? (activePage?.page.id as never)
            : undefined,
        };
  const pageData = useQuery(
    api.pages.queries.getPageEditorBySlugs,
    pageQueryArgs,
  );
  const entitlements = useQuery(currentEntitlementsQuery, {});
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const activeProjectMembers = useQuery(
    api.projects.members.getProjectMembers,
    activePage ? { projectId: activePage.project.id as never } : "skip",
  );
  const activeClientUserIds = useMemo(
    () =>
      new Set<string>(
        activeProjectMembers?.clients.map((member: ProjectMemberListItem) =>
          String(member.userId),
        ) ??
          [],
      ),
    [activeProjectMembers],
  );
  const planTier = (entitlements?.plan.tier ?? null) as PlanTier | null;
  const canUseLimitedComponents = entitlements?.canUseLimitedComponents === true;
  const savePage = useMutation(api.pages.mutations.savePage);
  const savePageLiveState = useMutation(api.pages.mutations.savePageLiveState);
  const applyPageTemplateMutation = useMutation(
    api.templates.mutations.applyPageTemplate,
  );
  const createPage = useMutation(api.pages.mutations.createPage);
  const deletePageMutation = useMutation(api.pages.mutations.deletePage);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    const projectHistory =
      projectVisitHistoryRef.current.get(activePage.project.id) ?? [];
    const nextProjectHistory = [
      ...projectHistory.filter((pageId) => pageId !== activePage.page.id),
      activePage.page.id,
    ];

    projectVisitHistoryRef.current.set(
      activePage.project.id,
      nextProjectHistory,
    );
  }, [activePage]);

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  useEffect(() => {
    if (route === null || pageData !== undefined || canUseActivePageFallback) {
      return;
    }

    queueMicrotask(() => {
      pendingDeleteRedirectPathRef.current = null;
      setActivePage(null);
      setDocument(null);
      setSaveStatus("idle");
      setSaveError(null);
      setDeleteStatus("idle");
      setDeleteError(null);
      setPendingRouteProjectId(null);
      setPendingRoutePageId(null);
      setSavedTitleSnapshot(null);
      setSavedDocumentSnapshot(null);
      setViewerRole(null);
    });
    lastHydratedPageKeyRef.current = null;
    lastRouteCorrectionKeyRef.current = null;
  }, [canUseActivePageFallback, pageData, route]);

  useEffect(() => {
    if (!route || pageData === undefined) {
      if (!route) {
        pendingDeleteRedirectPathRef.current = null;
        queueMicrotask(() => {
          setActivePage(null);
          setDocument(null);
          setSaveStatus("idle");
          setSaveError(null);
          setDeleteStatus("idle");
          setDeleteError(null);
          setPendingRouteProjectId(null);
          setPendingRoutePageId(null);
          setSavedTitleSnapshot(null);
          setSavedDocumentSnapshot(null);
          setViewerRole(null);
        });
        lastHydratedPageKeyRef.current = null;
      }
      return;
    }

    if (pageData === null) {
      queueMicrotask(() => {
        const pendingDeleteRedirectPath = pendingDeleteRedirectPathRef.current;
        setActivePage(null);
        setDocument(null);
        setSaveStatus("idle");
        setSaveError(null);
        setDeleteStatus("idle");
        setDeleteError(null);
        setPendingRouteProjectId(null);
        setPendingRoutePageId(null);
        setSavedTitleSnapshot(null);
        setSavedDocumentSnapshot(null);
        setViewerRole(null);

        if (!pendingDeleteRedirectPath) {
          router.replace("/projects");
        }
      });
      lastHydratedPageKeyRef.current = null;
      return;
    }

    const nextPageKey = `${pageData.project.id}:${pageData.page.id}`;
    const serverDocumentSnapshot = JSON.stringify(pageData.document);
    const isSamePage = nextPageKey === lastHydratedPageKeyRef.current;
    const shouldSyncExistingPage =
      isSamePage &&
      !hasUnsavedChanges &&
      !!activePage &&
      !!document &&
      (activePage.page.slug !== pageData.page.slug ||
        activePage.page.title !== pageData.page.title ||
        activePage.page.updatedAt !== pageData.page.updatedAt ||
        currentDocumentSnapshot !== serverDocumentSnapshot);

    if (isSamePage && !shouldSyncExistingPage) {
      return;
    }

    lastHydratedPageKeyRef.current = nextPageKey;
    queueMicrotask(() => {
      pendingDeleteRedirectPathRef.current = null;
      setActivePage({
        project: pageData.project,
        page: pageData.page,
      });
      setDocument(pageData.document);
      setSaveStatus("idle");
      setSaveError(null);
      setDeleteStatus("idle");
      setDeleteError(null);
      setSavedTitleSnapshot(pageData.page.title);
      setSavedDocumentSnapshot(serverDocumentSnapshot);
      setViewerRole(pageData.viewerRole);
    });
  }, [
    activePage,
    currentDocumentSnapshot,
    document,
    hasUnsavedChanges,
    pageData,
    router,
    route,
  ]);

  useEffect(() => {
    if (route === null || pageData === null) {
      setModeLock(null);
      return;
    }

    if (pageData === undefined) {
      if (!canUseActivePageFallback) {
        setModeLock(null);
      }
      return;
    }

    if (pageData?.viewerRole === "client") {
      setModeLock("live");
      return;
    }

    if (pageData) {
      setModeLock(null);
    }
  }, [canUseActivePageFallback, pageData, route, setModeLock]);

  useEffect(() => {
    if (
      route &&
      pageData &&
      (route.projectSlug !== pageData.project.slug ||
        route.pageSlug !== pageData.page.slug)
    ) {
      const correctionKey = `${pageData.project.id}:${pageData.project.slug}:${pageData.page.id}:${pageData.page.slug}`;
      if (lastRouteCorrectionKeyRef.current === correctionKey) {
        return;
      }

      lastRouteCorrectionKeyRef.current = correctionKey;
      queueMicrotask(() => {
        setPendingRouteProjectId(pageData.project.id);
        setPendingRoutePageId(pageData.page.id);
        window.history.replaceState(
          window.history.state,
          "",
          `/projects/${pageData.project.slug}/${pageData.page.slug}`,
        );
      });
      return;
    }

    if (
      route &&
      pageData &&
      route.projectSlug === pageData.project.slug &&
      route.pageSlug === pageData.page.slug
    ) {
      lastRouteCorrectionKeyRef.current = null;
    }
  }, [pageData, route]);

  useEffect(() => {
    if (!route || !activePage) {
      if (pendingRouteProjectId !== null || pendingRoutePageId !== null) {
        queueMicrotask(() => {
          setPendingRouteProjectId(null);
          setPendingRoutePageId(null);
        });
      }
      return;
    }

    if (
      route.projectSlug === activePage.project.slug &&
      route.pageSlug === activePage.page.slug
    ) {
      if (pendingRouteProjectId !== null || pendingRoutePageId !== null) {
        queueMicrotask(() => {
          setPendingRouteProjectId(null);
          setPendingRoutePageId(null);
        });
      }
    }
  }, [activePage, pendingRoutePageId, pendingRouteProjectId, route]);

  useEffect(() => {
    queueMicrotask(() => {
      setDeleteStatus("idle");
      setDeleteError(null);
    });
  }, [activePage?.page.id]);

  const setPageTitle = useCallback(
    (title: string) => {
      setActivePage((prev) =>
        prev
          ? {
              ...prev,
              page: {
                ...prev.page,
                title,
              },
            }
          : prev,
      );
      setSaveError(null);
    },
    [setActivePage, setSaveError],
  );

  const updateEditorText = useCallback(
    (value: string) => {
      setDocument((prev) =>
        prev
          ? {
              ...prev,
              editorText: value,
            }
          : prev,
      );
      setSaveError(null);
    },
    [setDocument, setSaveError],
  );

  const updateComponentConfig = useCallback(
    (
      instanceId: string,
      updater: (component: PageComponentDocument) => PageComponentDocument,
    ) => {
      setDocument((prev) => {
        if (!prev || !prev.components[instanceId]) {
          return prev;
        }

        return {
          ...prev,
          components: {
            ...prev.components,
            [instanceId]: updater(prev.components[instanceId]),
          },
        };
      });
      setSaveError(null);
    },
    [setDocument, setSaveError],
  );

  const updateComponentLiveState = useCallback(
    (
      instanceId: string,
      updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
    ) => {
      setDocument((prev) => {
        if (!prev || !prev.components[instanceId]) {
          return prev;
        }

        const currentComponent = prev.components[instanceId];
        const nextLiveState = updater({
          type: currentComponent.type,
          state: currentComponent.state,
        } as PageComponentLiveState);

        return {
          ...prev,
          components: {
            ...prev.components,
            [instanceId]: {
              ...currentComponent,
              state: nextLiveState.state,
            } as PageComponentDocument,
          },
        };
      });
      setSaveError(null);
    },
    [setDocument, setSaveError],
  );

  const insertComponentAtRange = useCallback(
    ({
      command,
      value,
      start,
      end,
    }: {
      command: InsertableComponentCommand;
      value: string;
      start: number;
      end?: number;
    }) => {
      if (command === DROPDOWN_SLASH_COMMAND) {
        const scaffold = createDropdownScaffold();
        const nextValue = `${value.slice(0, start)}${scaffold}${value.slice(
          end ?? start,
        )}`;

        setDocument((prev) =>
          prev
            ? {
                ...prev,
                editorText: nextValue,
              }
            : prev,
        );
        setSaveError(null);

        return {
          nextValue,
          nextCursor: start + getDropdownScaffoldCursorOffset(),
        };
      }

      if (!canInsertComponentCommand(command, canUseLimitedComponents)) {
        return null;
      }

      const type = resolveComponentTypeFromCommand(command);
      if (!type) {
        return null;
      }

      componentSeedRef.current += 1;
      const instanceId = createComponentInstanceId(
        Date.now() + componentSeedRef.current,
      );
      const token = createComponentToken(type, instanceId);
      const nextValue = `${value.slice(0, start)}${token}${value.slice(
        end ?? start,
      )}`;

      setDocument((prev) =>
        prev
          ? {
              ...prev,
              editorText: nextValue,
              components: {
                ...prev.components,
                [instanceId]: createDefaultComponentDocument(
                  type,
                  instanceId,
                ) as PageComponentDocument,
              },
            }
          : prev,
      );
      setSaveError(null);

      return {
        nextValue,
        nextCursor: start + token.length,
      };
    },
    [canUseLimitedComponents, setDocument, setSaveError],
  );

  const persistDocument = useCallback(
    async (currentPage: ActivePageState, currentDocument: PageDocumentV1) => {
      const shouldSaveLiveState = isLive;
      const nextDocument =
        !shouldSaveLiveState && activeProjectMembers !== undefined
          ? sanitizeDocumentBeforeCreatorSave(
              currentDocument,
              activeClientUserIds,
            )
          : currentDocument;
      const trimmedTitle = currentPage.page.title.trim();
      if (!shouldSaveLiveState && !trimmedTitle) {
        setSaveError("Page title cannot be empty.");
        setSaveStatus("error");
        return;
      }

      if (nextDocument !== currentDocument) {
        documentRef.current = nextDocument;
        setDocument(nextDocument);
      }

      setSaveStatus("saving");
      setSaveError(null);

      try {
        if (shouldSaveLiveState) {
          const result = await savePageLiveState({
            pageId: currentPage.page.id as never,
            title: trimmedTitle,
            document: nextDocument,
          });

          documentRef.current = result.document;
          setDocument(result.document);
          const nextPage: ActivePageState = {
            ...currentPage,
            page: {
              ...currentPage.page,
              title: result.title,
              slug: result.slug,
            },
          };

          activePageRef.current = nextPage;
          setActivePage(nextPage);

          if (
            route &&
            (result.slug !== route.pageSlug ||
              nextPage.project.slug !== route.projectSlug)
          ) {
            setPendingRouteProjectId(nextPage.project.id);
            setPendingRoutePageId(result.pageId);
            router.replace(`/projects/${nextPage.project.slug}/${result.slug}`);
          }

          setSavedTitleSnapshot(result.title);
          setSavedDocumentSnapshot(JSON.stringify(result.document));
          setSaveStatus("idle");
          return;
        }

        const result = await savePage({
          pageId: currentPage.page.id as never,
          title: trimmedTitle,
          document: nextDocument,
        });

        setActivePage((prev) =>
          prev
            ? {
                ...prev,
                page: {
                  ...prev.page,
                  title: result.title,
                  slug: result.slug,
                },
              }
            : prev,
        );

        if (
          route &&
          (result.slug !== route.pageSlug ||
            currentPage.project.slug !== route.projectSlug)
        ) {
          setPendingRouteProjectId(currentPage.project.id);
          setPendingRoutePageId(result.pageId);
          router.replace(
            `/projects/${currentPage.project.slug}/${result.slug}`,
          );
        }

        setSavedTitleSnapshot(result.title);
        setSavedDocumentSnapshot(JSON.stringify(nextDocument));
        setSaveStatus("idle");
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Could not save page.",
        );
        setSaveStatus("error");
      }
    },
    [
      isLive,
      route,
      router,
      savePage,
      savePageLiveState,
      activeProjectMembers,
      activeClientUserIds,
      setActivePage,
      setDocument,
      setPendingRoutePageId,
      setPendingRouteProjectId,
      setSavedDocumentSnapshot,
      setSavedTitleSnapshot,
      setSaveError,
      setSaveStatus,
    ],
  );

  const saveDocument = useCallback(async () => {
    const currentPage = activePageRef.current;
    const currentDocument = documentRef.current;

    if (!currentPage || !currentDocument) {
      return;
    }

    await persistDocument(currentPage, currentDocument);
  }, [persistDocument]);

  const applyPageTemplate = useCallback(
    async (args: {
      templateId: string;
      expectedUpdatedAt: number;
    }) => {
      const currentPage = activePageRef.current;
      const currentDocument = documentRef.current;

      if (!currentPage || !currentDocument) {
        return;
      }

      setSaveStatus("saving");
      setSaveError(null);

      try {
        const result = await applyPageTemplateMutation({
          pageId: currentPage.page.id as never,
          templateId: args.templateId as never,
          expectedUpdatedAt: args.expectedUpdatedAt,
          baseTitle: currentPage.page.title,
          baseDocument: currentDocument,
        });
        const nextPage: ActivePageState = {
          ...currentPage,
          page: {
            ...currentPage.page,
            title: result.title,
            slug: result.slug,
          },
        };

        documentRef.current = result.document;
        activePageRef.current = nextPage;
        setDocument(result.document);
        setActivePage(nextPage);

        if (
          route &&
          (result.slug !== route.pageSlug ||
            nextPage.project.slug !== route.projectSlug)
        ) {
          setPendingRouteProjectId(nextPage.project.id);
          setPendingRoutePageId(result.pageId);
          router.replace(`/projects/${nextPage.project.slug}/${result.slug}`);
        }

        setSavedTitleSnapshot(result.title);
        setSavedDocumentSnapshot(JSON.stringify(result.document));
        setSaveStatus("idle");
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Could not apply this page template.",
        );
        setSaveStatus("error");
        throw error;
      }
    },
    [
      applyPageTemplateMutation,
      route,
      router,
      setActivePage,
      setDocument,
      setPendingRoutePageId,
      setPendingRouteProjectId,
      setSavedDocumentSnapshot,
      setSavedTitleSnapshot,
      setSaveError,
      setSaveStatus,
    ],
  );

  const commitPageTitle = useCallback(
    async (title: string) => {
      const currentPage = activePageRef.current;
      const currentDocument = documentRef.current;

      if (!currentPage || !currentDocument) {
        return;
      }

      const trimmedTitle = title.trim();
      const nextTitle = trimmedTitle || currentPage.page.title;
      const nextPage: ActivePageState = {
        ...currentPage,
        page: {
          ...currentPage.page,
          title: nextTitle,
        },
      };

      activePageRef.current = nextPage;
      setActivePage(nextPage);
      setSaveError(null);

      await persistDocument(nextPage, currentDocument);
    },
    [persistDocument, setActivePage, setSaveError],
  );

  const commitComponentLiveState = useCallback(
    async (
      instanceId: string,
      updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
    ) => {
      const currentPage = activePageRef.current;
      const currentDocument = documentRef.current;

      if (
        !currentPage ||
        !currentDocument ||
        !currentDocument.components[instanceId]
      ) {
        return;
      }

      const currentComponent = currentDocument.components[instanceId];
      const nextLiveState = updater({
        type: currentComponent.type,
        state: currentComponent.state,
      } as PageComponentLiveState);
      const nextDocument: PageDocumentV1 = {
        ...currentDocument,
        components: {
          ...currentDocument.components,
          [instanceId]: {
            ...currentComponent,
            state: nextLiveState.state,
          } as PageComponentDocument,
        },
      };

      documentRef.current = nextDocument;
      setDocument(nextDocument);
      setSaveError(null);

      await persistDocument(currentPage, nextDocument);
    },
    [persistDocument, setDocument, setSaveError],
  );

  const createPageAndOpen = useCallback(async () => {
    const currentPage = activePageRef.current;
    if (!currentPage) {
      return;
    }

    const result = await createPage({
      projectId: currentPage.project.id as never,
    });
    router.push(`/projects/${currentPage.project.slug}/${result.pageSlug}`);
  }, [createPage, router]);

  const deletePage = useCallback(async () => {
    const currentPage = activePageRef.current;
    if (!currentPage) {
      return;
    }

    setDeleteStatus("deleting");
    setDeleteError(null);

    try {
      const currentProject = projects?.find(
        (project: ListedProjectSummary) => project.id === currentPage.project.id,
      );
      const fallbackPath = resolveDeleteRedirectPath({
        currentPageId: currentPage.page.id,
        projectSlug: currentPage.project.slug,
        projectPages: currentProject?.pages ?? [],
        visitHistoryPageIds:
          projectVisitHistoryRef.current.get(currentPage.project.id) ?? [],
      });
      pendingDeleteRedirectPathRef.current = fallbackPath;

      await deletePageMutation({
        pageId: currentPage.page.id as never,
      });
      projectVisitHistoryRef.current.set(
        currentPage.project.id,
        (
          projectVisitHistoryRef.current.get(currentPage.project.id) ?? []
        ).filter((pageId) => pageId !== currentPage.page.id),
      );
      router.replace(fallbackPath);
    } catch (error) {
      pendingDeleteRedirectPathRef.current = null;
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete page.",
      );
      setDeleteStatus("error");
    }
  }, [deletePageMutation, projects, router, setDeleteError, setDeleteStatus]);

  useEffect(() => {
    if (!isLive || !hasUnsavedChanges || saveStatus === "saving") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveDocument();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [hasUnsavedChanges, isLive, saveDocument, saveStatus]);

  const value = useMemo<PageDocumentContextValue>(
    () => ({
      isActivePage: route !== null,
      isLoading: route !== null && pageData === undefined,
      saveStatus,
      saveError,
      deleteStatus,
      deleteError,
      hasUnsavedChanges,
      activePage,
      viewerRole,
      planTier,
      canUseLimitedComponents,
      document,
      setPageTitle,
      updateEditorText,
      insertComponentAtRange,
      updateComponentConfig,
      updateComponentLiveState,
      commitPageTitle,
      commitComponentLiveState,
      saveDocument,
      applyPageTemplate,
      createPageAndOpen,
      deletePage,
    }),
    [
      activePage,
      applyPageTemplate,
      createPageAndOpen,
      deleteError,
      deletePage,
      deleteStatus,
      canUseLimitedComponents,
      commitPageTitle,
      document,
      commitComponentLiveState,
      hasUnsavedChanges,
      insertComponentAtRange,
      pageData,
      route,
      saveDocument,
      saveError,
      saveStatus,
      setPageTitle,
      planTier,
      updateComponentConfig,
      updateComponentLiveState,
      updateEditorText,
      viewerRole,
    ],
  );

  return (
    <PageDocumentContext.Provider value={value}>
      {children}
    </PageDocumentContext.Provider>
  );
}

export function useOptionalPageDocument() {
  return useContext(PageDocumentContext);
}

export function usePageDocument() {
  const context = useOptionalPageDocument();
  if (!context || !context.activePage || !context.document) {
    throw new Error("usePageDocument must be used on an active page route.");
  }
  return context as ActivePageDocumentContextValue;
}

export function usePageComponentState<TType extends PageComponentType>(
  instanceId: string,
  expectedType: TType,
) {
  const context = usePageDocument();
  const component = context.document.components[instanceId] as
    | PageComponentDocumentByType<TType>
    | undefined;

  if (!component || component.type !== expectedType) {
    throw new Error(`Component ${instanceId} was not found.`);
  }

  return {
    component,
    liveState: {
      type: component.type,
      state: component.state,
    } as PageComponentLiveStateByType<TType>,
    updateConfig: (
      updater: (
        config: PageComponentDocumentByType<TType>["config"],
      ) => PageComponentDocumentByType<TType>["config"],
    ) =>
      context.updateComponentConfig(instanceId, (currentComponent) => {
        const typedComponent =
          currentComponent as PageComponentDocumentByType<TType>;
        return {
          ...typedComponent,
          config: updater(typedComponent.config),
        } as PageComponentDocument;
      }),
    updateLiveState: (
      updater: (
        state: PageComponentLiveStateByType<TType>["state"],
      ) => PageComponentLiveStateByType<TType>["state"],
    ) =>
      context.updateComponentLiveState(
        instanceId,
        (currentLiveState) =>
          ({
            ...currentLiveState,
            state: updater(
              currentLiveState.state as PageComponentLiveStateByType<TType>["state"],
            ),
          }) as PageComponentLiveState,
      ),
    commitLiveState: (
      updater: (
        state: PageComponentLiveStateByType<TType>["state"],
      ) => PageComponentLiveStateByType<TType>["state"],
    ) =>
      context.commitComponentLiveState(
        instanceId,
        (currentLiveState) =>
          ({
            ...currentLiveState,
            state: updater(
              currentLiveState.state as PageComponentLiveStateByType<TType>["state"],
            ),
          }) as PageComponentLiveState,
      ),
  };
}
