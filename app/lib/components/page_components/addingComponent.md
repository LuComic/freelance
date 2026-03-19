# Adding A New Page Component

## Specifications

`type`

- The component name used in the page document, for example `"IdeaForm"`.
  Example:

```ts
type: "IdeaForm";
```

`commands`

- The slash commands that insert the component.
  Example:

```ts
commands: ["ideaform", "ideas"];
```

`createDefaultConfig`

- The default creator/setup data (only creator sees that) for a new component.
  Example:

```ts
createDefaultConfig: () => ({
  title: "",
});
```

`createDefaultState`

- The default live data (both client and creator see that) for a new component.
  Example:

```ts
createDefaultState: () => ({
  items: [],
});
```

`normalizeConfig`

- Cleans or accepts loaded config from stored page JSON.
- Must return a valid config object.
- If your UI is the only writer, the simple pattern is enough.

Minimal pattern:

```ts
normalizeConfig: (value, fallback) => {
  if (typeof value === "object" && value !== null) {
    return value as typeof fallback;
  }

  return fallback;
};
```

`normalizeState`

- Cleans or accepts loaded state from stored page JSON.
- Must return a valid state object.
- If your UI is the only writer, keep it simple.
- The check must match the real state shape of your component.

Minimal pattern:

```ts
normalizeState: (value, fallback) => {
  if (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return value as typeof fallback;
  }

  return fallback;
};
```

Example for `IdeaForm`, because its state is `{ ideas: [] }`:

```ts
normalizeState: (value, fallback) => {
  if (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { ideas?: unknown }).ideas)
  ) {
    return value as typeof fallback;
  }

  return fallback;
};
```

`componentLibrary`

- Controls how the component appears in the component picker.
  Example:

```ts
componentLibrary: {
  name: "Your Component",
  description: "What it does. Command: /yourcomponent",
  previewSrc: "/component-previews/text-field.svg",
  tag: "input",
}
```

## Steps

1. Create the component files in `app/lib/components/page_components/your_component/`.

Usually:

- `YourComponent.tsx`
- `YourComponentCreator.tsx`
- `YourComponentClient.tsx`

2. In `YourComponent.tsx`, use `usePageComponentState(instanceId, "YourComponent")`.

Minimal shape:

```tsx
export const YourComponent = ({ instanceId }: { instanceId: string }) => {
  const { isLive } = useEditMode();
  const { component, liveState, updateConfig, updateLiveState } =
    usePageComponentState(instanceId, "YourComponent");

  return isLive ? (
    <YourComponentClient
      config={component.config}
      liveState={liveState.state}
    />
  ) : (
    <YourComponentCreator
      config={component.config}
      liveState={liveState.state}
      onChangeConfig={updateConfig}
      onChangeLiveState={updateLiveState}
    />
  );
};
```

3. Create the shared definition in `lib/pageDocument/registered/YourComponent.definition.ts`.

Minimal example:

```ts
export const YourComponentDefinition = defineRegisteredPageComponentDefinition({
  type: "YourComponent",
  commands: ["yourcomponent"],
  createDefaultConfig: () => ({
    title: "",
  }),
  createDefaultState: () => ({
    items: [],
  }),
  normalizeConfig: (value, fallback) => {
    if (typeof value === "object" && value !== null) {
      return value as typeof fallback;
    }

    return fallback;
  },
  normalizeState: (value, fallback) => {
    if (
      typeof value === "object" &&
      value !== null &&
      Array.isArray((value as { items?: unknown }).items)
    ) {
      return value as typeof fallback;
    }

    return fallback;
  },
  componentLibrary: {
    name: "Your Component",
    description: "What it does. Command: /yourcomponent",
    previewSrc: "/component-previews/text-field.svg",
    tag: "input",
  },
});
```

Change `items` to whatever your real state field is.

4. Register the definition in `lib/pageDocument/registeredComponents.ts`.

Add it to:

```ts
export const REGISTERED_PAGE_COMPONENT_DEFINITIONS = [
  IdeaFormDefinition,
  YourComponentDefinition,
] as const;
```

5. Register the renderer in `app/lib/components/page_components/registeredComponentRenderers.tsx`.

Add it to:

```tsx
export const REGISTERED_PAGE_COMPONENT_RENDERERS = [
  {
    type: "IdeaForm",
    Component: IdeaForm,
  },
  {
    type: "YourComponent",
    Component: YourComponent,
  },
] as const;
```

## Result

After those registrations:

- slash command insertion works
- autocomplete works
- component library entry works
- page document typing works
- default config/state creation works
- saved config/state loads through the new registry path

## Rule of thumb

- Put UI details in the component files.
- Put shared persisted shape in the definition file.
- Keep `normalizeConfig` and `normalizeState` simple unless the component truly needs more.
