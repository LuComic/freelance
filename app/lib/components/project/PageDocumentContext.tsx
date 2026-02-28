"use client";

import { api } from "@/convex/_generated/api";
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
import { useEditMode, type InsertableComponentCommand } from "./EditModeContext";
import { resolveComponentTypeFromCommand } from "../page_components/testing_editor/commands";

type SaveStatus = "idle" | "saving" | "error";
type DeleteStatus = "idle" | "deleting" | "error";

type ActivePageState = {
  project: {
    id: string;
    slug: string;
    name: string;
  };
  page: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    createdAt: number;
    updatedAt: number;
  };
};

type PageDocumentContextValue = {
  isActivePage: boolean;
  isLoading: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  deleteStatus: DeleteStatus;
  deleteError: string | null;
  hasUnsavedChanges: boolean;
  activePage: ActivePageState | null;
  document: PageDocumentV1 | null;
  setPageTitle: (title: string) => void;
  updateEditorText: (value: string) => void;
  insertComponentAtRange: (args: {
    command: InsertableComponentCommand;
    value: string;
    start: number;
    end?: number;
  }) => { nextValue: string; nextCursor: number } | null;
  updateComponentConfig: (
    instanceId: string,
    updater: (component: PageComponentDocument) => PageComponentDocument,
  ) => void;
  updateComponentLiveState: (
    instanceId: string,
    updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
  ) => void;
  commitPageTitle: (title: string) => Promise<void>;
  commitComponentLiveState: (
    instanceId: string,
    updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
  ) => Promise<void>;
  saveDocument: () => Promise<void>;
  createPageAndOpen: () => Promise<void>;
  deletePage: () => Promise<void>;
};

type ActivePageDocumentContextValue = PageDocumentContextValue & {
  activePage: ActivePageState;
  document: PageDocumentV1;
};

const PageDocumentContext = createContext<PageDocumentContextValue | null>(null);

function getPageRoute(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "projects" || segments.length < 3) {
    return null;
  }

  const pageSlug = segments[2];
  if (
    pageSlug === "analytics" ||
    pageSlug === "settings" ||
    pageSlug === "terms" ||
    pageSlug === "privacy" ||
    pageSlug === "cookies"
  ) {
    return null;
  }

  return {
    projectSlug: segments[1],
    pageSlug,
  };
}

export function PageDocumentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLive } = useEditMode();
  const pathname = usePathname();
  const router = useRouter();
  const route = getPageRoute(pathname);
  const [activePage, setActivePage] = useState<ActivePageState | null>(null);
  const [document, setDocument] = useState<PageDocumentV1 | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingRouteProjectId, setPendingRouteProjectId] = useState<
    string | null
  >(null);
  const [pendingRoutePageId, setPendingRoutePageId] = useState<string | null>(null);
  const [savedTitleSnapshot, setSavedTitleSnapshot] = useState<string | null>(null);
  const [savedDocumentSnapshot, setSavedDocumentSnapshot] = useState<string | null>(
    null,
  );
  const componentSeedRef = useRef(0);
  const lastHydratedPageKeyRef = useRef<string | null>(null);
  const lastRouteCorrectionKeyRef = useRef<string | null>(null);
  const activePageRef = useRef<ActivePageState | null>(null);
  const documentRef = useRef<PageDocumentV1 | null>(null);
  const currentDocumentSnapshot = document ? JSON.stringify(document) : null;
  const hasUnsavedChanges =
    activePage !== null &&
    document !== null &&
    (activePage.page.title !== savedTitleSnapshot ||
      currentDocumentSnapshot !== savedDocumentSnapshot);
  const canUseActivePageFallback =
    route !== null &&
    activePage !== null &&
    ((activePage.project.slug === route.projectSlug &&
      activePage.page.slug === route.pageSlug) ||
      (pendingRouteProjectId !== null &&
        activePage.project.id === pendingRouteProjectId) ||
      (pendingRoutePageId !== null && activePage.page.id === pendingRoutePageId));
  const pageQueryArgs =
    route === null
      ? "skip"
      : {
          projectSlug: route.projectSlug,
          projectId: canUseActivePageFallback
            ? (activePage?.project.id as never)
            : undefined,
          pageSlug: route.pageSlug,
          pageId: canUseActivePageFallback ? (activePage?.page.id as never) : undefined,
        };
  const pageData = useQuery(api.pages.queries.getPageEditorBySlugs, pageQueryArgs);
  const savePage = useMutation(api.pages.mutations.savePage);
  const createPage = useMutation(api.pages.mutations.createPage);
  const deletePageMutation = useMutation(api.pages.mutations.deletePage);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  useEffect(() => {
    if (!route || pageData === undefined) {
      if (!route) {
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
        });
        lastHydratedPageKeyRef.current = null;
      }
      return;
    }

    if (pageData === null) {
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
        router.replace("/projects");
        router.refresh();
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

  const setPageTitle = useCallback((title: string) => {
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
  }, []);

  const updateEditorText = useCallback((value: string) => {
    setDocument((prev) =>
      prev
        ? {
            ...prev,
            editorText: value,
          }
        : prev,
    );
    setSaveError(null);
  }, []);

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
    [],
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
    [],
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
    [],
  );

  const persistDocument = useCallback(
    async (currentPage: ActivePageState, currentDocument: PageDocumentV1) => {
      const trimmedTitle = currentPage.page.title.trim();
      if (!trimmedTitle) {
        setSaveError("Page title cannot be empty.");
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saving");
      setSaveError(null);

      try {
        const result = await savePage({
          pageId: currentPage.page.id as never,
          title: trimmedTitle,
          document: currentDocument,
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
          router.replace(`/projects/${currentPage.project.slug}/${result.slug}`);
        }

        setSavedTitleSnapshot(result.title);
        setSavedDocumentSnapshot(JSON.stringify(currentDocument));
        setSaveStatus("idle");
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Could not save page.",
        );
        setSaveStatus("error");
      }
    },
    [route, router, savePage],
  );

  const saveDocument = useCallback(async () => {
    const currentPage = activePageRef.current;
    const currentDocument = documentRef.current;

    if (!currentPage || !currentDocument) {
      return;
    }

    await persistDocument(currentPage, currentDocument);
  }, [persistDocument]);

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
    [persistDocument],
  );

  const commitComponentLiveState = useCallback(
    async (
      instanceId: string,
      updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
    ) => {
      const currentPage = activePageRef.current;
      const currentDocument = documentRef.current;

      if (!currentPage || !currentDocument || !currentDocument.components[instanceId]) {
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
    [persistDocument],
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
      await deletePageMutation({
        pageId: currentPage.page.id as never,
      });
      router.replace("/projects");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete page.",
      );
      setDeleteStatus("error");
    }
  }, [deletePageMutation, router]);

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
      document,
      setPageTitle,
      updateEditorText,
      insertComponentAtRange,
      updateComponentConfig,
      updateComponentLiveState,
      commitPageTitle,
      commitComponentLiveState,
      saveDocument,
      createPageAndOpen,
      deletePage,
    }),
    [
      activePage,
      createPageAndOpen,
      deleteError,
      deletePage,
      deleteStatus,
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
      updateComponentConfig,
      updateComponentLiveState,
      updateEditorText,
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
  const component = context.document.components[
    instanceId
  ] as PageComponentDocumentByType<TType> | undefined;

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
