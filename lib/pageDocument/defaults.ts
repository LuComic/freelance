import { getRegisteredPageComponentDefinition } from "./registeredComponents";
import type {
  CalendarEvent,
  FeedbackItem,
  KanbanItem,
  PageComponentDocument,
  PageComponentDocumentByType,
  PageComponentInstance,
  PageComponentInstanceByType,
  PageComponentLiveState,
  PageComponentLiveStateByType,
  PageComponentType,
  PageOption,
} from "./types";

const DEFAULT_SELECT_OPTIONS: PageOption[] = [];
const DEFAULT_RADIO_OPTIONS: PageOption[] = [];
const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [];
const DEFAULT_FEEDBACK_ITEMS: FeedbackItem[] = [];
const DEFAULT_KANBAN_ITEMS: KanbanItem[] = [];

export function createDefaultComponentInstance<T extends PageComponentType>(
  type: T,
  id: string,
): PageComponentInstanceByType<T>;
export function createDefaultComponentInstance(
  type: PageComponentType,
  id: string,
): PageComponentInstance {
  const registeredDefinition = getRegisteredPageComponentDefinition(type);

  if (registeredDefinition) {
    return {
      id,
      type,
      config: registeredDefinition.createDefaultConfig(),
    } as PageComponentInstance;
  }

  switch (type) {
    case "Calendar":
      return {
        id,
        type,
        config: {},
      };
    case "Select":
      return {
        id,
        type,
        config: {
          title: "",
          description: "",
          options: [...DEFAULT_SELECT_OPTIONS],
        },
      };
    case "Radio":
      return {
        id,
        type,
        config: {
          title: "",
          description: "",
          options: [...DEFAULT_RADIO_OPTIONS],
        },
      };
    case "Feedback":
      return {
        id,
        type,
        config: {
          tags: [],
        },
      };
    case "Kanban":
      return {
        id,
        type,
        config: {
          tags: [],
        },
      };
    case "MainHeadline":
      return {
        id,
        type,
        config: { text: "Main Headline" },
      };
    case "SectionHeader":
      return {
        id,
        type,
        config: { text: "Section Header" },
      };
    case "Subheader":
      return {
        id,
        type,
        config: { text: "Subheader" },
      };
    case "PageLink":
      return {
        id,
        type,
        config: {
          text: "link to page",
          targetPageId: null,
        },
      };
  }

  throw new Error(`Unsupported page component type: ${type}`);
}

export function createDefaultLiveState<T extends PageComponentType>(
  type: T,
): PageComponentLiveStateByType<T>;
export function createDefaultLiveState(
  type: PageComponentType,
): PageComponentLiveState {
  const registeredDefinition = getRegisteredPageComponentDefinition(type);

  if (registeredDefinition) {
    return {
      type,
      state: registeredDefinition.createDefaultState(),
    } as PageComponentLiveState;
  }

  switch (type) {
    case "Calendar":
      return {
        type,
        state: { events: [...DEFAULT_CALENDAR_EVENTS] },
      };
    case "Select":
      return {
        type,
        state: { selectedOptionIds: [] },
      };
    case "Radio":
      return {
        type,
        state: { selectedOptionId: null },
      };
    case "Feedback":
      return {
        type,
        state: { items: [...DEFAULT_FEEDBACK_ITEMS] },
      };
    case "Kanban":
      return {
        type,
        state: { items: [...DEFAULT_KANBAN_ITEMS] },
      };
    case "MainHeadline":
    case "SectionHeader":
    case "Subheader":
    case "PageLink":
      return {
        type,
        state: {},
      };
  }

  throw new Error(`Unsupported page component type: ${type}`);
}

export function createDefaultComponentDocument<T extends PageComponentType>(
  type: T,
  id: string,
): PageComponentDocumentByType<T>;
export function createDefaultComponentDocument(
  type: PageComponentType,
  id: string,
): PageComponentDocument {
  const instance = createDefaultComponentInstance(type, id);
  const liveState = createDefaultLiveState(type);

  return {
    ...instance,
    state: liveState.state,
  } as PageComponentDocument;
}
