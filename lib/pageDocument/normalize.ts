import {
  createDefaultComponentInstance,
  createDefaultLiveState,
} from "./defaults";
import {
  createComponentToken,
  DEFAULT_PAGE_EDITOR_TEXT,
  isPageComponentType,
  LEGACY_COMPONENT_TAG_REGEX,
  PAGE_COMPONENT_TOKEN_REGEX,
  type FeedbackItem,
  type KanbanItem,
  type MainHeadlineComponentInstance,
  type PageLinkComponentInstance,
  type PageComponentDocument,
  type PageComponentInstance,
  type PageComponentLiveState,
  type PageComponentType,
  type PageDocumentV1,
  type PageOption,
  type SectionHeaderComponentInstance,
  type SubheaderComponentInstance,
} from "./types";
import { isRecord } from "./utils";

function normalizeOptions(value: unknown, fallback: PageOption[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const options = value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      const id =
        typeof item.id === "number" && Number.isFinite(item.id)
          ? item.id
          : index + 1;
      const label =
        typeof item.label === "string" && item.label.trim()
          ? item.label.trim()
          : null;

      if (!label) {
        return null;
      }

      return { id, label };
    })
    .filter((item): item is PageOption => item !== null);

  return options.length > 0 ? options : [...fallback];
}

function normalizeFeedbackItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item) || typeof item.feature !== "string") {
        return null;
      }

      const status =
        item.status === "pending" ||
        item.status === "accepted" ||
        item.status === "declined"
          ? item.status
          : "pending";

      const tags = Array.isArray(item.tags)
        ? item.tags.filter((tag): tag is string => typeof tag === "string")
        : [];

      const result: FeedbackItem = {
        feature: item.feature,
        status,
        tags,
        ...(typeof item.reason === "string" ? { reason: item.reason } : {}),
        ...(item.dismissed === true ? { dismissed: true } : {}),
      };

      return result;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function normalizeKanbanItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item) || typeof item.feature !== "string") {
        return null;
      }

      const status =
        item.status === "Todo" ||
        item.status === "In Progress" ||
        item.status === "Done"
          ? item.status
          : "Todo";
      const id =
        typeof item.id === "number" && Number.isFinite(item.id)
          ? item.id
          : index + 1;
      const tags = Array.isArray(item.tags)
        ? item.tags.filter((tag): tag is string => typeof tag === "string")
        : [];

      const result: KanbanItem = {
        id,
        feature: item.feature,
        status,
        tags,
        ...(item.dismissed === true ? { dismissed: true } : {}),
      };

      return result;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function normalizeComponentInstance(
  id: string,
  type: PageComponentType,
  value: unknown,
): PageComponentInstance {
  switch (type) {
    case "TestingComponent": {
      const fallback = createDefaultComponentInstance("TestingComponent", id);
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          mockText:
            typeof value.config.mockText === "string"
              ? value.config.mockText
              : fallback.config.mockText,
        },
      };
    }
    case "Select": {
      const fallback = createDefaultComponentInstance("Select", id);
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          title:
            typeof value.config.title === "string"
              ? value.config.title
              : fallback.config.title,
          description:
            typeof value.config.description === "string"
              ? value.config.description
              : fallback.config.description,
          options: normalizeOptions(
            value.config.options,
            fallback.config.options,
          ),
        },
      };
    }
    case "Radio": {
      const fallback = createDefaultComponentInstance("Radio", id);
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          title:
            typeof value.config.title === "string"
              ? value.config.title
              : fallback.config.title,
          description:
            typeof value.config.description === "string"
              ? value.config.description
              : fallback.config.description,
          options: normalizeOptions(
            value.config.options,
            fallback.config.options,
          ),
        },
      };
    }
    case "Feedback": {
      const fallback = createDefaultComponentInstance("Feedback", id);
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          tags: Array.isArray(value.config.tags)
            ? value.config.tags.filter(
                (tag): tag is string => typeof tag === "string",
              )
            : fallback.config.tags,
        },
      };
    }
    case "Kanban": {
      const fallback = createDefaultComponentInstance("Kanban", id);
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          tags: Array.isArray(value.config.tags)
            ? value.config.tags.filter(
                (tag): tag is string => typeof tag === "string",
              )
            : fallback.config.tags,
        },
      };
    }
    case "MainHeadline":
    case "SectionHeader":
    case "Subheader": {
      const fallback = createDefaultComponentInstance(type, id) as
        | MainHeadlineComponentInstance
        | SectionHeaderComponentInstance
        | SubheaderComponentInstance;
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          text:
            typeof value.config.text === "string"
              ? value.config.text
              : fallback.config.text,
        },
      };
    }
    case "PageLink": {
      const fallback = createDefaultComponentInstance(
        "PageLink",
        id,
      ) as PageLinkComponentInstance;
      if (!isRecord(value) || value.type !== type || !isRecord(value.config)) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          text:
            typeof value.config.text === "string"
              ? value.config.text
              : fallback.config.text,
          targetPageId:
            typeof value.config.targetPageId === "string" ||
            value.config.targetPageId === null
              ? value.config.targetPageId
              : fallback.config.targetPageId,
        },
      };
    }
  }
}

function normalizeLiveState(
  type: PageComponentType,
  value: unknown,
): PageComponentLiveState {
  switch (type) {
    case "TestingComponent": {
      const fallback = createDefaultLiveState("TestingComponent");
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return fallback;
    }
    case "Select": {
      const fallback = createDefaultLiveState("Select");
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return {
        type,
        state: {
          selectedOptionIds: Array.isArray(value.state.selectedOptionIds)
            ? value.state.selectedOptionIds.filter(
                (id): id is number =>
                  typeof id === "number" && Number.isFinite(id),
              )
            : fallback.state.selectedOptionIds,
        },
      };
    }
    case "Radio": {
      const fallback = createDefaultLiveState("Radio");
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return {
        type,
        state: {
          selectedOptionId:
            typeof value.state.selectedOptionId === "number" ||
            value.state.selectedOptionId === null
              ? value.state.selectedOptionId
              : fallback.state.selectedOptionId,
        },
      };
    }
    case "Feedback": {
      const fallback = createDefaultLiveState("Feedback");
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return {
        type,
        state: {
          items: normalizeFeedbackItems(value.state.items),
        },
      };
    }
    case "Kanban": {
      const fallback = createDefaultLiveState("Kanban");
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return {
        type,
        state: {
          items: normalizeKanbanItems(value.state.items),
        },
      };
    }
    case "MainHeadline":
    case "SectionHeader":
    case "Subheader":
    case "PageLink": {
      const fallback = createDefaultLiveState(type);
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return fallback;
    }
  }
}

export function createInitialPageDocument(): PageDocumentV1 {
  return {
    version: 1,
    editorText: DEFAULT_PAGE_EDITOR_TEXT,
    components: {},
  };
}

export function createComponentInstanceId(seed: number) {
  return `cmp_${seed.toString(36)}`;
}

export function normalizePageConfigDocument(value: unknown): PageDocumentV1 {
  const base = createInitialPageDocument();
  const record = isRecord(value) ? value : null;
  const rawEditorText =
    record && typeof record.editorText === "string"
      ? record.editorText
      : typeof value === "string"
        ? value
        : base.editorText;
  const rawComponents =
    record && isRecord(record.components) ? record.components : {};

  let legacyCounter = 0;
  const migratedComponents: Record<string, PageComponentInstance> = {};
  const editorText = rawEditorText.replace(
    LEGACY_COMPONENT_TAG_REGEX,
    (match, tag: string) => {
      if (!isPageComponentType(tag)) {
        return match;
      }

      legacyCounter += 1;
      const id = createComponentInstanceId(legacyCounter);
      migratedComponents[id] = createDefaultComponentInstance(tag, id);
      return createComponentToken(tag, id);
    },
  );

  const nextComponents: Record<string, PageComponentInstance> = {
    ...migratedComponents,
  };

  for (const match of editorText.matchAll(PAGE_COMPONENT_TOKEN_REGEX)) {
    const type = match[1];
    const id = match[2];
    if (!isPageComponentType(type)) {
      continue;
    }

    nextComponents[id] = normalizeComponentInstance(
      id,
      type,
      rawComponents[id],
    );
  }

  const nextDocumentComponents: Record<string, PageComponentDocument> = {};

  for (const [id, instance] of Object.entries(nextComponents)) {
    const rawComponent = rawComponents[id];
    const liveState = normalizeLiveState(instance.type, rawComponent);
    nextDocumentComponents[id] = {
      ...instance,
      state: liveState.state,
    } as PageComponentDocument;
  }

  return {
    version: 1,
    editorText,
    components: nextDocumentComponents,
  };
}

export function normalizePageDocument(value: unknown): PageDocumentV1 {
  const configDocument = normalizePageConfigDocument(value);
  const nextComponents: Record<string, PageComponentDocument> = {};

  for (const [id, instance] of Object.entries(configDocument.components)) {
    const rawComponent =
      isRecord(value) && isRecord(value.components)
        ? value.components[id]
        : undefined;
    const liveState = normalizeLiveState(instance.type, rawComponent);
    nextComponents[id] = {
      ...instance,
      state: liveState.state,
    } as PageComponentDocument;
  }

  return {
    version: 1,
    editorText: configDocument.editorText,
    components: nextComponents,
  };
}

export function mergePageLiveStateDocument(
  baseDocument: PageDocumentV1,
  value: unknown,
): PageDocumentV1 {
  const nextComponents: Record<string, PageComponentDocument> = {};
  const rawComponents =
    isRecord(value) && isRecord(value.components) ? value.components : {};

  for (const [id, component] of Object.entries(baseDocument.components)) {
    const rawComponent = rawComponents[id];

    if (
      !isRecord(rawComponent) ||
      rawComponent.type !== component.type ||
      !isRecord(rawComponent.state)
    ) {
      nextComponents[id] = component;
      continue;
    }

    const liveState = normalizeLiveState(component.type, rawComponent);
    nextComponents[id] = {
      ...component,
      state: liveState.state,
    } as PageComponentDocument;
  }

  return {
    version: 1,
    editorText: baseDocument.editorText,
    components: nextComponents,
  };
}
