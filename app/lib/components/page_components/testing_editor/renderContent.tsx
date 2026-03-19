"use client";

import { type ComponentType, type ReactNode } from "react";
import { COMPONENT_TAG_REGEX, COMPONENT_TOKEN_REGEX } from "./constants";
import { getRenderablePageComponent } from "./componentRegistry";
import { MainHeadline } from "@/app/lib/components/page_components/text/parts/MainHeadline";
import { SectionHeader } from "@/app/lib/components/page_components/text/parts/SectionHeader";
import { Subheader } from "@/app/lib/components/page_components/text/parts/Subheader";
import { isPageComponentType, type PageComponentType } from "@/lib/pageDocument";

const LINE_HEADING_REGEX = /^(#{1,6})\s+(.*)$/;

function RenderedComponentInstance({
  type,
  instanceId,
}: {
  type: PageComponentType;
  instanceId: string;
}) {
  const componentMatch = getRenderablePageComponent(type);
  if (!componentMatch) {
    return null;
  }

  const Component = componentMatch.Component;
  return <Component instanceId={instanceId} />;
}

function renderPlainTextSegment(segment: string, keyStart: number) {
  const nodes: ReactNode[] = [];
  const lines = segment.split("\n");
  let key = keyStart;

  lines.forEach((line, lineIndex) => {
    const match = line.match(LINE_HEADING_REGEX);
    const isLastLine = lineIndex === lines.length - 1;

    if (match) {
      const level = match[1].length;
      const text = match[2];

      if (level === 1) {
        nodes.push(<MainHeadline key={`text-${key++}`} text={text} />);
      } else if (level === 2) {
        nodes.push(<SectionHeader key={`text-${key++}`} text={text} />);
      } else {
        nodes.push(<Subheader key={`text-${key++}`} text={text} />);
      }
    } else if (line.length > 0) {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`text-${key++}`}>
          {line}
        </span>,
      );
    }

    if (!isLastLine && !match) {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`text-${key++}`}>
          {"\n"}
        </span>,
      );
    }
  });

  return { nodes, nextKey: key };
}

export function renderContentWithComponents(content: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const matches = [
    ...content.matchAll(COMPONENT_TOKEN_REGEX),
    ...content.matchAll(COMPONENT_TAG_REGEX),
  ].sort((left, right) => (left.index ?? 0) - (right.index ?? 0));

  for (const match of matches) {
    const index = match.index ?? 0;
    const fullMatch = match[0];
    const tag = match[1];

    if (index > lastIndex) {
      const plainText = content.slice(lastIndex, index);
      const renderedPlain = renderPlainTextSegment(plainText, key);
      nodes.push(...renderedPlain.nodes);
      key = renderedPlain.nextKey;
    }

    if (fullMatch.startsWith("[[")) {
      const instanceId = match[2];
      if (isPageComponentType(tag) && typeof instanceId === "string") {
        nodes.push(
          <RenderedComponentInstance
            key={`component-${key++}`}
            type={tag}
            instanceId={instanceId}
          />,
        );
      } else {
        nodes.push(
          <span className="whitespace-pre-wrap" key={`unknown-${key++}`}>
            {fullMatch}
          </span>,
        );
      }
    } else if (isPageComponentType(tag)) {
      const componentMatch = getRenderablePageComponent(tag);
      if (componentMatch) {
        const Component = componentMatch.Component as ComponentType;
        nodes.push(<Component key={`legacy-${key++}`} />);
      } else {
        nodes.push(
          <span className="whitespace-pre-wrap" key={`legacy-${key++}`}>
            {fullMatch}
          </span>,
        );
      }
    } else {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`unknown-${key++}`}>
          {fullMatch}
        </span>,
      );
    }

    lastIndex = index + fullMatch.length;

    // Component tags render as block elements, so consume one structural line
    // break after the tag to avoid double-rendering blank space between blocks.
    if (content[lastIndex] === "\r" && content[lastIndex + 1] === "\n") {
      lastIndex += 2;
    } else if (content[lastIndex] === "\n") {
      lastIndex += 1;
    }
  }

  if (lastIndex < content.length) {
    const tailText = content.slice(lastIndex);
    const renderedTail = renderPlainTextSegment(tailText, key);
    nodes.push(...renderedTail.nodes);
  }

  return nodes;
}
