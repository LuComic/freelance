export type PageComponentLibraryTag = "progress" | "text" | "input";

export type RegisteredPageComponentDefinition<
  Type extends string,
  Commands extends readonly [string, ...string[]],
  Config extends object,
  State extends object,
> = {
  type: Type;
  commands: Commands;
  createDefaultConfig: () => Config;
  createDefaultState: () => State;
  normalizeConfig: (value: unknown, fallback: Config) => Config;
  normalizeState: (value: unknown, fallback: State) => State;
  componentLibrary: {
    name: string;
    description: string;
    previewSrc: string;
    tag: PageComponentLibraryTag;
  };
};

export type AnyRegisteredPageComponentDefinition =
  RegisteredPageComponentDefinition<
    string,
    readonly [string, ...string[]],
    object,
    object
  >;

export function defineRegisteredPageComponentDefinition<
  const Type extends string,
  const Commands extends readonly [string, ...string[]],
  Config extends object,
  State extends object,
>(
  definition: RegisteredPageComponentDefinition<Type, Commands, Config, State>,
) {
  return definition;
}
