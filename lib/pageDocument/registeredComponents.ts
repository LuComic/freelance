import { IdeaBoardDefinition } from "./registered/IdeaBoard.definition";

export const REGISTERED_PAGE_COMPONENT_DEFINITIONS = [
  IdeaBoardDefinition,
] as const;

function collectDefinitionTypes<
  const TDefinitions extends readonly { type: string }[],
>(definitions: TDefinitions) {
  return definitions.map((definition) => definition.type) as {
    [Index in keyof TDefinitions]: TDefinitions[Index] extends {
      type: infer Type extends string;
    }
      ? Type
      : never;
  };
}

export const REGISTERED_PAGE_COMPONENT_TYPES = collectDefinitionTypes(
  REGISTERED_PAGE_COMPONENT_DEFINITIONS,
);

export type RegisteredPageComponentType =
  (typeof REGISTERED_PAGE_COMPONENT_TYPES)[number];

export type RegisteredPageComponentCommand =
  (typeof REGISTERED_PAGE_COMPONENT_DEFINITIONS)[number]["commands"][number];

type RegisteredPageComponentDefinitionUnion =
  (typeof REGISTERED_PAGE_COMPONENT_DEFINITIONS)[number];

export type RegisteredPageComponentDefinitionMap = {
  [Type in RegisteredPageComponentType]: Extract<
    RegisteredPageComponentDefinitionUnion,
    { type: Type }
  >;
};

export type RegisteredPageComponentConfigMap = {
  [Type in RegisteredPageComponentType]: ReturnType<
    RegisteredPageComponentDefinitionMap[Type]["createDefaultConfig"]
  >;
};

export type RegisteredPageComponentStateMap = {
  [Type in RegisteredPageComponentType]: ReturnType<
    RegisteredPageComponentDefinitionMap[Type]["createDefaultState"]
  >;
};

const REGISTERED_PAGE_COMPONENT_DEFINITION_MAP = Object.fromEntries(
  REGISTERED_PAGE_COMPONENT_DEFINITIONS.map((definition) => [
    definition.type,
    definition,
  ]),
) as {
  [Type in RegisteredPageComponentType]: RegisteredPageComponentDefinitionMap[Type];
};

export function isRegisteredPageComponentType(
  value: string,
): value is RegisteredPageComponentType {
  return value in REGISTERED_PAGE_COMPONENT_DEFINITION_MAP;
}

export function getRegisteredPageComponentDefinition<
  TType extends RegisteredPageComponentType,
>(type: TType): RegisteredPageComponentDefinitionMap[TType];
export function getRegisteredPageComponentDefinition(
  type: string,
): RegisteredPageComponentDefinitionUnion | null;
export function getRegisteredPageComponentDefinition(type: string) {
  return isRegisteredPageComponentType(type)
    ? REGISTERED_PAGE_COMPONENT_DEFINITION_MAP[type]
    : null;
}
