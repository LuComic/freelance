export type ProjectChatPageOption = {
  id: string;
  title: string;
};

type PageTagRange = {
  start: number;
  end: number;
  partial: string;
};

type PageTagCompletion = {
  page: ProjectChatPageOption;
  range: PageTagRange;
  suffix: string;
};

export type ProjectChatTextSegment =
  | { type: "text"; text: string }
  | { type: "url"; text: string }
  | { type: "page"; pageId: string; title: string };

const PAGE_TAG_TOKEN_REGEX = /\[\[Page:([^:\]]+):([^\]]*)\]\]/g;
const URL_REGEX = /(https?:\/\/[^\s<]+)/g;
const START_BOUNDARY_CHARACTERS = new Set(["(", "[", "{", '"', "'"]);
const END_BOUNDARY_CHARACTERS = new Set([
  ".",
  ",",
  "!",
  "?",
  ";",
  ":",
  ")",
  "]",
  "}",
  '"',
  "'",
]);

function getPageTitle(page: ProjectChatPageOption) {
  return page.title.trim() || "Untitled page";
}

function createPageTagToken(pageId: string, title: string) {
  return `[[Page:${pageId}:${encodeURIComponent(title)}]]`;
}

function decodePageTagTitle(value: string) {
  try {
    return decodeURIComponent(value).trim() || "Untitled page";
  } catch {
    return value.trim() || "Untitled page";
  }
}

function isTagStartBoundary(value: string, index: number) {
  if (index === 0) {
    return true;
  }

  const previousCharacter = value[index - 1];
  return (
    /\s/.test(previousCharacter) ||
    START_BOUNDARY_CHARACTERS.has(previousCharacter)
  );
}

function isTagEndBoundary(value: string, index: number) {
  if (index >= value.length) {
    return true;
  }

  const nextCharacter = value[index];
  return /\s/.test(nextCharacter) || END_BOUNDARY_CHARACTERS.has(nextCharacter);
}

function getPageTagRangeAtCursor(value: string, cursor: number) {
  const clampedCursor = Math.max(0, Math.min(cursor, value.length));
  const lineStart = value.lastIndexOf("\n", clampedCursor - 1) + 1;

  for (let index = clampedCursor - 1; index >= lineStart; index -= 1) {
    if (value[index] !== "@") {
      continue;
    }

    if (!isTagStartBoundary(value, index)) {
      continue;
    }

    const partial = value.slice(index + 1, clampedCursor);
    if (partial.includes("@")) {
      return null;
    }

    return {
      start: index,
      end: clampedCursor,
      partial,
    };
  }

  return null;
}

function resolvePageTagCompletion(
  value: string,
  cursor: number,
  pages: ProjectChatPageOption[],
): PageTagCompletion | null {
  const range = getPageTagRangeAtCursor(value, cursor);
  if (!range) {
    return null;
  }

  const partial = range.partial.toLocaleLowerCase();
  const page = pages.find((candidate) =>
    getPageTitle(candidate).toLocaleLowerCase().startsWith(partial),
  );
  if (!page) {
    return null;
  }

  const title = getPageTitle(page);
  const suffix = title.slice(range.partial.length);
  if (!suffix) {
    return null;
  }

  return { page, range, suffix };
}

export function getPageTagCompletionSuffix(
  value: string,
  cursor: number,
  pages: ProjectChatPageOption[],
) {
  return resolvePageTagCompletion(value, cursor, pages)?.suffix ?? null;
}

export function completePageTag(
  value: string,
  cursor: number,
  pages: ProjectChatPageOption[],
) {
  const completion = resolvePageTagCompletion(value, cursor, pages);
  if (!completion) {
    return null;
  }

  const title = getPageTitle(completion.page);
  const mentionText = `@${title}`;
  const nextCharacter = value[completion.range.end];
  const separator = nextCharacter && /\s/.test(nextCharacter) ? "" : " ";
  const nextValue = `${value.slice(
    0,
    completion.range.start,
  )}${mentionText}${separator}${value.slice(completion.range.end)}`;

  return {
    nextValue,
    nextCursor: completion.range.start + mentionText.length + separator.length,
  };
}

function getPageMentionAt(
  text: string,
  index: number,
  pages: ProjectChatPageOption[],
) {
  if (text[index] !== "@" || !isTagStartBoundary(text, index)) {
    return null;
  }

  const sortedPages = [...pages].sort(
    (left, right) => getPageTitle(right).length - getPageTitle(left).length,
  );

  for (const page of sortedPages) {
    const title = getPageTitle(page);
    const mentionText = `@${title}`;
    const end = index + mentionText.length;

    if (text.startsWith(mentionText, index) && isTagEndBoundary(text, end)) {
      return {
        pageId: page.id,
        title,
        end,
      };
    }
  }

  return null;
}

function pushPageMentionSegments(
  segments: ProjectChatTextSegment[],
  text: string,
  pages: ProjectChatPageOption[],
) {
  let textBuffer = "";

  const flushText = () => {
    if (!textBuffer) {
      return;
    }

    segments.push({ type: "text", text: textBuffer });
    textBuffer = "";
  };

  for (let index = 0; index < text.length; ) {
    const mention = getPageMentionAt(text, index, pages);
    if (!mention) {
      textBuffer += text[index];
      index += 1;
      continue;
    }

    flushText();
    segments.push({
      type: "page",
      pageId: mention.pageId,
      title: mention.title,
    });
    index = mention.end;
  }

  flushText();
}

function pushPageTokenAndMentionSegments(
  segments: ProjectChatTextSegment[],
  text: string,
  pages: ProjectChatPageOption[],
) {
  let lastIndex = 0;

  for (const match of text.matchAll(PAGE_TAG_TOKEN_REGEX)) {
    const index = match.index ?? 0;
    const pageId = match[1];
    const tokenTitle = decodePageTagTitle(match[2]);
    const page = pages.find((candidate) => candidate.id === pageId);

    pushPageMentionSegments(segments, text.slice(lastIndex, index), pages);
    segments.push({
      type: "page",
      pageId,
      title: page ? getPageTitle(page) : tokenTitle,
    });
    lastIndex = index + match[0].length;
  }

  pushPageMentionSegments(segments, text.slice(lastIndex), pages);
}

export function getProjectChatTextSegments(
  text: string,
  pages: ProjectChatPageOption[],
) {
  const segments: ProjectChatTextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const index = match.index ?? 0;
    const url = match[0];

    pushPageTokenAndMentionSegments(
      segments,
      text.slice(lastIndex, index),
      pages,
    );
    segments.push({ type: "url", text: url });
    lastIndex = index + url.length;
  }

  pushPageTokenAndMentionSegments(segments, text.slice(lastIndex), pages);
  return segments;
}

export function serializeProjectChatPageTags(
  text: string,
  pages: ProjectChatPageOption[],
) {
  return getProjectChatTextSegments(text, pages)
    .map((segment) => {
      if (segment.type !== "page") {
        return segment.text;
      }

      return createPageTagToken(segment.pageId, segment.title);
    })
    .join("");
}
