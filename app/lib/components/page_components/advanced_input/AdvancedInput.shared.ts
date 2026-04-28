export type AdvancedInputMode = "colors" | "fonts";

export type AdvancedInputColorType = "primary" | "secondary" | "other";

export const ADVANCED_INPUT_COLOR_TYPES = [
  "primary",
  "secondary",
  "other",
] as const satisfies readonly AdvancedInputColorType[];

export type AdvancedInputFont = {
  id: string;
  name: string;
  type: string;
  feeling: string;
  family: string;
};

export const ADVANCED_INPUT_FONTS = [
  {
    id: "inter",
    name: "Inter",
    type: "sans-serif",
    feeling: "modern, clean",
    family: '"Inter", sans-serif',
  },
  {
    id: "roboto",
    name: "Roboto",
    type: "sans-serif",
    feeling: "neutral, versatile",
    family: '"Roboto", sans-serif',
  },
  {
    id: "open-sans",
    name: "Open Sans",
    type: "sans-serif",
    feeling: "friendly, readable",
    family: '"Open Sans", sans-serif',
  },
  {
    id: "montserrat",
    name: "Montserrat",
    type: "sans-serif",
    feeling: "geometric, stylish",
    family: '"Montserrat", sans-serif',
  },
  {
    id: "playfair-display",
    name: "Playfair Display",
    type: "serif",
    feeling: "elegant, editorial",
    family: '"Playfair Display", serif',
  },
  {
    id: "merriweather",
    name: "Merriweather",
    type: "serif",
    feeling: "classic, readable",
    family: '"Merriweather", serif',
  },
  {
    id: "lora",
    name: "Lora",
    type: "serif",
    feeling: "modern, balanced",
    family: '"Lora", serif',
  },
  {
    id: "poppins",
    name: "Poppins",
    type: "sans-serif",
    feeling: "geometric, trendy",
    family: '"Poppins", sans-serif',
  },
  {
    id: "raleway",
    name: "Raleway",
    type: "sans-serif",
    feeling: "sleek, refined",
    family: '"Raleway", sans-serif',
  },
  {
    id: "nunito",
    name: "Nunito",
    type: "sans-serif",
    feeling: "soft, approachable",
    family: '"Nunito", sans-serif',
  },
  {
    id: "bebas-neue",
    name: "Bebas Neue",
    type: "display",
    feeling: "bold, condensed",
    family: '"Bebas Neue", sans-serif',
  },
  {
    id: "oswald",
    name: "Oswald",
    type: "display",
    feeling: "strong, editorial",
    family: '"Oswald", sans-serif',
  },
  {
    id: "anton",
    name: "Anton",
    type: "display",
    feeling: "heavy, impactful",
    family: '"Anton", sans-serif',
  },
  {
    id: "pacifico",
    name: "Pacifico",
    type: "script",
    feeling: "casual, playful",
    family: '"Pacifico", cursive',
  },
  {
    id: "quicksand",
    name: "Quicksand",
    type: "sans-serif",
    feeling: "light, friendly",
    family: '"Quicksand", sans-serif',
  },
  {
    id: "fredoka",
    name: "Fredoka",
    type: "rounded",
    feeling: "bold, fun",
    family: '"Fredoka", sans-serif',
  },
  {
    id: "fira-code",
    name: "Fira Code",
    type: "monospace",
    feeling: "technical, dev-style",
    family: '"Fira Code Variable", monospace',
  },
] as const satisfies readonly AdvancedInputFont[];

export type AdvancedInputFontId = (typeof ADVANCED_INPUT_FONTS)[number]["id"];

export function getAdvancedInputFont(fontId: string) {
  return ADVANCED_INPUT_FONTS.find((font) => font.id === fontId) ?? null;
}

export function createAdvancedInputEntryId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getAdvancedInputModeLabel(mode: AdvancedInputMode) {
  return mode === "colors" ? "Color" : "Font";
}
