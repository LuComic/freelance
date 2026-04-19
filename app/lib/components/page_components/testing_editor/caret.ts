const TEXTAREA_MIRRORED_PROPERTIES = [
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
] as const;

function getTextareaLineHeight(computedStyle: CSSStyleDeclaration) {
  const parsedLineHeight = Number.parseFloat(computedStyle.lineHeight);
  if (Number.isFinite(parsedLineHeight)) {
    return parsedLineHeight;
  }

  const parsedFontSize = Number.parseFloat(computedStyle.fontSize);
  if (Number.isFinite(parsedFontSize)) {
    return parsedFontSize * 1.5;
  }

  return 24;
}

function createTextareaMirror(
  textarea: HTMLTextAreaElement,
  computedStyle: CSSStyleDeclaration,
) {
  const mirror = document.createElement("div");

  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = textarea.wrap === "off" ? "pre" : "pre-wrap";
  mirror.style.wordWrap = textarea.wrap === "off" ? "normal" : "break-word";
  mirror.style.overflowWrap = textarea.wrap === "off" ? "normal" : "break-word";

  for (const property of TEXTAREA_MIRRORED_PROPERTIES) {
    mirror.style[property] = computedStyle[property];
  }

  return mirror;
}

function createLineStartMarker() {
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  return marker;
}

export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number,
) {
  const computedStyle = window.getComputedStyle(textarea);
  const mirror = createTextareaMirror(textarea, computedStyle);

  mirror.textContent = textarea.value.slice(0, position);
  const marker = document.createElement("span");
  marker.textContent = textarea.value.slice(position, position + 1) || " ";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const coordinates = {
    top: marker.offsetTop - textarea.scrollTop,
    left: marker.offsetLeft - textarea.scrollLeft,
  };

  document.body.removeChild(mirror);
  return coordinates;
}

export function measureWrappedLineHeights(textarea: HTMLTextAreaElement) {
  const computedStyle = window.getComputedStyle(textarea);
  const mirror = createTextareaMirror(textarea, computedStyle);
  const lineHeight = getTextareaLineHeight(computedStyle);
  const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;

  mirror.style.width = `${Math.max(
    textarea.clientWidth - paddingLeft - paddingRight,
    0,
  )}px`;
  mirror.style.height = "auto";
  mirror.style.padding = "0";
  mirror.style.border = "0";
  mirror.style.overflow = "visible";

  const markers = textarea.value.split("\n").map((line, index) => {
    if (index > 0) {
      mirror.appendChild(document.createTextNode("\n"));
    }

    const marker = createLineStartMarker();
    mirror.appendChild(marker);
    mirror.appendChild(document.createTextNode(line === "" ? "\u00a0" : line));
    return marker;
  });

  document.body.appendChild(mirror);

  const mirrorHeight = mirror.getBoundingClientRect().height;
  const lineHeights = markers.map((marker, index) => {
    const nextMarker = markers[index + 1];
    const nextTop = nextMarker ? nextMarker.offsetTop : mirrorHeight;
    return Math.max(nextTop - marker.offsetTop, lineHeight);
  });

  document.body.removeChild(mirror);
  return lineHeights.length > 0 ? lineHeights : [lineHeight];
}
