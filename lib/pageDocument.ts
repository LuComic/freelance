export const DEFAULT_PAGE_EDITOR_TEXT = `Project brief

Write your page content here.

This testing page now supports a full-page editing mode.`;

export const PAGE_COMPONENT_TYPES = [
  "Select",
  "Radio",
  "Feedback",
  "Kanban",
  "MainHeadline",
  "SectionHeader",
  "Subheader",
] as const;

export type PageComponentType = (typeof PAGE_COMPONENT_TYPES)[number];

export type PageOption = {
  id: number;
  label: string;
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

export type PageComponentInstance =
  | SelectComponentInstance
  | RadioComponentInstance
  | FeedbackComponentInstance
  | KanbanComponentInstance
  | MainHeadlineComponentInstance
  | SectionHeaderComponentInstance
  | SubheaderComponentInstance;

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

export type PageComponentLiveState =
  | SelectComponentLiveState
  | RadioComponentLiveState
  | FeedbackComponentLiveState
  | KanbanComponentLiveState
  | MainHeadlineComponentLiveState
  | SectionHeaderComponentLiveState
  | SubheaderComponentLiveState;

type PageComponentInstanceMap = {
  Select: SelectComponentInstance;
  Radio: RadioComponentInstance;
  Feedback: FeedbackComponentInstance;
  Kanban: KanbanComponentInstance;
  MainHeadline: MainHeadlineComponentInstance;
  SectionHeader: SectionHeaderComponentInstance;
  Subheader: SubheaderComponentInstance;
};

type PageComponentLiveStateMap = {
  Select: SelectComponentLiveState;
  Radio: RadioComponentLiveState;
  Feedback: FeedbackComponentLiveState;
  Kanban: KanbanComponentLiveState;
  MainHeadline: MainHeadlineComponentLiveState;
  SectionHeader: SectionHeaderComponentLiveState;
  Subheader: SubheaderComponentLiveState;
};

export type PageComponentInstanceByType<T extends PageComponentType> =
  PageComponentInstanceMap[T];

export type PageComponentLiveStateByType<T extends PageComponentType> =
  PageComponentLiveStateMap[T];

export type PageConfigDocumentV1 = {
  version: 1;
  editorText: string;
  components: Record<string, PageComponentInstance>;
};

export type PageLiveDocumentV1 = {
  version: 1;
  components: Record<string, PageComponentLiveState>;
};

export const PAGE_COMPONENT_TOKEN_REGEX =
  /\[\[([A-Za-z][A-Za-z0-9]*):(cmp_[A-Za-z0-9_-]+)\]\]/g;
export const LEGACY_COMPONENT_TAG_REGEX = /<([A-Za-z][A-Za-z0-9]*)\s*\/>/g;

const DEFAULT_SELECT_OPTIONS: PageOption[] = [
  { id: 1, label: "Starter" },
  { id: 2, label: "Growth" },
];

const DEFAULT_RADIO_OPTIONS: PageOption[] = [
  { id: 1, label: "Required" },
  { id: 2, label: "Nice to have" },
];

const DEFAULT_FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    feature: "Please add an About page",
    status: "accepted",
    tags: ["required"],
    reason:
      "Yeah sure, added it right now. Let me know if you want any changes there",
  },
  {
    feature: "Turn the selector in X page into a slider",
    status: "pending",
    tags: ["nice to have"],
  },
];

const DEFAULT_KANBAN_ITEMS: KanbanItem[] = [
  {
    id: 1,
    feature: "Please add an About page",
    status: "Todo",
    tags: ["required"],
  },
  {
    id: 2,
    feature: "Turn the selector in X page into a slider",
    status: "In Progress",
    tags: ["nice to have"],
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPageComponentType(value: string): value is PageComponentType {
  return PAGE_COMPONENT_TYPES.includes(value as PageComponentType);
}

export function createComponentToken(type: PageComponentType, id: string) {
  return `[[${type}:${id}]]`;
}

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
    return [...DEFAULT_FEEDBACK_ITEMS];
  }

  const items = value
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

  return items.length > 0 ? items : [...DEFAULT_FEEDBACK_ITEMS];
}

function normalizeKanbanItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_KANBAN_ITEMS];
  }

  const items = value
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

  return items.length > 0 ? items : [...DEFAULT_KANBAN_ITEMS];
}

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
  type: PageComponentType,
  id: string,
): PageComponentInstance {
  switch (type) {
    case "Select":
      return {
        id,
        type,
        config: {
          title: "Which package tier works for you?",
          description:
            "Pick one or more options from this select-style field. It supports multiple choices.",
          options: [...DEFAULT_SELECT_OPTIONS],
        },
      };
    case "Radio":
      return {
        id,
        type,
        config: {
          title: "What should be prioritized first?",
          description:
            "Pick one option. This simulates how a client can cast one vote in a radio-style field.",
          options: [...DEFAULT_RADIO_OPTIONS],
        },
      };
    case "Feedback":
      return {
        id,
        type,
        config: {
          tags: ["required", "nice to have"],
        },
      };
    case "Kanban":
      return {
        id,
        type,
        config: {
          tags: ["required", "nice to have"],
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
  }
}

export function createDefaultLiveState(type: "Select"): SelectComponentLiveState;
export function createDefaultLiveState<T extends PageComponentType>(
  type: T,
): PageComponentLiveStateByType<T>;
export function createDefaultLiveState(type: "Radio"): RadioComponentLiveState;
export function createDefaultLiveState(
  type: "Feedback",
): FeedbackComponentLiveState;
export function createDefaultLiveState(type: "Kanban"): KanbanComponentLiveState;
export function createDefaultLiveState(
  type: "MainHeadline",
): MainHeadlineComponentLiveState;
export function createDefaultLiveState(
  type: "SectionHeader",
): SectionHeaderComponentLiveState;
export function createDefaultLiveState(type: "Subheader"): SubheaderComponentLiveState;
export function createDefaultLiveState(
  type: PageComponentType,
): PageComponentLiveState {
  switch (type) {
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
      return {
        type,
        state: {},
      };
  }
}

function normalizeComponentInstance(
  id: string,
  type: PageComponentType,
  value: unknown,
): PageComponentInstance {
  switch (type) {
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
          options: normalizeOptions(value.config.options, fallback.config.options),
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
          options: normalizeOptions(value.config.options, fallback.config.options),
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
            ? value.config.tags.filter((tag): tag is string => typeof tag === "string")
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
            ? value.config.tags.filter((tag): tag is string => typeof tag === "string")
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
  }
}

function normalizeLiveState(
  type: PageComponentType,
  value: unknown,
): PageComponentLiveState {
  switch (type) {
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
                (id): id is number => typeof id === "number" && Number.isFinite(id),
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
    case "Subheader": {
      const fallback = createDefaultLiveState(type);
      if (!isRecord(value) || value.type !== type || !isRecord(value.state)) {
        return fallback;
      }

      return fallback;
    }
  }
}

export function createInitialPageConfigDocument(): PageConfigDocumentV1 {
  return {
    version: 1,
    editorText: DEFAULT_PAGE_EDITOR_TEXT,
    components: {},
  };
}

export function createInitialPageLiveDocument(): PageLiveDocumentV1 {
  return {
    version: 1,
    components: {},
  };
}

export function createComponentInstanceId(seed: number) {
  return `cmp_${seed.toString(36)}`;
}

export function normalizePageConfigDocument(
  value: unknown,
): PageConfigDocumentV1 {
  const base = createInitialPageConfigDocument();
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

    nextComponents[id] = normalizeComponentInstance(id, type, rawComponents[id]);
  }

  return {
    version: 1,
    editorText,
    components: nextComponents,
  };
}

export function normalizePageLiveDocument(
  value: unknown,
  configDocument: PageConfigDocumentV1,
): PageLiveDocumentV1 {
  const record = isRecord(value) ? value : null;
  const rawComponents =
    record && isRecord(record.components) ? record.components : {};
  const nextComponents: Record<string, PageComponentLiveState> = {};

  for (const [id, instance] of Object.entries(configDocument.components)) {
    nextComponents[id] = normalizeLiveState(instance.type, rawComponents[id]);
  }

  return {
    version: 1,
    components: nextComponents,
  };
}

export function assertPageConfigDocumentV1(
  value: unknown,
): asserts value is PageConfigDocumentV1 {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("Page config document must be version 1.");
  }

  if (typeof value.editorText !== "string" || !isRecord(value.components)) {
    throw new Error("Page config document shape is invalid.");
  }

  for (const [id, instance] of Object.entries(value.components)) {
    if (!isRecord(instance) || typeof id !== "string") {
      throw new Error("Page component instance is invalid.");
    }
    if (
      typeof instance.id !== "string" ||
      instance.id !== id ||
      typeof instance.type !== "string" ||
      !isPageComponentType(instance.type) ||
      !isRecord(instance.config)
    ) {
      throw new Error("Page component instance shape is invalid.");
    }
  }
}

export function assertPageLiveDocumentV1(
  value: unknown,
): asserts value is PageLiveDocumentV1 {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.components)) {
    throw new Error("Page live document shape is invalid.");
  }

  for (const liveState of Object.values(value.components)) {
    if (
      !isRecord(liveState) ||
      typeof liveState.type !== "string" ||
      !isPageComponentType(liveState.type) ||
      !isRecord(liveState.state)
    ) {
      throw new Error("Page live component state shape is invalid.");
    }
  }
}
