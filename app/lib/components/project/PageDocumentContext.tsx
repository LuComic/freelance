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
import type { InsertableComponentCommand } from "./EditModeContext";
import { resolveComponentTypeFromCommand } from "../page_components/testing_editor/commands";

type SaveStatus = "idle" | "saving" | "error";

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
  saveDocument: () => Promise<void>;
  createPageAndOpen: () => Promise<void>;
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
  const pathname = usePathname();
  const router = useRouter();
  const route = getPageRoute(pathname);
  const [activePage, setActivePage] = useState<ActivePageState | null>(null);
  const [document, setDocument] = useState<PageDocumentV1 | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingRoutePageId, setPendingRoutePageId] = useState<string | null>(null);
  const componentSeedRef = useRef(0);
  const lastHydratedPageKeyRef = useRef<string | null>(null);
  const activePageRef = useRef<ActivePageState | null>(null);
  const documentRef = useRef<PageDocumentV1 | null>(null);
  const pageQueryArgs =
    route === null
      ? "skip"
      : {
          projectSlug: route.projectSlug,
          pageSlug: route.pageSlug,
          pageId:
            pendingRoutePageId &&
            activePage &&
            activePage.project.slug === route.projectSlug &&
            activePage.page.id === pendingRoutePageId &&
            activePage.page.slug !== route.pageSlug
              ? (pendingRoutePageId as never)
              : undefined,
        };
  const pageData = useQuery(api.pages.queries.getPageEditorBySlugs, pageQueryArgs);
  const savePage = useMutation(api.pages.mutations.savePage);
  const createPage = useMutation(api.pages.mutations.createPage);

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
          setPendingRoutePageId(null);
        });
        lastHydratedPageKeyRef.current = null;
      }
      return;
    }

    const nextPageKey = `${pageData.project.id}:${pageData.page.id}`;
    if (nextPageKey === lastHydratedPageKeyRef.current) {
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
    });
  }, [pageData, route]);

  useEffect(() => {
    if (!route || !activePage) {
      if (pendingRoutePageId !== null) {
        queueMicrotask(() => {
          setPendingRoutePageId(null);
        });
      }
      return;
    }

    if (
      route.projectSlug === activePage.project.slug &&
      route.pageSlug === activePage.page.slug
    ) {
      if (pendingRoutePageId !== null) {
        queueMicrotask(() => {
          setPendingRoutePageId(null);
        });
      }
    }
  }, [activePage, pendingRoutePageId, route]);

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

  const saveDocument = useCallback(async () => {
    const currentPage = activePageRef.current;
    const currentDocument = documentRef.current;

    if (!currentPage || !currentDocument) {
      return;
    }

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

      if (route && result.slug !== route.pageSlug) {
        setPendingRoutePageId(result.pageId);
        router.replace(`/projects/${route.projectSlug}/${result.slug}`);
      }

      setSaveStatus("idle");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save page.",
      );
      setSaveStatus("error");
    }
  }, [route, router, savePage]);

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

  const value = useMemo<PageDocumentContextValue>(
    () => ({
      isActivePage: route !== null,
      isLoading: route !== null && pageData === undefined,
      saveStatus,
      saveError,
      activePage,
      document,
      setPageTitle,
      updateEditorText,
      insertComponentAtRange,
      updateComponentConfig,
      updateComponentLiveState,
      saveDocument,
      createPageAndOpen,
    }),
    [
      activePage,
      createPageAndOpen,
      document,
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
  };
}
