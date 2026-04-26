# Agents.md - Codex

This file has instructions and an overview of what to do and not to do when prompted with a task.

## Overall

- Usually your task is to focus on the backend, so focus on related functions and helper files that already exist.
- Keep the chagnes and updates as minimal as possible. At the same time, effective. Avoid overcomplicating things.

## Commands

- If not said otherwise, opt for using **bun** as the command for checking lint, running servers, build etc
- after ending a task, use **bunx tsc --noEmit** and **bun lint** and ill run **bunx convex dev** or **bunx convex codegen** myself

## UI

- uneless you need to add or modify something, **DO NOT CHANGE** the UI. If you have suggestions or ways of making the UI better, as me for confirmation first
- i often have placeholder/mock data as UI, since I do the frontend myself. Base your modifications and code implemenations on these
- dont overuse text-sm

## Convex/backend

- before implementing a new feature or starting a big task, make sure to check the /convex dir and @schema for current helper functions and directories.
- when creating new UI or components, check and follow the UI of existing pages and components.
  - IMPORANT: When adding new 'page components' or 'insertable components', check for code patterns and logic that existing components in /page_components have
  - follow the @addingComponent.md to see how new components are added and what the flow is
