export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number,
) {
  const mirror = document.createElement("div");
  const computedStyle = window.getComputedStyle(textarea);
  const propertiesToMirror = [
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

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.pointerEvents = "none";

  for (const property of propertiesToMirror) {
    mirror.style[property] = computedStyle[property];
  }

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
