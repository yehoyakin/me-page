export type UiVariant = "primary" | "secondary" | "terminal";

export type UiConfig = {
  transition: "crt" | "grid" | "crash";
  font: "psx" | "title" | "terminal";
  theme: "primary" | "secondary" | "terminal";
};

export const uiDictionary: Record<UiVariant, UiConfig> = {
  primary: {
    transition: "crt",
    font: "psx",
    theme: "primary"
  },

  secondary: {
    transition: "grid",
    font: "title",
    theme: "secondary"
  },

  terminal: {
    transition: "crash",
    font: "terminal",
    theme: "terminal"
  }
};