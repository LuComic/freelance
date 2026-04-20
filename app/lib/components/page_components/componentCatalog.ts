import type { PageComponentType } from "@/lib/pageDocument";
import {
  REGISTERED_PAGE_COMPONENT_DEFINITIONS,
  type RegisteredPageComponentCommand,
} from "@/lib/pageDocument/registeredComponents";
import type { PageComponentLibraryTag } from "@/lib/pageDocument/registeredDefinitions";
import { DROPDOWN_SLASH_COMMAND } from "./testing_editor/dropdownBlocks";

type ComponentLibraryMetadata = {
  name: string;
  description: string;
  previewSrc: string;
  tag: PageComponentLibraryTag;
  limited: boolean;
};

const LEGACY_PAGE_COMPONENT_CATALOG = [
  {
    type: "Calendar",
    commands: ["calendar", "testing"],
    componentLibrary: {
      name: "Calendar",
      description:
        "Schedule and share project events in a calendar. Commands: /calendar, /testing",
      previewSrc: "/component-previews/calendar.svg",
      tag: "input",
      limited: false,
    },
  },
  {
    type: "Kanban",
    commands: ["kanban"],
    componentLibrary: {
      name: "Kanban",
      description: "Display the progress as a Kanban table. Command: /kanban",
      previewSrc: "/component-previews/kanban.svg",
      tag: "progress",
      limited: false,
    },
  },
  {
    type: "Feedback",
    commands: ["feedback"],
    componentLibrary: {
      name: "Recommend",
      description:
        "Client can give feedback or recommend things they'd like. Command: /feedback",
      previewSrc: "/component-previews/recommend.svg",
      tag: "input",
      limited: false,
    },
  },
  {
    type: "Select",
    commands: ["select"],
    componentLibrary: {
      name: "Select",
      description:
        "Simple select component for multiple answers. Command: /select",
      previewSrc: "/component-previews/select.svg",
      tag: "input",
      limited: false,
    },
  },
  {
    type: "Radio",
    commands: ["radio"],
    componentLibrary: {
      name: "Radio",
      description: "Simple radio element for a single answer. Command: /radio",
      previewSrc: "/component-previews/radio.svg",
      tag: "input",
      limited: false,
    },
  },
  {
    type: "MainHeadline",
    commands: ["mainheadline", "h1"],
    componentLibrary: {
      name: "Main Headline (H1)",
      description:
        "Large top-level headline text. Commands: /mainheadline, /h1",
      previewSrc: "/component-previews/text-h1.svg",
      tag: "text",
      limited: false,
    },
  },
  {
    type: "SectionHeader",
    commands: ["sectionheader", "h2"],
    componentLibrary: {
      name: "Section Header (H2)",
      description: "Medium section heading text. Commands: /sectionheader, /h2",
      previewSrc: "/component-previews/text-h2.svg",
      tag: "text",
      limited: false,
    },
  },
  {
    type: "Subheader",
    commands: ["subheader", "h3"],
    componentLibrary: {
      name: "Subheader (H3)",
      description: "Smaller heading for subsections. Commands: /subheader, /h3",
      previewSrc: "/component-previews/text-h3.svg",
      tag: "text",
      limited: false,
    },
  },
  {
    type: "PageLink",
    commands: ["pagelink"],
    componentLibrary: {
      name: "Page Link",
      description:
        "Link to another page in the current project. Command: /pagelink",
      previewSrc: "/component-previews/page-link.svg",
      tag: "text",
      limited: false,
    },
  },
] as const;

type LegacyInsertableComponentCommand =
  (typeof LEGACY_PAGE_COMPONENT_CATALOG)[number]["commands"][number];

export type InsertableComponentCommand =
  | LegacyInsertableComponentCommand
  | RegisteredPageComponentCommand
  | typeof DROPDOWN_SLASH_COMMAND;

export type PageComponentCatalogEntry = {
  type: PageComponentType;
  commands: readonly InsertableComponentCommand[];
  componentLibrary: ComponentLibraryMetadata;
};

type ComponentLibraryItem = ComponentLibraryMetadata & {
  key: string;
  insertCommand: InsertableComponentCommand;
};

const REGISTERED_PAGE_COMPONENT_CATALOG =
  REGISTERED_PAGE_COMPONENT_DEFINITIONS.map((definition) => ({
    type: definition.type,
    commands: definition.commands as readonly InsertableComponentCommand[],
    componentLibrary: definition.componentLibrary,
  })) as PageComponentCatalogEntry[];

export const PAGE_COMPONENT_CATALOG = [
  ...LEGACY_PAGE_COMPONENT_CATALOG,
  ...REGISTERED_PAGE_COMPONENT_CATALOG,
] as readonly PageComponentCatalogEntry[];

export const PRIMARY_INSERTABLE_COMMANDS = PAGE_COMPONENT_CATALOG.map(
  ({ commands }) => commands[0],
);

export const INSERTABLE_COMPONENT_COMMANDS = PAGE_COMPONENT_CATALOG.flatMap(
  ({ type, commands }) => commands.map((command) => ({ command, type })),
);

export function isInsertableCommandLimited(command: InsertableComponentCommand) {
  const match = PAGE_COMPONENT_CATALOG.find(({ commands }) =>
    commands.includes(command),
  );

  return match?.componentLibrary.limited ?? false;
}

export function canInsertComponentCommand(
  command: InsertableComponentCommand,
  canUseLimitedComponents: boolean,
) {
  return canUseLimitedComponents || !isInsertableCommandLimited(command);
}

export function listAllowedInsertableCommands(
  canUseLimitedComponents: boolean,
) {
  return PAGE_COMPONENT_CATALOG.flatMap(({ commands, componentLibrary }) =>
    canUseLimitedComponents || !componentLibrary.limited ? [...commands] : [],
  );
}

export const COMPONENT_LIBRARY_ITEMS: readonly ComponentLibraryItem[] = [
  ...PAGE_COMPONENT_CATALOG.map(({ type, commands, componentLibrary }) => ({
    key: type,
    insertCommand: commands[0],
    ...componentLibrary,
  })),
  {
    key: "DropdownBlock",
    name: "Dropdown Block",
    description:
      "A structural editor block rather than a regular component. Use it for collapsible sections. Command: /dropdown",
    previewSrc: "/component-previews/dropdown.svg",
    tag: "util",
    limited: false,
    insertCommand: DROPDOWN_SLASH_COMMAND,
  },
] as const;

export function resolveComponentTypeFromCommand(command: string) {
  const match = INSERTABLE_COMPONENT_COMMANDS.find(
    (item) => item.command === command,
  );

  return match?.type;
}
