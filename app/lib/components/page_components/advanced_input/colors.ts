export const TAILWIND_COLOR_400_VALUES: Record<string, string> = {
  slate: "#94a3b8",
  gray: "#9ca3af",
  zinc: "#a1a1aa",
  neutral: "#a3a3a3",
  stone: "#a8a29e",
  red: "#f87171",
  orange: "#fb923c",
  amber: "#fbbf24",
  yellow: "#facc15",
  lime: "#a3e635",
  green: "#4ade80",
  emerald: "#34d399",
  teal: "#2dd4bf",
  cyan: "#22d3ee",
  sky: "#38bdf8",
  blue: "#60a5fa",
  indigo: "#818cf8",
  violet: "#a78bfa",
  purple: "#c084fc",
  fuchsia: "#e879f9",
  pink: "#f472b6",
  rose: "#fb7185",
  black: "#000000",
  white: "#ffffff",
};

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function resolveAdvancedInputColor(value: string) {
  const normalized = value.trim().toLowerCase();

  if (HEX_COLOR_REGEX.test(normalized)) {
    return normalized;
  }

  return TAILWIND_COLOR_400_VALUES[normalized] ?? "#000000";
}
