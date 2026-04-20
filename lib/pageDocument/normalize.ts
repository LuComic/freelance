import {
  createDefaultComponentInstance,
  createDefaultLiveState,
} from "./defaults";
import {
  getRegisteredPageComponentDefinition,
  isRegisteredPageComponentType,
  type RegisteredPageComponentType,
} from "./registeredComponents";
import {
  MAX_CALENDAR_EVENT_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IDEA_LENGTH,
  MAX_KANBAN_TASK_LENGTH,
  MAX_OPTIONS_PER_FIELD,
  MAX_OPTION_LABEL_LENGTH,
  MAX_SHORT_TITLE_LENGTH,
  MAX_TAG_LENGTH,
  truncateInput,
} from "../inputLimits";
import {
  createComponentToken,
  DEFAULT_PAGE_EDITOR_TEXT,
  LEGACY_COMPONENT_TAG_REGEX,
  PAGE_COMPONENT_TOKEN_REGEX,
  resolveStoredPageComponentType,
  type CalendarEvent,
  type FeedbackItem,
  type KanbanItem,
  type MainHeadlineComponentInstance,
  type PageLinkComponentInstance,
  type PageComponentDocument,
  type PageComponentInstance,
  type PageComponentInstanceByType,
  type PageComponentLiveState,
  type PageComponentLiveStateByType,
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
    .slice(0, MAX_OPTIONS_PER_FIELD)
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
          ? truncateInput(item.label.trim(), MAX_OPTION_LABEL_LENGTH)
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

      const feature = truncateInput(item.feature.trim(), MAX_IDEA_LENGTH);

      if (!feature) {
        return null;
      }

      const status =
        item.status === "pending" ||
        item.status === "accepted" ||
        item.status === "declined"
          ? item.status
          : "pending";

      const tags = Array.isArray(item.tags)
        ? item.tags
            .slice(0, MAX_OPTIONS_PER_FIELD)
            .map((tag) =>
              typeof tag === "string"
                ? truncateInput(tag.trim(), MAX_TAG_LENGTH)
                : "",
            )
            .filter((tag): tag is string => tag.length > 0)
        : [];

      const result: FeedbackItem = {
        feature,
        status,
        tags,
        ...(typeof item.reason === "string"
          ? {
              reason: truncateInput(item.reason.trim(), MAX_DESCRIPTION_LENGTH),
            }
          : {}),
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

      const feature = truncateInput(
        item.feature.trim(),
        MAX_KANBAN_TASK_LENGTH,
      );

      if (!feature) {
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
      const result: KanbanItem = {
        id,
        feature,
        status,
        ...(item.dismissed === true ? { dismissed: true } : {}),
      };

      return result;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function normalizeCalendarEvents(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item) || typeof item.title !== "string") {
        return null;
      }

      const startAt =
        typeof item.startAt === "number" && Number.isFinite(item.startAt)
          ? item.startAt
          : null;
      const endAt =
        typeof item.endAt === "number" && Number.isFinite(item.endAt)
          ? item.endAt
          : null;

      if (startAt === null || endAt === null || endAt <= startAt) {
        return null;
      }

      const color =
        item.color === "none" ||
        item.color === "red" ||
        item.color === "green" ||
        item.color === "yellow" ||
        item.color === "pink" ||
        item.color === "purple" ||
        item.color === "cyan"
          ? item.color
          : "none";

      const result: CalendarEvent = {
        id:
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id
            : crypto.randomUUID(),
        title: truncateInput(
          item.title.trim(),
          MAX_CALENDAR_EVENT_TITLE_LENGTH,
        ),
        color,
        startAt,
        endAt,
      };

      if (!result.title) {
        return null;
      }

      return result;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function matchesStoredComponentType(
  value: unknown,
  expectedType: PageComponentType,
) {
  return (
    typeof value === "string" &&
    resolveStoredPageComponentType(value) === expectedType
  );
}

function normalizeRegisteredComponentInstance<
  T extends RegisteredPageComponentType,
>(id: string, type: T, value: unknown): PageComponentInstanceByType<T> {
  const registeredDefinition = getRegisteredPageComponentDefinition(type);

  const fallback = createDefaultComponentInstance(type, id);
  const normalizeConfig = registeredDefinition.normalizeConfig as (
    value: unknown,
    fallback: PageComponentInstanceByType<T>["config"],
  ) => PageComponentInstanceByType<T>["config"];

  if (
    !isRecord(value) ||
    !matchesStoredComponentType(value.type, type) ||
    !isRecord(value.config)
  ) {
    return fallback;
  }

  return {
    id,
    type,
    config: normalizeConfig(value.config, fallback.config),
  } as PageComponentInstanceByType<T>;
}

function normalizeRegisteredLiveState<T extends RegisteredPageComponentType>(
  type: T,
  value: unknown,
): PageComponentLiveStateByType<T> {
  const registeredDefinition = getRegisteredPageComponentDefinition(type);

  const fallback = createDefaultLiveState(type);
  const normalizeState = registeredDefinition.normalizeState as (
    value: unknown,
    fallback: PageComponentLiveStateByType<T>["state"],
  ) => PageComponentLiveStateByType<T>["state"];

  if (
    !isRecord(value) ||
    !matchesStoredComponentType(value.type, type) ||
    !isRecord(value.state)
  ) {
    return fallback;
  }

  return {
    type,
    state: normalizeState(value.state, fallback.state),
  } as PageComponentLiveStateByType<T>;
}

function normalizeComponentInstance(
  id: string,
  type: PageComponentType,
  value: unknown,
): PageComponentInstance {
  if (isRegisteredPageComponentType(type)) {
    return normalizeRegisteredComponentInstance(id, type, value);
  }

  switch (type) {
    case "Calendar": {
      const fallback = createDefaultComponentInstance("Calendar", id);
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: fallback.config,
      };
    }
    case "Select": {
      const fallback = createDefaultComponentInstance("Select", id);
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          title:
            typeof value.config.title === "string"
              ? truncateInput(value.config.title.trim(), MAX_SHORT_TITLE_LENGTH)
              : fallback.config.title,
          description:
            typeof value.config.description === "string"
              ? truncateInput(
                  value.config.description.trim(),
                  MAX_DESCRIPTION_LENGTH,
                )
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
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          title:
            typeof value.config.title === "string"
              ? truncateInput(value.config.title.trim(), MAX_SHORT_TITLE_LENGTH)
              : fallback.config.title,
          description:
            typeof value.config.description === "string"
              ? truncateInput(
                  value.config.description.trim(),
                  MAX_DESCRIPTION_LENGTH,
                )
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
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          tags: Array.isArray(value.config.tags)
            ? value.config.tags
                .slice(0, MAX_OPTIONS_PER_FIELD)
                .map((tag) =>
                  typeof tag === "string"
                    ? truncateInput(tag.trim(), MAX_TAG_LENGTH)
                    : "",
                )
                .filter((tag): tag is string => tag.length > 0)
            : fallback.config.tags,
        },
      };
    }
    case "Kanban": {
      const fallback = createDefaultComponentInstance("Kanban", id);
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: fallback.config,
      };
    }
    case "MainHeadline":
    case "SectionHeader":
    case "Subheader": {
      const fallback = createDefaultComponentInstance(type, id) as
        | MainHeadlineComponentInstance
        | SectionHeaderComponentInstance
        | SubheaderComponentInstance;
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          text:
            typeof value.config.text === "string"
              ? truncateInput(
                  value.config.text.trim(),
                  type === "Subheader"
                    ? MAX_DESCRIPTION_LENGTH
                    : MAX_SHORT_TITLE_LENGTH,
                )
              : fallback.config.text,
        },
      };
    }
    case "PageLink": {
      const fallback = createDefaultComponentInstance(
        "PageLink",
        id,
      ) as PageLinkComponentInstance;
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.config)
      ) {
        return fallback;
      }

      return {
        id,
        type,
        config: {
          text:
            typeof value.config.text === "string"
              ? truncateInput(value.config.text.trim(), MAX_SHORT_TITLE_LENGTH)
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

  throw new Error(`Unsupported page component type: ${type}`);
}

function normalizeLiveState(
  type: PageComponentType,
  value: unknown,
): PageComponentLiveState {
  if (isRegisteredPageComponentType(type)) {
    return normalizeRegisteredLiveState(type, value);
  }

  switch (type) {
    case "Calendar": {
      const fallback = createDefaultLiveState("Calendar");
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.state)
      ) {
        return fallback;
      }

      return {
        type,
        state: {
          events: normalizeCalendarEvents(value.state.events),
        },
      };
    }
    case "Select": {
      const fallback = createDefaultLiveState("Select");
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.state)
      ) {
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
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.state)
      ) {
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
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.state)
      ) {
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
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.state)
      ) {
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
      if (
        !isRecord(value) ||
        !matchesStoredComponentType(value.type, type) ||
        !isRecord(value.state)
      ) {
        return fallback;
      }

      return fallback;
    }
  }

  throw new Error(`Unsupported page component type: ${type}`);
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
  const legacyTagMigratedText = rawEditorText.replace(
    LEGACY_COMPONENT_TAG_REGEX,
    (match, tag: string) => {
      const type = resolveStoredPageComponentType(tag);
      if (!type) {
        return match;
      }

      legacyCounter += 1;
      const id = createComponentInstanceId(legacyCounter);
      migratedComponents[id] = createDefaultComponentInstance(type, id);
      return createComponentToken(type, id);
    },
  );
  const editorText = legacyTagMigratedText.replace(
    PAGE_COMPONENT_TOKEN_REGEX,
    (match, tag: string, id: string) => {
      const type = resolveStoredPageComponentType(tag);
      return type ? createComponentToken(type, id) : match;
    },
  );

  const nextComponents: Record<string, PageComponentInstance> = {
    ...migratedComponents,
  };

  for (const match of editorText.matchAll(PAGE_COMPONENT_TOKEN_REGEX)) {
    const type = resolveStoredPageComponentType(match[1]);
    const id = match[2];
    if (!type) {
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

export function mergePageConfigDocument(
  baseDocument: PageDocumentV1,
  value: unknown,
): PageDocumentV1 {
  const configDocument = normalizePageConfigDocument(value);
  const normalizedDocument = normalizePageDocument(value);
  const nextComponents: Record<string, PageComponentDocument> = {};

  for (const [id, component] of Object.entries(configDocument.components)) {
    const baseComponent = baseDocument.components[id];
    const normalizedComponent = normalizedDocument.components[id];

    if (
      baseComponent &&
      matchesStoredComponentType(baseComponent.type, component.type) &&
      normalizedComponent &&
      matchesStoredComponentType(normalizedComponent.type, component.type)
    ) {
      nextComponents[id] = normalizedComponent;
      continue;
    }

    if (normalizedComponent) {
      nextComponents[id] = normalizedComponent;
      continue;
    }

    nextComponents[id] = baseComponent
      ? ({
          ...component,
          state: baseComponent.state,
        } as PageComponentDocument)
      : component;
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
      !matchesStoredComponentType(rawComponent.type, component.type) ||
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
