import type {
  CalendarComponentInstance,
  CalendarComponentLiveState,
  CalendarEvent,
  FeedbackComponentLiveState,
  FeedbackComponentInstance,
  FeedbackItem,
  KanbanItem,
  KanbanComponentLiveState,
  KanbanComponentInstance,
  MainHeadlineComponentInstance,
  MainHeadlineComponentLiveState,
  PageLinkComponentInstance,
  PageLinkComponentLiveState,
  PageComponentDocument,
  PageComponentDocumentByType,
  PageComponentInstance,
  PageComponentInstanceByType,
  PageComponentLiveState,
  PageComponentLiveStateByType,
  PageComponentType,
  RadioComponentInstance,
  RadioComponentLiveState,
  SectionHeaderComponentInstance,
  SectionHeaderComponentLiveState,
  PageOption,
  SelectComponentInstance,
  SelectComponentLiveState,
  SubheaderComponentInstance,
  SubheaderComponentLiveState,
} from "./types";

const DEFAULT_SELECT_OPTIONS: PageOption[] = [];
const DEFAULT_RADIO_OPTIONS: PageOption[] = [];
const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [];
const DEFAULT_FEEDBACK_ITEMS: FeedbackItem[] = [];
const DEFAULT_KANBAN_ITEMS: KanbanItem[] = [];

export function createDefaultComponentInstance(
  type: PageComponentType,
  id: string,
): PageComponentInstance;
export function createDefaultComponentInstance<T extends PageComponentType>(
  type: T,
  id: string,
): PageComponentInstanceByType<T>;
export function createDefaultComponentInstance(
  type: "Select",
  id: string,
): SelectComponentInstance;
export function createDefaultComponentInstance(
  type: "Calendar",
  id: string,
): CalendarComponentInstance;
export function createDefaultComponentInstance(
  type: "Radio",
  id: string,
): RadioComponentInstance;
export function createDefaultComponentInstance(
  type: "Feedback",
  id: string,
): FeedbackComponentInstance;
export function createDefaultComponentInstance(
  type: "Kanban",
  id: string,
): KanbanComponentInstance;
export function createDefaultComponentInstance(
  type: "MainHeadline",
  id: string,
): MainHeadlineComponentInstance;
export function createDefaultComponentInstance(
  type: "SectionHeader",
  id: string,
): SectionHeaderComponentInstance;
export function createDefaultComponentInstance(
  type: "Subheader",
  id: string,
): SubheaderComponentInstance;
export function createDefaultComponentInstance(
  type: "PageLink",
  id: string,
): PageLinkComponentInstance;
export function createDefaultComponentInstance(
  type: PageComponentType,
  id: string,
): PageComponentInstance {
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
}

export function createDefaultLiveState(
  type: "Select",
): SelectComponentLiveState;
export function createDefaultLiveState<T extends PageComponentType>(
  type: T,
): PageComponentLiveStateByType<T>;
export function createDefaultLiveState(
  type: "Feedback",
): FeedbackComponentLiveState;
export function createDefaultLiveState(
  type: "Kanban",
): KanbanComponentLiveState;
export function createDefaultLiveState(
  type: "Calendar",
): CalendarComponentLiveState;
export function createDefaultLiveState(type: "Radio"): RadioComponentLiveState;
export function createDefaultLiveState(
  type: "MainHeadline",
): MainHeadlineComponentLiveState;
export function createDefaultLiveState(
  type: "SectionHeader",
): SectionHeaderComponentLiveState;
export function createDefaultLiveState(
  type: "Subheader",
): SubheaderComponentLiveState;
export function createDefaultLiveState(
  type: "PageLink",
): PageLinkComponentLiveState;
export function createDefaultLiveState(
  type: PageComponentType,
): PageComponentLiveState {
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
}

export function createDefaultComponentDocument(
  type: PageComponentType,
  id: string,
): PageComponentDocument;
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
