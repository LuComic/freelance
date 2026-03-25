import type { PageComponentDocument, PageDocumentV1, PageComponentType } from "../pageDocument";
import { PAGE_COMPONENT_TOKEN_REGEX } from "../pageDocument";
import type { PlanTier } from "../billing/plans";
import { getBillingPlan } from "../billing/plans";
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

function countComponentTokens(editorText: string, instanceId: string) {
  let count = 0;

  for (const match of editorText.matchAll(PAGE_COMPONENT_TOKEN_REGEX)) {
    if (match[2] === instanceId) {
      count += 1;
    }
  }

  return count;
}

export function isLimitedPageComponentType(type: PageComponentType) {
  const definition = getRegisteredPageComponentDefinition(type);

  if (definition) {
    return definition.componentLibrary.limited;
  }

  return LIMITED_LEGACY_COMPONENT_TYPES.has(type as LegacyPageComponentType);
}

export function canPlanUsePageComponentType(
  planTier: PlanTier,
  type: PageComponentType,
) {
  const plan = getBillingPlan(planTier);

  return plan.canUseLimitedComponents || !isLimitedPageComponentType(type);
}

export function canViewOrInteractWithPageComponentType(args: {
  planTier: PlanTier;
  viewerRole: string | null;
  type: PageComponentType;
}) {
  if (!isLimitedPageComponentType(args.type)) {
    return true;
  }

  if (args.viewerRole === "client") {
    return true;
  }

  return getBillingPlan(args.planTier).canUseLimitedComponents;
}

export function getPageComponentDisplayName(type: PageComponentType) {
  const definition = getRegisteredPageComponentDefinition(type);

  if (definition) {
    return definition.componentLibrary.name;
  }

  return LEGACY_COMPONENT_DISPLAY_NAMES[type as LegacyPageComponentType] ?? type;
}

export function findLimitedComponentAccessViolation(args: {
  currentDocument: PageDocumentV1;
  nextDocument: PageDocumentV1;
  planTier: PlanTier;
}) {
  if (getBillingPlan(args.planTier).canUseLimitedComponents) {
    return null;
  }

  const currentLimitedEntries = new Map(
    Object.entries(args.currentDocument.components).filter((entry) =>
      isLimitedPageComponentType(entry[1].type),
    ),
  );
  const nextLimitedEntries = new Map(
    Object.entries(args.nextDocument.components).filter((entry) =>
      isLimitedPageComponentType(entry[1].type),
    ),
  );

  for (const [instanceId, nextComponent] of nextLimitedEntries) {
    const currentComponent = currentLimitedEntries.get(instanceId);

    if (!currentComponent) {
      return {
        instanceId,
        componentName: getPageComponentDisplayName(nextComponent.type),
      };
    }

    if (JSON.stringify(currentComponent) !== JSON.stringify(nextComponent)) {
      return {
        instanceId,
        componentName: getPageComponentDisplayName(nextComponent.type),
      };
    }
  }

  for (const [instanceId, currentComponent] of currentLimitedEntries) {
    if (!nextLimitedEntries.has(instanceId)) {
      return {
        instanceId,
        componentName: getPageComponentDisplayName(currentComponent.type),
      };
    }

    if (
      countComponentTokens(args.currentDocument.editorText, instanceId) !==
      countComponentTokens(args.nextDocument.editorText, instanceId)
    ) {
      return {
        instanceId,
        componentName: getPageComponentDisplayName(currentComponent.type),
      };
    }
  }

  return null;
}

export function listUnavailableLimitedComponents(
  components: Record<string, PageComponentDocument>,
  planTier: PlanTier,
) {
  return Object.entries(components)
    .filter((entry) => !canPlanUsePageComponentType(planTier, entry[1].type))
    .map(([instanceId, component]) => ({
      instanceId,
      type: component.type,
      componentName: getPageComponentDisplayName(component.type),
    }));
}
