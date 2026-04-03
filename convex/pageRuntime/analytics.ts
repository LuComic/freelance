import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { APP_ERROR_CODES, ConvexDomainError } from "../lib/errors";
import { requireProjectMember } from "../lib/permissions";
import {
  getOrderedProjectPages,
  requireProjectById,
} from "../lib/projectRecords";
import { parsePageDocument } from "../pages/content";
import { getCurrentEntitlementsForUser } from "../billing/model";
import {
  PAGE_COMPONENT_TOKEN_REGEX,
  type FeedbackItem,
  type KanbanItem,
  type PageComponentDocument,
  type PageDocumentV1,
} from "../../lib/pageDocument";

type AnalyticsComponentType =
  | "Select"
  | "Radio"
  | "Feedback"
  | "Kanban"
  | "SimpleInput";

type AnalyticsActivityChange = {
  componentInstanceId: string;
  componentType: AnalyticsComponentType;
  componentLabelSnapshot: string;
  oldValue?: string;
  newValue?: string;
};

type LatestAnalyticsChangeGroup = {
  id: Doc<"projectActivity">["_id"];
  page: string;
  title: string;
  actorName: string;
  createdAt: number;
  entries: Array<{
    createdAt: number;
    order: number;
    kind: "added" | "removed";
    value: string;
  }>;
};

type AnalyticsInputValuesComponent = {
  kind: "values";
  title: string;
  values: string[];
  emptyLabel: string;
};

type AnalyticsInputKanbanComponent = {
  kind: "kanban";
  title: "Kanban";
  items: Array<{
    id: number;
    feature: string;
    status: "Todo" | "In Progress" | "Done";
    dismissed?: boolean;
  }>;
};

type AnalyticsInputComponent =
  | AnalyticsInputValuesComponent
  | AnalyticsInputKanbanComponent;

type SelectDocument = Extract<PageComponentDocument, { type: "Select" }>;
type RadioDocument = Extract<PageComponentDocument, { type: "Radio" }>;
type FeedbackDocument = Extract<PageComponentDocument, { type: "Feedback" }>;
type KanbanDocument = Extract<PageComponentDocument, { type: "Kanban" }>;
type SimpleInputDocument = Extract<
  PageComponentDocument,
  { type: "SimpleInput" }
>;

function isAnalyticsComponentType(
  type: PageComponentDocument["type"],
): type is AnalyticsComponentType {
  return (
    type === "Select" ||
    type === "Radio" ||
    type === "Feedback" ||
    type === "Kanban" ||
    type === "SimpleInput"
  );
}

function getOrderedAnalyticsComponents(document: PageDocumentV1) {
  const seenComponentIds = new Set<string>();
  const orderedComponents: Array<{
    instanceId: string;
    component: PageComponentDocument;
  }> = [];

  for (const match of document.editorText.matchAll(
    PAGE_COMPONENT_TOKEN_REGEX,
  )) {
    const instanceId = match[2];
    const component = document.components[instanceId];

    if (
      !component ||
      seenComponentIds.has(instanceId) ||
      !isAnalyticsComponentType(component.type)
    ) {
      continue;
    }

    seenComponentIds.add(instanceId);
    orderedComponents.push({
      instanceId,
      component,
    });
  }

  for (const [instanceId, component] of Object.entries(document.components)) {
    if (
      seenComponentIds.has(instanceId) ||
      !isAnalyticsComponentType(component.type)
    ) {
      continue;
    }

    orderedComponents.push({
      instanceId,
      component,
    });
  }

  return orderedComponents;
}

function getComponentLabel(component: PageComponentDocument) {
  switch (component.type) {
    case "Select":
    case "Radio": {
      const title = component.config.title.trim();
      return title || component.type;
    }
    case "Feedback":
      return "Feedback";
    case "Kanban":
      return "Kanban";
    case "SimpleInput":
      return "Simple Input";
    default:
      return component.type;
  }
}

function getSelectedOptionLabels(component: SelectDocument) {
  const selectedOptionIds = new Set(component.state.selectedOptionIds);

  return component.config.options
    .filter((option) => selectedOptionIds.has(option.id))
    .map((option) => option.label);
}

function getSelectedRadioLabel(component: RadioDocument) {
  if (component.state.selectedOptionId === null) {
    return null;
  }

  return (
    component.config.options.find(
      (option) => option.id === component.state.selectedOptionId,
    )?.label ?? null
  );
}

function getVisiblePendingFeedbackLabels(items: FeedbackItem[]) {
  return items
    .filter((item) => item.status === "pending" && item.dismissed !== true)
    .map((item) => item.feature);
}

function buildStringCountMap(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function diffFeedbackLabels(currentLabels: string[], nextLabels: string[]) {
  const currentCounts = buildStringCountMap(currentLabels);
  const nextCounts = buildStringCountMap(nextLabels);
  const orderedLabels: string[] = [];
  const seenLabels = new Set<string>();

  for (const label of [...currentLabels, ...nextLabels]) {
    if (seenLabels.has(label)) {
      continue;
    }

    seenLabels.add(label);
    orderedLabels.push(label);
  }

  const changes: Array<Pick<AnalyticsActivityChange, "oldValue" | "newValue">> =
    [];

  for (const label of orderedLabels) {
    const currentCount = currentCounts.get(label) ?? 0;
    const nextCount = nextCounts.get(label) ?? 0;

    if (nextCount > currentCount) {
      for (let count = 0; count < nextCount - currentCount; count += 1) {
        changes.push({
          newValue: label,
        });
      }
    }

    if (currentCount > nextCount) {
      for (let count = 0; count < currentCount - nextCount; count += 1) {
        changes.push({
          oldValue: label,
        });
      }
    }
  }

  return changes;
}

function getVisibleKanbanItems(items: KanbanItem[]) {
  return items.filter((item) => item.dismissed !== true);
}

function formatKanbanValue(item: Pick<KanbanItem, "feature" | "status">) {
  return `${item.feature} - ${item.status}`;
}

function toAnalyticsInputComponent(
  component: PageComponentDocument,
): AnalyticsInputComponent | null {
  switch (component.type) {
    case "Select":
      return {
        kind: "values",
        title: getComponentLabel(component),
        values: getSelectedOptionLabels(component),
        emptyLabel: "No values selected.",
      };
    case "Radio": {
      const selectedLabel = getSelectedRadioLabel(component);

      return {
        kind: "values",
        title: getComponentLabel(component),
        values: selectedLabel ? [selectedLabel] : [],
        emptyLabel: "No value selected.",
      };
    }
    case "Feedback":
      return {
        kind: "values",
        title: "Feedback",
        values: getVisiblePendingFeedbackLabels(component.state.items),
        emptyLabel: "No pending ideas.",
      };
    case "Kanban":
      return {
        kind: "kanban",
        title: "Kanban",
        items: getVisibleKanbanItems(component.state.items).map((item) => ({
          id: item.id,
          feature: item.feature,
          status: item.status,
          ...(item.dismissed === true ? { dismissed: true } : {}),
        })),
      };
    case "SimpleInput":
      return {
        kind: "values",
        title: "Simple Input",
        values: component.state.inputs.map((input) => input.value),
        emptyLabel: "No inputs yet.",
      };
    default:
      return null;
  }
}

export function getAnalyticsInputSummary(document: PageDocumentV1) {
  return getOrderedAnalyticsComponents(document)
    .map(({ component }) => toAnalyticsInputComponent(component))
    .filter(
      (component): component is AnalyticsInputComponent => component !== null,
    );
}

export function getAnalyticsActivityChanges(
  currentDocument: PageDocumentV1,
  nextDocument: PageDocumentV1,
) {
  const changes: AnalyticsActivityChange[] = [];

  for (const {
    instanceId,
    component: currentComponent,
  } of getOrderedAnalyticsComponents(currentDocument)) {
    const nextComponent = nextDocument.components[instanceId];

    if (
      !nextComponent ||
      nextComponent.type !== currentComponent.type ||
      !isAnalyticsComponentType(nextComponent.type)
    ) {
      continue;
    }

    const componentLabelSnapshot = getComponentLabel(nextComponent);

    switch (currentComponent.type) {
      case "Select": {
        const nextSelectComponent = nextComponent as SelectDocument;
        const currentLabels = getSelectedOptionLabels(currentComponent);
        const nextLabels = getSelectedOptionLabels(nextSelectComponent);
        const currentLabelSet = new Set(currentLabels);
        const nextLabelSet = new Set(nextLabels);

        for (const label of nextLabels) {
          if (!currentLabelSet.has(label)) {
            changes.push({
              componentInstanceId: instanceId,
              componentType: currentComponent.type,
              componentLabelSnapshot,
              newValue: label,
            });
          }
        }

        for (const label of currentLabels) {
          if (!nextLabelSet.has(label)) {
            changes.push({
              componentInstanceId: instanceId,
              componentType: currentComponent.type,
              componentLabelSnapshot,
              oldValue: label,
            });
          }
        }
        break;
      }
      case "Radio": {
        const nextRadioComponent = nextComponent as RadioDocument;
        const currentLabel = getSelectedRadioLabel(currentComponent);
        const nextLabel = getSelectedRadioLabel(nextRadioComponent);

        if (currentLabel !== nextLabel) {
          changes.push({
            componentInstanceId: instanceId,
            componentType: currentComponent.type,
            componentLabelSnapshot,
            ...(currentLabel ? { oldValue: currentLabel } : {}),
            ...(nextLabel ? { newValue: nextLabel } : {}),
          });
        }
        break;
      }
      case "Feedback": {
        const nextFeedbackComponent = nextComponent as FeedbackDocument;
        const feedbackChanges = diffFeedbackLabels(
          getVisiblePendingFeedbackLabels(currentComponent.state.items),
          getVisiblePendingFeedbackLabels(nextFeedbackComponent.state.items),
        );

        for (const change of feedbackChanges) {
          changes.push({
            componentInstanceId: instanceId,
            componentType: currentComponent.type,
            componentLabelSnapshot,
            ...change,
          });
        }
        break;
      }
      case "Kanban": {
        const nextKanbanComponent = nextComponent as KanbanDocument;
        const currentItemsById = new Map(
          currentComponent.state.items.map((item) => [item.id, item]),
        );

        for (const item of getVisibleKanbanItems(
          nextKanbanComponent.state.items,
        )) {
          const currentItem = currentItemsById.get(item.id);

          if (!currentItem) {
            changes.push({
              componentInstanceId: instanceId,
              componentType: currentComponent.type,
              componentLabelSnapshot,
              newValue: formatKanbanValue(item),
            });
            continue;
          }

          if (currentItem.dismissed === true) {
            continue;
          }

          if (currentItem.status !== item.status) {
            changes.push({
              componentInstanceId: instanceId,
              componentType: currentComponent.type,
              componentLabelSnapshot,
              oldValue: formatKanbanValue(currentItem),
              newValue: formatKanbanValue(item),
            });
          }
        }
        break;
      }
      case "SimpleInput": {
        const nextSimpleInputComponent = nextComponent as SimpleInputDocument;
        const currentInputIds = new Set(
          currentComponent.state.inputs.map((input) => input.id),
        );

        for (const input of nextSimpleInputComponent.state.inputs) {
          if (currentInputIds.has(input.id)) {
            continue;
          }

          changes.push({
            componentInstanceId: instanceId,
            componentType: currentComponent.type,
            componentLabelSnapshot,
            newValue: "added an input",
          });
        }
        break;
      }
    }
  }

  return changes;
}

function getLatestChangeGroupKey(activity: Doc<"projectActivity">) {
  return `${activity.pageId}:${activity.actorUserId}:${activity.componentInstanceId}`;
}

function groupLatestActivity(
  latestActivity: Doc<"projectActivity">[],
  limit: number,
) {
  const groups = new Map<string, LatestAnalyticsChangeGroup>();
  const orderedGroups: LatestAnalyticsChangeGroup[] = [];

  for (const activity of latestActivity) {
    const groupKey = getLatestChangeGroupKey(activity);
    let group = groups.get(groupKey);

    if (!group) {
      group = {
        id: activity._id,
        page: activity.pageTitleSnapshot,
        title: activity.componentLabelSnapshot,
        actorName: activity.actorNameSnapshot,
        createdAt: activity.createdAt,
        entries: [],
      };
      groups.set(groupKey, group);
      orderedGroups.push(group);
    }

    const baseOrder = (activity.entryOrder ?? group.entries.length) * 2;

    if (activity.oldValue) {
      group.entries.push({
        createdAt: activity.createdAt,
        order: baseOrder,
        kind: "removed",
        value: activity.oldValue,
      });
    }

    if (activity.newValue) {
      group.entries.push({
        createdAt: activity.createdAt,
        order: baseOrder + 1,
        kind: "added",
        value: activity.newValue,
      });
    }
  }

  return orderedGroups.slice(0, limit).map((group) => ({
    id: group.id,
    page: group.page,
    title: group.title,
    actorName: group.actorName,
    createdAt: group.createdAt,
    entries: group.entries
      .sort((left, right) => {
        if (left.createdAt !== right.createdAt) {
          return right.createdAt - left.createdAt;
        }

        return left.order - right.order;
      })
      .map(({ kind, value }) => ({
        kind,
        value,
      })),
  }));
}

export const getProjectAnalytics = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      const { userId } = await requireCurrentAuth(ctx);
      const project = await requireProjectById(ctx, args.projectId);

      await requireProjectMember(ctx, project._id, userId);
      const entitlements = await getCurrentEntitlementsForUser(ctx, userId);

      if (!entitlements.canAccessAnalytics) {
        return null;
      }

      const [pages, latestActivity] = await Promise.all([
        getOrderedProjectPages(ctx, project),
        ctx.db
          .query("projectActivity")
          .withIndex("by_project_created", (query) =>
            query.eq("projectId", project._id),
          )
          .order("desc")
          .take(50),
      ]);

      return {
        project: {
          id: project._id,
          name: project.name,
        },
        latestChanges: groupLatestActivity(latestActivity, 3),
        inputs: pages.map((page) => ({
          page: page.title,
          components: getAnalyticsInputSummary(
            parsePageDocument(page.contentJson),
          ),
        })),
      };
    } catch (error) {
      if (
        error instanceof ConvexDomainError &&
        (error.code === APP_ERROR_CODES.notFound ||
          error.code === APP_ERROR_CODES.unauthorized)
      ) {
        return null;
      }

      throw error;
    }
  },
});
