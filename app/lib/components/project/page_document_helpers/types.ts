import type { Doc } from "@/convex/_generated/dataModel";
import type { PlanTier } from "@/lib/billing/plans";
import type {
  PageComponentDocument,
  PageComponentLiveState,
  PageDocumentV1,
} from "@/lib/pageDocument";
import type { InsertableComponentCommand } from "../EditModeContext";

export type SaveStatus = "idle" | "saving" | "error";
export type DeleteStatus = "idle" | "deleting" | "error";
export type ViewerProjectRole = Doc<"projectMembers">["role"];

export type ActivePageState = {
  project: {
    id: string;
    name: string;
  };
  page: {
    id: string;
    title: string;
    description: string | null;
    createdAt: number;
    updatedAt: number;
  };
};

export type PageDocumentContextValue = {
  isActivePage: boolean;
  isLoading: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  deleteStatus: DeleteStatus;
  deleteError: string | null;
  hasUnsavedChanges: boolean;
  activePage: ActivePageState | null;
  viewerRole: ViewerProjectRole | null;
  planTier: PlanTier | null;
  canUseLimitedComponents: boolean;
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
  applyPageTemplate: (args: {
    templateId: string;
    expectedUpdatedAt: number;
  }) => Promise<void>;
  createPageAndOpen: () => Promise<void>;
  deletePage: () => Promise<void>;
};

export type ActivePageDocumentContextValue = PageDocumentContextValue & {
  activePage: ActivePageState;
  document: PageDocumentV1;
};

export type ProjectPageSummary = {
  id: string;
};
