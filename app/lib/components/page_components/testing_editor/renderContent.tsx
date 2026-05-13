"use client";

import { type ComponentType, type ReactNode } from "react";
import { COMPONENT_TAG_REGEX, COMPONENT_TOKEN_REGEX } from "./constants";
import { getRenderablePageComponent } from "./componentRegistry";
import { PageContentDropdownBlock } from "./PageContentDropdownBlock";
import { parseEditorBlocks } from "./dropdownBlocks";
import { MainHeadline } from "@/app/lib/components/page_components/text/parts/MainHeadline";
import { SectionHeader } from "@/app/lib/components/page_components/text/parts/SectionHeader";
import { Subheader } from "@/app/lib/components/page_components/text/parts/Subheader";
import {
  isPageComponentType,
  type PageComponentType,
} from "@/lib/pageDocument";

const LINE_HEADING_REGEX = /^(#{1,6})\s+(.*)$/;
const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
const HIGHLIGHTED_WORD_REGEX = /\berle\b/gi;
const LINK_REGEX = /(?:https?:\/\/|www\.)[^\s<]+/gi;

function normalizeFencedCodeBlock(code: string) {
  return code.replace(/^\r?\n/, "").replace(/\r?\n$/, "");
}

function stripTrailingLinkPunctuation(value: string) {
  const match = value.match(/[.,!?;:)]*$/);
  const trailingText = match?.[0] ?? "";

  return {
    linkText: value.slice(0, value.length - trailingText.length),
    trailingText,
  };
}

function renderHighlightedText(value: string, keyStart: number) {
  const nodes: ReactNode[] = [];
  let key = keyStart;
  let lastIndex = 0;

  for (const match of value.matchAll(HIGHLIGHTED_WORD_REGEX)) {
    const index = match.index ?? 0;
    const matchedText = match[0];

    if (index > lastIndex) {
      nodes.push(value.slice(lastIndex, index));
    }

    nodes.push(
      <span className="brand-highlight" key={`highlight-${key++}`}>
        {matchedText}
      </span>,
    );
    lastIndex = index + matchedText.length;
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return { nodes, nextKey: key };
}

function renderSpecialText(value: string, keyStart: number) {
  const nodes: ReactNode[] = [];
  let key = keyStart;
  let lastIndex = 0;

  const pushHighlightedText = (text: string) => {
    const renderedText = renderHighlightedText(text, key);
    nodes.push(...renderedText.nodes);
    key = renderedText.nextKey;
  };

  for (const match of value.matchAll(LINK_REGEX)) {
    const index = match.index ?? 0;
    const matchedText = match[0];
    const { linkText, trailingText } =
      stripTrailingLinkPunctuation(matchedText);

    if (!linkText) {
      continue;
    }

    if (index > lastIndex) {
      pushHighlightedText(value.slice(lastIndex, index));
    }

    const href = linkText.startsWith("http") ? linkText : `https://${linkText}`;
    nodes.push(
      <a
        className="w-max text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
        href={href}
        key={`link-${key++}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {linkText}
      </a>,
    );

    if (trailingText) {
      nodes.push(trailingText);
    }

    lastIndex = index + matchedText.length;
  }

  if (lastIndex < value.length) {
    pushHighlightedText(value.slice(lastIndex));
  }

  return { nodes, nextKey: key };
}

function renderInlineMarkdown(text: string, keyStart: number) {
  const nodes: ReactNode[] = [];
  let key = keyStart;
  let index = 0;

  const pushPlainText = (value: string) => {
    if (!value) {
      return;
    }

    const renderedText = renderSpecialText(value, key);
    nodes.push(...renderedText.nodes);
    key = renderedText.nextKey;
  };

  while (index < text.length) {
    if (text.startsWith("**", index)) {
      const endIndex = text.indexOf("**", index + 2);
      const boldText = endIndex === -1 ? "" : text.slice(index + 2, endIndex);

      if (boldText && !boldText.includes("\n")) {
        const renderedBoldText = renderSpecialText(boldText, key);
        key = renderedBoldText.nextKey;
        nodes.push(
          <strong key={`bold-${key++}`}>{renderedBoldText.nodes}</strong>,
        );
        index = endIndex + 2;
        continue;
      }
    }

    if (text[index] === "*") {
      const endIndex = text.indexOf("*", index + 1);
      const italicText = endIndex === -1 ? "" : text.slice(index + 1, endIndex);

      if (italicText && !italicText.includes("\n")) {
        const renderedItalicText = renderSpecialText(italicText, key);
        key = renderedItalicText.nextKey;
        nodes.push(<em key={`italic-${key++}`}>{renderedItalicText.nodes}</em>);
        index = endIndex + 1;
        continue;
      }
    }

    const nextBoldIndex = text.indexOf("**", index);
    const nextItalicIndex = text.indexOf("*", index);
    const nextMarkerIndex = [nextBoldIndex, nextItalicIndex]
      .filter((value) => value >= 0)
      .sort((left, right) => left - right)[0];

    if (nextMarkerIndex === index) {
      pushPlainText(text[index] ?? "");
      index += 1;
      continue;
    }

    const endIndex =
      typeof nextMarkerIndex === "number" ? nextMarkerIndex : text.length;
    pushPlainText(text.slice(index, endIndex));
    index = endIndex;
  }

  return { nodes, nextKey: key };
}

function renderQuoteText(text: string, keyStart: number) {
  const renderedInline = renderInlineMarkdown(text, keyStart);

  return {
    node: (
      <div
        className="flex w-full items-stretch gap-3"
        key={`quote-${renderedInline.nextKey}`}
      >
        <div className="w-1 shrink-0 self-stretch rounded-full bg-(--beautiful-color)" />
        <div className="min-w-0 whitespace-pre-wrap">
          {renderedInline.nodes}
        </div>
      </div>
    ),
    nextKey: renderedInline.nextKey + 1,
  };
}

function renderMarkdownText(text: string, keyStart: number) {
  const nodes: ReactNode[] = [];
  let key = keyStart;
  let lastIndex = 0;

  const pushInlineBlock = (value: string) => {
    if (!value) {
      return;
    }

    const renderedInline = renderInlineMarkdown(value, key);
    key = renderedInline.nextKey;
    nodes.push(
      <div className="whitespace-pre-wrap" key={`text-${key++}`}>
        {renderedInline.nodes}
      </div>,
    );
  };

  for (const match of text.matchAll(CODE_BLOCK_REGEX)) {
    const index = match.index ?? 0;
    const code = normalizeFencedCodeBlock(match[1] ?? "");

    if (index > lastIndex) {
      pushInlineBlock(text.slice(lastIndex, index).replace(/\n$/g, ""));
    }

    nodes.push(
      <div
        className="code-snippet-font rounded-xl bg-(--dim) p-2 whitespace-pre-wrap"
        key={`code-${key++}`}
      >
        {code}
      </div>,
    );

    lastIndex = index + match[0].length;
    if (text[lastIndex] === "\r" && text[lastIndex + 1] === "\n") {
      lastIndex += 2;
    } else if (text[lastIndex] === "\n") {
      lastIndex += 1;
    }
  }

  if (lastIndex < text.length) {
    pushInlineBlock(text.slice(lastIndex));
  }

  return { nodes, nextKey: key };
}

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
  let textBuffer = "";

  const flushTextBuffer = () => {
    const text = textBuffer.replace(/\n+$/g, "");
    textBuffer = "";

    if (!text) {
      return;
    }

    const renderedText = renderMarkdownText(text, key);
    nodes.push(...renderedText.nodes);
    key = renderedText.nextKey;
  };

  const renderBlankLines = (count: number) => {
    for (let index = 0; index < count; index += 1) {
      nodes.push(
        <span className="whitespace-pre-wrap" key={`space-${key++}`}>
          {"\n"}
        </span>,
      );
    }
  };

  const isQuoteStart = (value: string) => value.trimStart().startsWith('"');
  const isQuoteEnd = (value: string) => value.trimEnd().endsWith('"');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (line.length === 0) {
      flushTextBuffer();

      let emptyLineCount = 1;
      while (
        lineIndex + emptyLineCount < lines.length &&
        lines[lineIndex + emptyLineCount]?.length === 0
      ) {
        emptyLineCount += 1;
      }

      const isTrailingEmptyGroup = lineIndex + emptyLineCount === lines.length;
      renderBlankLines(
        isTrailingEmptyGroup ? Math.max(0, emptyLineCount - 1) : emptyLineCount,
      );
      lineIndex += emptyLineCount - 1;
      continue;
    }

    if (isQuoteStart(line)) {
      let quoteEndIndex = lineIndex;
      while (
        quoteEndIndex < lines.length &&
        !isQuoteEnd(lines[quoteEndIndex] ?? "")
      ) {
        quoteEndIndex += 1;
      }

      if (quoteEndIndex < lines.length) {
        flushTextBuffer();

        const quoteText = lines.slice(lineIndex, quoteEndIndex + 1).join("\n");
        const renderedQuote = renderQuoteText(quoteText, key);
        nodes.push(renderedQuote.node);
        key = renderedQuote.nextKey;
        lineIndex = quoteEndIndex;
        continue;
      }
    }

    const match = line.match(LINE_HEADING_REGEX);

    if (match) {
      flushTextBuffer();

      const level = match[1].length;
      const text = match[2];

      if (level === 1) {
        nodes.push(<MainHeadline key={`text-${key++}`} text={text} />);
      } else if (level === 2) {
        nodes.push(<SectionHeader key={`text-${key++}`} text={text} />);
      } else {
        nodes.push(<Subheader key={`text-${key++}`} text={text} />);
      }
      continue;
    }

    if (textBuffer.length > 0) {
      textBuffer += "\n";
    }
    textBuffer += line;
  }

  flushTextBuffer();

  return { nodes, nextKey: key };
}

function renderTokenizedContent(content: string, keyStart: number) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = keyStart;
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
    key = renderedTail.nextKey;
  }

  return { nodes, nextKey: key };
}

function renderStructuredContent(content: string, keyStart: number) {
  const blocks = parseEditorBlocks(content);
  if (blocks.length === 0) {
    return renderTokenizedContent(content, keyStart);
  }

  const nodes: ReactNode[] = [];
  let key = keyStart;

  for (const block of blocks) {
    if (block.type === "content") {
      const renderedContent = renderTokenizedContent(block.content, key);
      nodes.push(...renderedContent.nodes);
      key = renderedContent.nextKey;
      continue;
    }

    const dropdownKey = key;
    key += 1;
    const renderedBody = renderStructuredContent(block.body, key);
    key = renderedBody.nextKey;

    nodes.push(
      <PageContentDropdownBlock
        key={`dropdown-${dropdownKey}`}
        title={block.title}
      >
        {renderedBody.nodes}
      </PageContentDropdownBlock>,
    );
  }

  return { nodes, nextKey: key };
}

export function renderContentWithComponents(content: string) {
  return renderStructuredContent(content, 0).nodes;
}
