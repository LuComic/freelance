import type { PageComponentType } from "../pageDocument";
import { getRegisteredPageComponentDefinition } from "./registeredComponents";
import type { LegacyPageComponentType } from "./types";

const LEGACY_COMPONENT_DISPLAY_NAMES: Record<LegacyPageComponentType, string> = {
  Calendar: "Calendar",
  Select: "Select",
  Radio: "Radio",
  Feedback: "Recommend",
  Kanban: "Kanban",
  MainHeadline: "Main Headline (H1)",
  SectionHeader: "Section Header (H2)",
  Subheader: "Subheader (H3)",
  PageLink: "Page Link",
};

const LIMITED_LEGACY_COMPONENT_TYPES = new Set<LegacyPageComponentType>();

export function isLimitedPageComponentType(type: PageComponentType) {
  const definition = getRegisteredPageComponentDefinition(type);

  if (definition) {
    return definition.componentLibrary.limited;
  }

  return LIMITED_LEGACY_COMPONENT_TYPES.has(type as LegacyPageComponentType);
}

export function getPageComponentDisplayName(type: PageComponentType) {
  const definition = getRegisteredPageComponentDefinition(type);

  if (definition) {
    return definition.componentLibrary.name;
  }

  return LEGACY_COMPONENT_DISPLAY_NAMES[type as LegacyPageComponentType] ?? type;
}
