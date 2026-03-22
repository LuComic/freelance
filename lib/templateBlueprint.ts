import {
  PAGE_COMPONENT_TOKEN_REGEX,
  createComponentInstanceId,
  createComponentToken,
  createDefaultComponentDocument,
  isPageComponentType,
  type PageComponentType,
  type PageDocumentV1,
} from "./pageDocument";

export type PageTemplateBlueprintV1 = {
  version: 1;
  type: "page";
  components: PageComponentType[];
};

export type ProjectTemplateBlueprintV1 = {
  version: 1;
  type: "project";
  pages: Array<{
    title: string;
    components: PageComponentType[];
  }>;
};

export type TemplateBlueprintV1 =
  | PageTemplateBlueprintV1
  | ProjectTemplateBlueprintV1;

type ComponentIdFactory = () => string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertComponentTypeArray(
  value: unknown,
  message = "Template components are invalid.",
): asserts value is PageComponentType[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (componentType): componentType is PageComponentType =>
        typeof componentType === "string" && isPageComponentType(componentType),
    )
  ) {
    throw new Error(message);
  }
}

export function assertTemplateBlueprintV1(
  value: unknown,
): asserts value is TemplateBlueprintV1 {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("Template blueprint version is invalid.");
  }

  if (value.type === "page") {
    assertComponentTypeArray(value.components);
    return;
  }

  if (value.type === "project") {
    if (!Array.isArray(value.pages) || value.pages.length === 0) {
      throw new Error("Project templates must include at least one page.");
    }

    for (const page of value.pages) {
      if (!isRecord(page) || typeof page.title !== "string" || !page.title.trim()) {
        throw new Error("Project template pages must include a title.");
      }

      assertComponentTypeArray(
        page.components,
        "Project template page components are invalid.",
      );
    }

    return;
  }

  throw new Error("Template blueprint type is invalid.");
}

export function createPageTemplateBlueprint(
  document: PageDocumentV1,
): PageTemplateBlueprintV1 {
  return {
    version: 1,
    type: "page",
    components: getOrderedComponentTypes(document),
  };
}

export function createProjectTemplateBlueprint(
  pages: Array<{
    title: string;
    components: PageComponentType[];
  }>,
): ProjectTemplateBlueprintV1 {
  return {
    version: 1,
    type: "project",
    pages: pages.map((page, index) => ({
      title: page.title.trim() || `Page ${index + 1}`,
      components: [...page.components],
    })),
  };
}

export function getOrderedComponentTypes(
  document: PageDocumentV1,
): PageComponentType[] {
  const seenComponentIds = new Set<string>();
  const orderedComponentTypes: PageComponentType[] = [];

  for (const match of document.editorText.matchAll(PAGE_COMPONENT_TOKEN_REGEX)) {
    const instanceId = match[2];
    const component = document.components[instanceId];

    if (!component || seenComponentIds.has(instanceId)) {
      continue;
    }

    seenComponentIds.add(instanceId);
    orderedComponentTypes.push(component.type);
  }

  for (const [instanceId, component] of Object.entries(document.components)) {
    if (seenComponentIds.has(instanceId)) {
      continue;
    }

    orderedComponentTypes.push(component.type);
  }

  return orderedComponentTypes;
}

function createComponentIdFactory(
  existingIds: Iterable<string> = [],
): ComponentIdFactory {
  const usedIds = new Set(existingIds);
  let seed = Date.now();

  return () => {
    let instanceId = "";

    do {
      seed += 1;
      instanceId = createComponentInstanceId(seed);
    } while (usedIds.has(instanceId));

    usedIds.add(instanceId);
    return instanceId;
  };
}

function buildEditorText(tokens: string[]) {
  return tokens.join("\n\n");
}

export function buildPageDocumentFromComponentTypes(
  componentTypes: PageComponentType[],
  createId: ComponentIdFactory = createComponentIdFactory(),
): PageDocumentV1 {
  const components: PageDocumentV1["components"] = {};
  const tokens: string[] = [];

  for (const componentType of componentTypes) {
    const instanceId = createId();
    components[instanceId] = createDefaultComponentDocument(
      componentType,
      instanceId,
    );
    tokens.push(createComponentToken(componentType, instanceId));
  }

  return {
    version: 1,
    editorText: buildEditorText(tokens),
    components,
  };
}

export function appendComponentTypesToDocument(
  document: PageDocumentV1,
  componentTypes: PageComponentType[],
): PageDocumentV1 {
  if (componentTypes.length === 0) {
    return document;
  }

  const appendedDocument = buildPageDocumentFromComponentTypes(
    componentTypes,
    createComponentIdFactory(Object.keys(document.components)),
  );
  const nextEditorText = appendedDocument.editorText.trim();

  return {
    ...document,
    editorText: document.editorText.trim().length
      ? `${document.editorText}${nextEditorText ? `\n\n${nextEditorText}` : ""}`
      : nextEditorText,
    components: {
      ...document.components,
      ...appendedDocument.components,
    },
  };
}
