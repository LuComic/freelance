"use client";

import { api } from "@/convex/_generated/api";
import {
  createComponentInstanceId,
  createComponentToken,
  createDefaultComponentInstance,
  createDefaultLiveState,
  type PageComponentInstance,
  type PageComponentInstanceByType,
  type PageComponentLiveState,
  type PageComponentLiveStateByType,
  type PageComponentType,
  type PageConfigDocumentV1,
  type PageLiveDocumentV1,
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

type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  configDocument: PageConfigDocumentV1 | null;
  liveDocument: PageLiveDocumentV1 | null;
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
    updater: (component: PageComponentInstance) => PageComponentInstance,
  ) => void;
  updateComponentLiveState: (
    instanceId: string,
    updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
  ) => void;
  createPageAndOpen: () => Promise<void>;
};

type ActivePageDocumentContextValue = PageDocumentContextValue & {
  activePage: ActivePageState;
  configDocument: PageConfigDocumentV1;
  liveDocument: PageLiveDocumentV1;
};

const PageDocumentContext = createContext<PageDocumentContextValue | null>(null);

const CONFIG_SAVE_DELAY_MS = 750;
const LIVE_SAVE_DELAY_MS = 300;
const TITLE_SAVE_DELAY_MS = 500;

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
  const [configDocument, setConfigDocument] = useState<PageConfigDocumentV1 | null>(
    null,
  );
  const [liveDocument, setLiveDocument] = useState<PageLiveDocumentV1 | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingLive, setIsSavingLive] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const componentSeedRef = useRef(0);
  const lastSavedConfigRef = useRef<string | null>(null);
  const lastSavedLiveRef = useRef<string | null>(null);
  const lastSavedTitleRef = useRef<string | null>(null);
  const lastHydratedPageKeyRef = useRef<string | null>(null);
  const pendingRoutePageIdRef = useRef<string | null>(null);
  const pageQueryArgs =
    route === null
      ? "skip"
      : {
          projectSlug: route.projectSlug,
          pageSlug: route.pageSlug,
          pageId:
            pendingRoutePageIdRef.current &&
            activePage &&
            activePage.project.slug === route.projectSlug &&
            activePage.page.id === pendingRoutePageIdRef.current &&
            activePage.page.slug !== route.pageSlug
              ? (pendingRoutePageIdRef.current as never)
              : undefined,
        };
  const pageData = useQuery(
    api.pages.queries.getPageEditorBySlugs,
    pageQueryArgs,
  );
  const renamePage = useMutation(api.pages.mutations.renamePage);
  const savePageConfigDocument = useMutation(
    api.pages.mutations.savePageConfigDocument,
  );
  const savePageLiveDocument = useMutation(api.pages.mutations.savePageLiveDocument);
  const createPage = useMutation(api.pages.mutations.createPage);

  useEffect(() => {
    if (!route || pageData === undefined) {
      if (!route) {
        setActivePage(null);
        setConfigDocument(null);
        setLiveDocument(null);
        setSaveError(null);
        lastHydratedPageKeyRef.current = null;
        pendingRoutePageIdRef.current = null;
      }
      return;
    }

    const nextPageKey = `${pageData.project.id}:${pageData.page.id}`;
    if (nextPageKey === lastHydratedPageKeyRef.current) {
      return;
    }

    lastHydratedPageKeyRef.current = nextPageKey;

    setActivePage({
      project: pageData.project,
      page: pageData.page,
    });
    setConfigDocument(pageData.configDocument);
    setLiveDocument(pageData.liveDocument);
    lastSavedConfigRef.current = JSON.stringify(pageData.configDocument);
    lastSavedLiveRef.current = JSON.stringify(pageData.liveDocument);
    lastSavedTitleRef.current = pageData.page.title;
    setSaveError(null);
  }, [pageData, route]);

  useEffect(() => {
    if (!route || !activePage) {
      pendingRoutePageIdRef.current = null;
      return;
    }

    if (
      route.projectSlug === activePage.project.slug &&
      route.pageSlug === activePage.page.slug
    ) {
      pendingRoutePageIdRef.current = null;
    }
  }, [activePage, route]);

  useEffect(() => {
    if (!activePage || !configDocument) {
      return;
    }

    const serialized = JSON.stringify(configDocument);
    if (serialized === lastSavedConfigRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSavingConfig(true);
      setSaveError(null);

      try {
        await savePageConfigDocument({
          pageId: activePage.page.id as never,
          document: configDocument,
        });
        lastSavedConfigRef.current = serialized;
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Could not save page content.",
        );
      } finally {
        setIsSavingConfig(false);
      }
    }, CONFIG_SAVE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activePage, configDocument, savePageConfigDocument]);

  useEffect(() => {
    if (!activePage || !liveDocument) {
      return;
    }

    const serialized = JSON.stringify(liveDocument);
    if (serialized === lastSavedLiveRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSavingLive(true);
      setSaveError(null);

      try {
        await savePageLiveDocument({
          pageId: activePage.page.id as never,
          document: liveDocument,
        });
        lastSavedLiveRef.current = serialized;
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Could not save live page state.",
        );
      } finally {
        setIsSavingLive(false);
      }
    }, LIVE_SAVE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activePage, liveDocument, savePageLiveDocument]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    const trimmedTitle = activePage.page.title.trim();
    if (!trimmedTitle || trimmedTitle === lastSavedTitleRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSavingTitle(true);
      setSaveError(null);

      try {
        const result = await renamePage({
          pageId: activePage.page.id as never,
          title: trimmedTitle,
        });
        lastSavedTitleRef.current = result.title;
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
          pendingRoutePageIdRef.current = result.pageId;
          router.replace(`/projects/${route.projectSlug}/${result.slug}`);
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Could not rename page.",
        );
      } finally {
        setIsSavingTitle(false);
      }
    }, TITLE_SAVE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activePage, renamePage, route, router]);

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
  }, []);

  const updateEditorText = useCallback((value: string) => {
    setConfigDocument((prev) =>
      prev
        ? {
            ...prev,
            editorText: value,
          }
        : prev,
    );
  }, []);

  const updateComponentConfig = useCallback(
    (
      instanceId: string,
      updater: (component: PageComponentInstance) => PageComponentInstance,
    ) => {
      setConfigDocument((prev) => {
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
    },
    [],
  );

  const updateComponentLiveState = useCallback(
    (
      instanceId: string,
      updater: (liveState: PageComponentLiveState) => PageComponentLiveState,
    ) => {
      setLiveDocument((prev) => {
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

      setConfigDocument((prev) =>
        prev
          ? {
              ...prev,
              editorText: nextValue,
              components: {
                ...prev.components,
                [instanceId]: createDefaultComponentInstance(type, instanceId),
              },
            }
          : prev,
      );

      setLiveDocument((prev) =>
        prev
          ? {
              ...prev,
              components: {
                ...prev.components,
                [instanceId]: createDefaultLiveState(type),
              },
            }
          : prev,
      );

      return {
        nextValue,
        nextCursor: start + token.length,
      };
    },
    [],
  );

  const createPageAndOpen = useCallback(async () => {
    if (!activePage) {
      return;
    }

    const result = await createPage({
      projectId: activePage.project.id as never,
    });
    router.push(`/projects/${activePage.project.slug}/${result.pageSlug}`);
  }, [activePage, createPage, router]);

  const saveStatus: SaveStatus = saveError
    ? "error"
    : isSavingConfig || isSavingLive || isSavingTitle
      ? "saving"
      : lastSavedConfigRef.current !== null
        ? "saved"
        : "idle";

  const value = useMemo<PageDocumentContextValue>(
    () => ({
      isActivePage: route !== null,
      isLoading: route !== null && pageData === undefined,
      saveStatus,
      saveError,
      activePage,
      configDocument,
      liveDocument,
      setPageTitle,
      updateEditorText,
      insertComponentAtRange,
      updateComponentConfig,
      updateComponentLiveState,
      createPageAndOpen,
    }),
    [
      activePage,
      configDocument,
      createPageAndOpen,
      insertComponentAtRange,
      liveDocument,
      pageData,
      route,
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
  if (!context || !context.activePage || !context.configDocument || !context.liveDocument) {
    throw new Error("usePageDocument must be used on an active page route.");
  }
  return context as ActivePageDocumentContextValue;
}

export function usePageComponentState<TType extends PageComponentType>(
  instanceId: string,
  expectedType: TType,
) {
  const context = usePageDocument();
  const component = context.configDocument.components[
    instanceId
  ] as PageComponentInstanceByType<TType> | undefined;
  const liveState = context.liveDocument.components[
    instanceId
  ] as PageComponentLiveStateByType<TType> | undefined;

  if (!component || component.type !== expectedType) {
    throw new Error(`Component ${instanceId} was not found.`);
  }

  if (!liveState || liveState.type !== expectedType) {
    throw new Error(`Live state for component ${instanceId} was not found.`);
  }

  return {
    component,
    liveState,
    updateConfig: (
      updater: (
        config: PageComponentInstanceByType<TType>["config"],
      ) => PageComponentInstanceByType<TType>["config"],
    ) =>
      context.updateComponentConfig(instanceId, (currentComponent) => {
        const typedComponent =
          currentComponent as PageComponentInstanceByType<TType>;
        return {
          ...typedComponent,
          config: updater(typedComponent.config),
        } as PageComponentInstance;
      }),
    updateLiveState: (
      updater: (
        state: PageComponentLiveStateByType<TType>["state"],
      ) => PageComponentLiveStateByType<TType>["state"],
    ) =>
      context.updateComponentLiveState(instanceId, (currentLiveState) => {
        const typedLiveState =
          currentLiveState as PageComponentLiveStateByType<TType>;
        return {
          ...typedLiveState,
          state: updater(typedLiveState.state),
        } as PageComponentLiveState;
      }),
  };
}
