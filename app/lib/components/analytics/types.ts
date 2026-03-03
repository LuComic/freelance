import type { Id } from "@/convex/_generated/dataModel";

export type AnalyticsKanbanItem = {
  id: number;
  feature: string;
  status: "Todo" | "In Progress" | "Done";
  dismissed?: boolean;
};

export type AnalyticsInputValuesComponent = {
  kind: "values";
  title: string;
  values: string[];
  emptyLabel: string;
};

export type AnalyticsInputKanbanComponent = {
  kind: "kanban";
  title: "Kanban";
  items: AnalyticsKanbanItem[];
};

export type AnalyticsInputComponent =
  | AnalyticsInputValuesComponent
  | AnalyticsInputKanbanComponent;

export type DropdownItem = {
  page: string;
  components: AnalyticsInputComponent[];
};

export type LatestChange = {
  id: Id<"projectActivity">;
  page: string;
  title: string;
  actorName: string;
  entries: Array<{
    kind: "added" | "removed";
    value: string;
  }>;
  createdAt: number;
};

export type AnalyticsPageData = {
  project: {
    id: Id<"projects">;
    slug: string;
    name: string;
  };
  latestChanges: LatestChange[];
  inputs: DropdownItem[];
};
