"use client";

import { type ReactNode } from "react";
import { COMPONENT_TAG_REGEX } from "./constants";
import { COMPONENT_COMMANDS } from "./componentRegistry";

export function renderContentWithComponents(content: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of content.matchAll(COMPONENT_TAG_REGEX)) {
    const index = match.index ?? 0;
    const fullMatch = match[0];
    const tag = match[1];

    if (index > lastIndex) {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`text-${key++}`}>
          {content.slice(lastIndex, index)}
        </span>,
      );
    }

    const componentMatch = COMPONENT_COMMANDS.find((item) => item.tag === tag);
    if (componentMatch) {
      const Component = componentMatch.Component;
      nodes.push(<Component key={`component-${key++}`} />);
    } else {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`unknown-${key++}`}>
          {fullMatch}
        </span>,
      );
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    nodes.push(
      <span className="whitespace-pre-wrap" key={`tail-${key++}`}>
        {content.slice(lastIndex)}
      </span>,
    );
  }

  return nodes;
}
