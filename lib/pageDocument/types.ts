import {
  REGISTERED_PAGE_COMPONENT_TYPES,
  type RegisteredPageComponentConfigMap,
  type RegisteredPageComponentStateMap,
} from "./registeredComponents";

export const DEFAULT_PAGE_EDITOR_TEXT = `Project brief

Write your page content here.

This testing page now supports a full-page editing mode.`;

export const LEGACY_PAGE_COMPONENT_TYPES = [
  "Calendar",
  "Select",
  "Radio",
  "Feedback",
  "Kanban",
  "MainHeadline",
  "SectionHeader",
  "Subheader",
  "PageLink",
] as const;

export type LegacyPageComponentType =
  (typeof LEGACY_PAGE_COMPONENT_TYPES)[number];

export const PAGE_COMPONENT_TYPES = [
  ...LEGACY_PAGE_COMPONENT_TYPES,
  ...REGISTERED_PAGE_COMPONENT_TYPES,
] as const;

export type PageComponentType = (typeof PAGE_COMPONENT_TYPES)[number];

export const LEGACY_PAGE_COMPONENT_TYPE_ALIASES = {
  TestingComponent: "Calendar",
} as const;

export type StoredLegacyPageComponentType =
  keyof typeof LEGACY_PAGE_COMPONENT_TYPE_ALIASES;

export type StoredPageComponentType =
  | PageComponentType
  | StoredLegacyPageComponentType;

export function resolveStoredPageComponentType(
  value: string,
): PageComponentType | null {
  if (value in LEGACY_PAGE_COMPONENT_TYPE_ALIASES) {
    return LEGACY_PAGE_COMPONENT_TYPE_ALIASES[
      value as StoredLegacyPageComponentType
    ];
  }

  return isPageComponentType(value) ? value : null;
}

export type PageOption = {
  id: number;
  label: string;
};

export type CalendarEventColor =
  | "none"
  | "red"
  | "green"
  | "yellow"
  | "pink"
  | "purple"
  | "cyan";

export type CalendarEvent = {
  id: string;
  title: string;
  color: CalendarEventColor;
  startAt: number;
  endAt: number;
};

export type FeedbackItem = {
  feature: string;
  status: "pending" | "accepted" | "declined";
  tags: string[];
  reason?: string;
  dismissed?: boolean;
};

export type KanbanItem = {
  id: number;
  feature: string;
  status: "Todo" | "In Progress" | "Done";
  tags: string[];
  dismissed?: boolean;
};

export type CalendarComponentInstance = {
  id: string;
  type: "Calendar";
  config: Record<string, never>;
};

export type SelectComponentInstance = {
  id: string;
  type: "Select";
  config: {
    title: string;
    description: string;
    options: PageOption[];
  };
};

export type RadioComponentInstance = {
  id: string;
  type: "Radio";
  config: {
    title: string;
    description: string;
    options: PageOption[];
  };
};

export type FeedbackComponentInstance = {
  id: string;
  type: "Feedback";
  config: {
    tags: string[];
  };
};

export type KanbanComponentInstance = {
  id: string;
  type: "Kanban";
  config: {
    tags: string[];
  };
};

export type MainHeadlineComponentInstance = {
  id: string;
  type: "MainHeadline";
  config: {
    text: string;
  };
};

export type SectionHeaderComponentInstance = {
  id: string;
  type: "SectionHeader";
  config: {
    text: string;
  };
};

export type SubheaderComponentInstance = {
  id: string;
  type: "Subheader";
  config: {
    text: string;
  };
};

export type PageLinkComponentInstance = {
  id: string;
  type: "PageLink";
  config: {
    text: string;
    targetPageId: string | null;
  };
};

export type SelectComponentLiveState = {
  type: "Select";
  state: {
    selectedOptionIds: number[];
  };
};

export type RadioComponentLiveState = {
  type: "Radio";
  state: {
    selectedOptionId: number | null;
  };
};

export type FeedbackComponentLiveState = {
  type: "Feedback";
  state: {
    items: FeedbackItem[];
  };
};

export type KanbanComponentLiveState = {
  type: "Kanban";
  state: {
    items: KanbanItem[];
  };
};

export type CalendarComponentLiveState = {
  type: "Calendar";
  state: {
    events: CalendarEvent[];
  };
};

export type MainHeadlineComponentLiveState = {
  type: "MainHeadline";
  state: Record<string, never>;
};

export type SectionHeaderComponentLiveState = {
  type: "SectionHeader";
  state: Record<string, never>;
};

export type SubheaderComponentLiveState = {
  type: "Subheader";
  state: Record<string, never>;
};

export type PageLinkComponentLiveState = {
  type: "PageLink";
  state: Record<string, never>;
};

export type LegacyPageComponentInstanceMap = {
  Calendar: CalendarComponentInstance;
  Select: SelectComponentInstance;
  Radio: RadioComponentInstance;
  Feedback: FeedbackComponentInstance;
  Kanban: KanbanComponentInstance;
  MainHeadline: MainHeadlineComponentInstance;
  SectionHeader: SectionHeaderComponentInstance;
  Subheader: SubheaderComponentInstance;
  PageLink: PageLinkComponentInstance;
};

export type RegisteredPageComponentInstanceMap = {
  [Type in keyof RegisteredPageComponentConfigMap]: {
    id: string;
    type: Type;
    config: RegisteredPageComponentConfigMap[Type];
  };
};

export type PageComponentInstanceMap = LegacyPageComponentInstanceMap &
  RegisteredPageComponentInstanceMap;

export type LegacyPageComponentLiveStateMap = {
  Calendar: CalendarComponentLiveState;
  Select: SelectComponentLiveState;
  Radio: RadioComponentLiveState;
  Feedback: FeedbackComponentLiveState;
  Kanban: KanbanComponentLiveState;
  MainHeadline: MainHeadlineComponentLiveState;
  SectionHeader: SectionHeaderComponentLiveState;
  Subheader: SubheaderComponentLiveState;
  PageLink: PageLinkComponentLiveState;
};

export type RegisteredPageComponentLiveStateMap = {
  [Type in keyof RegisteredPageComponentStateMap]: {
    type: Type;
    state: RegisteredPageComponentStateMap[Type];
  };
};

export type PageComponentLiveStateMap = LegacyPageComponentLiveStateMap &
  RegisteredPageComponentLiveStateMap;

export type PageComponentInstance = PageComponentInstanceMap[PageComponentType];

export type PageComponentLiveState =
  PageComponentLiveStateMap[PageComponentType];

export type PageComponentInstanceByType<T extends PageComponentType> =
  PageComponentInstanceMap[T];

export type PageComponentLiveStateByType<T extends PageComponentType> =
  PageComponentLiveStateMap[T];

export type PageComponentDocumentMap = {
  [T in PageComponentType]: PageComponentInstanceByType<T> & {
    state: PageComponentLiveStateByType<T>["state"];
  };
};

export type PageComponentDocument = PageComponentDocumentMap[PageComponentType];

export type PageComponentDocumentByType<T extends PageComponentType> =
  PageComponentDocumentMap[T];

export type PageConfigDocumentV1 = PageDocumentV1;
export type PageLiveDocumentV1 = PageDocumentV1;

export type PageDocumentV1 = {
  version: 1;
  editorText: string;
  components: Record<string, PageComponentDocument>;
};

export const PAGE_COMPONENT_TOKEN_REGEX =
  /\[\[([A-Za-z][A-Za-z0-9]*):(cmp_[A-Za-z0-9_-]+)\]\]/g;
export const LEGACY_COMPONENT_TAG_REGEX = /<([A-Za-z][A-Za-z0-9]*)\s*\/>/g;

export function isPageComponentType(value: string): value is PageComponentType {
  return PAGE_COMPONENT_TYPES.includes(value as PageComponentType);
}

export function createComponentToken(type: PageComponentType, id: string) {
  return `[[${type}:${id}]]`;
}
