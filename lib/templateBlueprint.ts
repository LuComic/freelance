import {
  LEGACY_COMPONENT_TAG_REGEX,
  PAGE_COMPONENT_TOKEN_REGEX,
  assertPageDocumentV1,
  createComponentInstanceId,
  createComponentToken,
  createDefaultComponentDocument,
  isPageComponentType,
  type PageComponentDocument,
  type PageComponentType,
  type PageDocumentV1,
} from "./pageDocument";

const TEXT_FIELD_PLACEHOLDER = "text field";
const DROPDOWN_TITLE_PLACEHOLDER = "dropdown title";
const DROPDOWN_OPENING_LINE_REGEX = /^:::dropdown(?:\s+.*)?$/;
const DROPDOWN_CLOSING_LINE = ":::";
const HEADING_LINE_REGEX = /^(#{1,6})\s+.*$/;
const INLINE_TEMPLATE_TOKEN_REGEX = new RegExp(
  `${PAGE_COMPONENT_TOKEN_REGEX.source}|${LEGACY_COMPONENT_TAG_REGEX.source}`,
  "g",
);

export type LegacyPageTemplateBlueprintV1 = {
  version: 1;
  type: "page";
  components: PageComponentType[];
};

export type LegacyProjectTemplateBlueprintV1 = {
  version: 1;
  type: "project";
  pages: Array<{
    title: string;
    components: PageComponentType[];
  }>;
};

export type LegacyTemplateBlueprintV1 =
  | LegacyPageTemplateBlueprintV1
  | LegacyProjectTemplateBlueprintV1;

export type PageTemplateBlueprintV2 = {
  version: 2;
  type: "page";
  document: PageDocumentV1;
};

export type ProjectTemplateBlueprintV2 = {
  version: 2;
  type: "project";
  pages: Array<{
    title: string;
    document: PageDocumentV1;
  }>;
};

export type PageTemplateBlueprint =
  | LegacyPageTemplateBlueprintV1
  | PageTemplateBlueprintV2;

export type ProjectTemplatePageBlueprint =
  | LegacyProjectTemplateBlueprintV1["pages"][number]
  | ProjectTemplateBlueprintV2["pages"][number];

export type ProjectTemplateBlueprint =
  | LegacyProjectTemplateBlueprintV1
  | ProjectTemplateBlueprintV2;

export type TemplateBlueprint =
  | LegacyTemplateBlueprintV1
  | PageTemplateBlueprintV2
  | ProjectTemplateBlueprintV2;

type ComponentIdFactory = () => string;
type TemplatePageSource = PageComponentType[] | PageDocumentV1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getHeadingComponentLabel(hashes: string) {
  if (hashes.length === 1) {
    return "MainHeadline (#)";
  }

  if (hashes.length === 2) {
    return "SectionHeader (##)";
  }

  return `Subheader (${hashes})`;
}

function getOrderedTemplateItemLabelsFromContent(
  content: string,
  components: Record<string, PageComponentDocument>,
): string[] {
  const labels: string[] = [];

  for (const line of content.split("\n")) {
    const normalizedLine = line.endsWith("\r") ? line.slice(0, -1) : line;

    if (DROPDOWN_OPENING_LINE_REGEX.test(normalizedLine)) {
      labels.push("Dropdown");
      continue;
    }

    const headingMatch = normalizedLine.match(HEADING_LINE_REGEX);

    if (headingMatch) {
      labels.push(getHeadingComponentLabel(headingMatch[1]));
    }

    for (const match of normalizedLine.matchAll(PAGE_COMPONENT_TOKEN_REGEX)) {
      const instanceId = match[2];
      const component = components[instanceId];

      if (component) {
        labels.push(component.type);
      }
    }

    for (const match of normalizedLine.matchAll(LEGACY_COMPONENT_TAG_REGEX)) {
      const componentType = match[1];

      if (isPageComponentType(componentType)) {
        labels.push(componentType);
      }
    }
  }

  return labels;
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

function assertTemplateDocument(
  value: unknown,
  message = "Template page document is invalid.",
): asserts value is PageDocumentV1 {
  try {
    assertPageDocumentV1(value);
  } catch {
    throw new Error(message);
  }
}

export function assertTemplateBlueprintV1(
  value: unknown,
): asserts value is TemplateBlueprint {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
    throw new Error("Template blueprint version is invalid.");
  }

  if (value.version === 1) {
    if (value.type === "page") {
      assertComponentTypeArray(value.components);
      return;
    }

    if (value.type === "project") {
      if (!Array.isArray(value.pages) || value.pages.length === 0) {
        throw new Error("Project templates must include at least one page.");
      }

      for (const page of value.pages) {
        if (
          !isRecord(page) ||
          typeof page.title !== "string" ||
          !page.title.trim()
        ) {
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

  if (value.type === "page") {
    assertTemplateDocument(value.document);
    return;
  }

  if (value.type === "project") {
    if (!Array.isArray(value.pages) || value.pages.length === 0) {
      throw new Error("Project templates must include at least one page.");
    }

    for (const page of value.pages) {
      if (
        !isRecord(page) ||
        typeof page.title !== "string" ||
        !page.title.trim()
      ) {
        throw new Error("Project template pages must include a title.");
      }

      assertTemplateDocument(
        page.document,
        "Project template page document is invalid.",
      );
    }

    return;
  }

  throw new Error("Template blueprint type is invalid.");
}

function replaceTextFragment(fragment: string, preserveText: boolean) {
  if (!/\S/.test(fragment)) {
    return fragment;
  }

  const leadingWhitespace = fragment.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = fragment.match(/\s*$/)?.[0] ?? "";
  return preserveText
    ? `${leadingWhitespace}${TEXT_FIELD_PLACEHOLDER}${trailingWhitespace}`
    : `${leadingWhitespace}${trailingWhitespace}`;
}

function sanitizeTemplateTextLine(line: string, insideDropdown: boolean) {
  if (DROPDOWN_OPENING_LINE_REGEX.test(line)) {
    return `:::dropdown ${DROPDOWN_TITLE_PLACEHOLDER}`;
  }

  if (line === DROPDOWN_CLOSING_LINE) {
    return line;
  }

  const headingMatch = line.match(HEADING_LINE_REGEX);
  if (headingMatch) {
    return `${headingMatch[1]} ${TEXT_FIELD_PLACEHOLDER}`;
  }

  if (!/\S/.test(line)) {
    return line;
  }

  const matches = [...line.matchAll(INLINE_TEMPLATE_TOKEN_REGEX)];
  if (matches.length === 0) {
    return insideDropdown ? TEXT_FIELD_PLACEHOLDER : "";
  }

  let sanitizedLine = "";
  let lastIndex = 0;

  for (const match of matches) {
    const index = match.index ?? 0;
    sanitizedLine += replaceTextFragment(
      line.slice(lastIndex, index),
      insideDropdown,
    );
    sanitizedLine += match[0];
    lastIndex = index + match[0].length;
  }

  sanitizedLine += replaceTextFragment(line.slice(lastIndex), insideDropdown);

  return /\S/.test(sanitizedLine)
    ? sanitizedLine
    : insideDropdown
      ? TEXT_FIELD_PLACEHOLDER
      : "";
}

function sanitizeTemplateEditorText(editorText: string) {
  let insideDropdown = false;

  return editorText
    .split("\n")
    .map((line) => {
      const sanitizedLine = sanitizeTemplateTextLine(line, insideDropdown);

      if (DROPDOWN_OPENING_LINE_REGEX.test(line)) {
        insideDropdown = true;
      } else if (line === DROPDOWN_CLOSING_LINE) {
        insideDropdown = false;
      }

      return sanitizedLine;
    })
    .join("\n");
}

function createTemplateDocument(document: PageDocumentV1): PageDocumentV1 {
  const components: Record<string, PageComponentDocument> = {};
  const referencedComponentIds = new Set<string>();

  for (const match of document.editorText.matchAll(
    PAGE_COMPONENT_TOKEN_REGEX,
  )) {
    const componentType = match[1];
    const instanceId = match[2];
    const component = document.components[instanceId];

    if (
      !component ||
      !isPageComponentType(componentType) ||
      component.type !== componentType ||
      referencedComponentIds.has(instanceId)
    ) {
      continue;
    }

    referencedComponentIds.add(instanceId);
    components[instanceId] = createDefaultComponentDocument(
      component.type,
      instanceId,
    );
  }

  let editorText = sanitizeTemplateEditorText(document.editorText);

  for (const [instanceId, component] of Object.entries(document.components)) {
    if (referencedComponentIds.has(instanceId)) {
      continue;
    }

    components[instanceId] = createDefaultComponentDocument(
      component.type,
      instanceId,
    );

    const componentToken = createComponentToken(component.type, instanceId);
    editorText = editorText.trim().length
      ? `${editorText}\n\n${componentToken}`
      : componentToken;
  }

  return {
    version: 1,
    editorText,
    components,
  };
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

function cloneComponentDocumentWithId(
  component: PageComponentDocument,
  id: string,
): PageComponentDocument {
  const clonedComponent = JSON.parse(
    JSON.stringify(component),
  ) as PageComponentDocument;

  clonedComponent.id = id;
  return clonedComponent;
}

function instantiateTemplateDocument(
  document: PageDocumentV1,
  createId: ComponentIdFactory = createComponentIdFactory(),
): PageDocumentV1 {
  const componentIdMap = new Map<string, string>();
  const components: Record<string, PageComponentDocument> = {};
  const consumedComponentIds = new Set<string>();
  let editorText = document.editorText.replace(
    PAGE_COMPONENT_TOKEN_REGEX,
    (fullMatch, componentType: string, instanceId: string) => {
      const component = document.components[instanceId];

      if (
        !component ||
        !isPageComponentType(componentType) ||
        component.type !== componentType
      ) {
        return fullMatch;
      }

      consumedComponentIds.add(instanceId);
      let nextInstanceId = componentIdMap.get(instanceId);

      if (!nextInstanceId) {
        nextInstanceId = createId();
        componentIdMap.set(instanceId, nextInstanceId);
        components[nextInstanceId] = cloneComponentDocumentWithId(
          component,
          nextInstanceId,
        );
      }

      return createComponentToken(component.type, nextInstanceId);
    },
  );

  for (const [instanceId, component] of Object.entries(document.components)) {
    if (consumedComponentIds.has(instanceId)) {
      continue;
    }

    let nextInstanceId = componentIdMap.get(instanceId);

    if (!nextInstanceId) {
      nextInstanceId = createId();
      componentIdMap.set(instanceId, nextInstanceId);
      components[nextInstanceId] = cloneComponentDocumentWithId(
        component,
        nextInstanceId,
      );
    }

    const componentToken = createComponentToken(component.type, nextInstanceId);
    editorText = editorText.trim().length
      ? `${editorText}\n\n${componentToken}`
      : componentToken;
  }

  return {
    version: 1,
    editorText,
    components,
  };
}

export function createPageTemplateBlueprint(
  document: PageDocumentV1,
): PageTemplateBlueprintV2 {
  return {
    version: 2,
    type: "page",
    document: createTemplateDocument(document),
  };
}

export function createProjectTemplateBlueprint(
  pages: Array<{
    title: string;
    document: PageDocumentV1;
  }>,
): ProjectTemplateBlueprintV2 {
  return {
    version: 2,
    type: "project",
    pages: pages.map((page, index) => ({
      title: page.title.trim() || `Page ${index + 1}`,
      document: createTemplateDocument(page.document),
    })),
  };
}

export function getOrderedComponentTypes(
  document: PageDocumentV1,
): PageComponentType[] {
  const seenComponentIds = new Set<string>();
  const orderedComponentTypes: PageComponentType[] = [];

  for (const match of document.editorText.matchAll(
    PAGE_COMPONENT_TOKEN_REGEX,
  )) {
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

export function getOrderedTemplateItemLabels(
  document: PageDocumentV1,
): string[] {
  return getOrderedTemplateItemLabelsFromContent(
    document.editorText,
    document.components,
  );
}

export function getTemplatePageSource(
  blueprint: PageTemplateBlueprint | ProjectTemplatePageBlueprint,
): TemplatePageSource {
  return "document" in blueprint ? blueprint.document : blueprint.components;
}

export function getTemplateSourceComponentTypes(source: TemplatePageSource) {
  return Array.isArray(source) ? [...source] : getOrderedComponentTypes(source);
}

export function getTemplateSourceItemLabels(source: TemplatePageSource) {
  return Array.isArray(source)
    ? [...source]
    : getOrderedTemplateItemLabels(source);
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

export function buildPageDocumentFromTemplateSource(
  source: TemplatePageSource,
  createId: ComponentIdFactory = createComponentIdFactory(),
): PageDocumentV1 {
  return Array.isArray(source)
    ? buildPageDocumentFromComponentTypes(source, createId)
    : instantiateTemplateDocument(source, createId);
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

export function appendTemplateSourceToDocument(
  document: PageDocumentV1,
  source: TemplatePageSource,
): PageDocumentV1 {
  if (Array.isArray(source) && source.length === 0) {
    return document;
  }

  if (
    !Array.isArray(source) &&
    !source.editorText.trim() &&
    Object.keys(source.components).length === 0
  ) {
    return document;
  }

  const appendedDocument = buildPageDocumentFromTemplateSource(
    source,
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
