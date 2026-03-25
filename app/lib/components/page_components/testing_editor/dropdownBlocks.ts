export const DROPDOWN_SLASH_COMMAND = "dropdown";
export const DROPDOWN_SCAFFOLD_TITLE = "Dropdown title";
export const DROPDOWN_FALLBACK_TITLE = "Dropdown";

const DROPDOWN_OPENING_PREFIX = ":::dropdown";
const DROPDOWN_OPENING_LINE_REGEX = /^:::dropdown(?:\s+(.*))?$/;
const DROPDOWN_CLOSING_LINE = ":::";

export type ParsedEditorBlock =
  | {
      type: "content";
      content: string;
    }
  | {
      type: "dropdown";
      title: string;
      body: string;
    };

type ParsedLine = {
  start: number;
  fullEnd: number;
  text: string;
};

function trimSingleTrailingLineBreak(value: string) {
  if (value.endsWith("\r\n")) {
    return value.slice(0, -2);
  }

  if (value.endsWith("\n")) {
    return value.slice(0, -1);
  }

  return value;
}

function getParsedLines(content: string) {
  const lines: ParsedLine[] = [];
  let index = 0;

  while (index < content.length) {
    const lineStart = index;

    while (index < content.length && content[index] !== "\n") {
      index += 1;
    }

    const lineEnd = index;
    if (content[index] === "\n") {
      index += 1;
    }

    const rawText = content.slice(lineStart, lineEnd);
    lines.push({
      start: lineStart,
      fullEnd: index,
      text: rawText.endsWith("\r") ? rawText.slice(0, -1) : rawText,
    });
  }

  return lines;
}

export function createDropdownScaffold(title = DROPDOWN_SCAFFOLD_TITLE) {
  return `${DROPDOWN_OPENING_PREFIX} ${title}\n\n${DROPDOWN_CLOSING_LINE}`;
}

export function getDropdownScaffoldCursorOffset(
  title = DROPDOWN_SCAFFOLD_TITLE,
) {
  return `${DROPDOWN_OPENING_PREFIX} ${title}\n`.length;
}

export function parseEditorBlocks(content: string): ParsedEditorBlock[] {
  if (!content) {
    return [];
  }

  const lines = getParsedLines(content);
  const blocks: ParsedEditorBlock[] = [];
  let contentStart = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const openingMatch = line.text.match(DROPDOWN_OPENING_LINE_REGEX);
    if (!openingMatch) {
      continue;
    }

    let closingLine: ParsedLine | null = null;

    for (
      let searchIndex = index + 1;
      searchIndex < lines.length;
      searchIndex += 1
    ) {
      const candidate = lines[searchIndex];

      if (candidate.text.match(DROPDOWN_OPENING_LINE_REGEX)) {
        closingLine = null;
        break;
      }

      if (candidate.text === DROPDOWN_CLOSING_LINE) {
        closingLine = candidate;
        index = searchIndex;
        break;
      }
    }

    if (!closingLine) {
      break;
    }

    if (contentStart < line.start) {
      blocks.push({
        type: "content",
        content: content.slice(contentStart, line.start),
      });
    }

    const title = openingMatch[1]?.trim() || DROPDOWN_FALLBACK_TITLE;
    blocks.push({
      type: "dropdown",
      title,
      body: trimSingleTrailingLineBreak(
        content.slice(line.fullEnd, closingLine.start),
      ),
    });

    contentStart = closingLine.fullEnd;
  }

  if (contentStart < content.length) {
    blocks.push({
      type: "content",
      content: content.slice(contentStart),
    });
  }

  return blocks;
}
