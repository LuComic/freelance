# Adding A New Page Component

## Specifications

`type`

- The component name used in the page document, for example `"YourComponent"`.
  Example:

```ts
type: "YourComponent";
```

`commands`

- The slash commands that insert the component.
  Example:

```ts
commands: ["yourcomponent"];
```

`createDefaultConfig`

- The default creator/setup data (only creator sees that) for a new component.
- Put booleans, titles, tags, permissions, and other setup choices here.
- If the live/client UI should react to those choices, pass `component.config` into both your creator and client components.
  Example:

```ts
createDefaultConfig: () => ({
  title: "",
});
```

Example for `IdeaBoard`, because it stores client permissions in config:

```ts
createDefaultConfig: () => ({
  canClientAdd: true,
  canClientVote: true,
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
- If config fields matter to rendering or permissions, normalize the individual fields instead of blindly casting.

Minimal pattern:

```ts
normalizeConfig: (value, fallback) => {
  if (typeof value === "object" && value !== null) {
    return value as typeof fallback;
  }

  return fallback;
};
```

Safer example for boolean config like `IdeaBoard`:

```ts
normalizeConfig: (value, fallback) => {
  if (typeof value === "object" && value !== null) {
    const config = value as Partial<typeof fallback>;

    return {
      canClientAdd:
        typeof config.canClientAdd === "boolean"
          ? config.canClientAdd
          : fallback.canClientAdd,
      canClientVote:
        typeof config.canClientVote === "boolean"
          ? config.canClientVote
          : fallback.canClientVote,
    };
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

Example for `YourComponent`, because its state is `{ items: [] }`:

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

`componentLibrary`

- Controls how the component appears in the component picker.
  Example:

```ts
componentLibrary: {
  name: "Your Component",
  description: "What it does. Command: /yourcomponent",
  previewSrc: "/component-previews/text-field.svg",
  tag: "input",
  limited: false,
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

If your client view also depends on config, keep that prop there too:

```tsx
<YourComponentClient
  config={component.config}
  liveState={liveState.state}
  onChangeLiveState={updateLiveState}
/>
```

Common copy-paste trap:

- `onChangeConfig` must use your new component type on both sides.
- Do not leave another component name in the return type.

Correct pattern:

```ts
type YourComponentCreatorProps = {
  config: PageComponentInstanceByType<"YourComponent">["config"];
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"YourComponent">["config"],
    ) => PageComponentInstanceByType<"YourComponent">["config"],
  ) => void;
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
    limited: false,
  },
});
```

Change `items` to whatever your real state field is.

4. Register the definition in `lib/pageDocument/registeredComponents.ts`.

Add it to:

```ts
export const REGISTERED_PAGE_COMPONENT_DEFINITIONS = [
  YourComponentDefinition,
] as const;
```

5. Register the renderer in `app/lib/components/page_components/registeredComponentRenderers.tsx`.

Add it to:

```tsx
export const REGISTERED_PAGE_COMPONENT_RENDERERS = [
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
