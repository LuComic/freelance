"use client";

import { type ReactNode } from "react";
import { COMPONENT_TAG_REGEX } from "./constants";
import { RENDERABLE_COMPONENTS } from "./componentRegistry";
import { MainHeadline } from "@/app/lib/components/page_components/text/parts/MainHeadline";
import { SectionHeader } from "@/app/lib/components/page_components/text/parts/SectionHeader";
import { Subheader } from "@/app/lib/components/page_components/text/parts/Subheader";

const LINE_HEADING_REGEX = /^(#{1,6})\s+(.*)$/;

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

  for (const match of content.matchAll(COMPONENT_TAG_REGEX)) {
    const index = match.index ?? 0;
    const fullMatch = match[0];
    const tag = match[1];

    if (index > lastIndex) {
      const plainText = content.slice(lastIndex, index);
      const renderedPlain = renderPlainTextSegment(plainText, key);
      nodes.push(...renderedPlain.nodes);
      key = renderedPlain.nextKey;
    }

    const componentMatch = RENDERABLE_COMPONENTS.find(
      (item) => item.tag === tag,
    );
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
    const tailText = content.slice(lastIndex);
    const renderedTail = renderPlainTextSegment(tailText, key);
    nodes.push(...renderedTail.nodes);
  }

  return nodes;
}
