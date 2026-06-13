export type UiVariant = "primary" | "secondary" | "terminal";

export type UiConfig = {
  transition: "crt" | "grid" | "crash";
  font: "psx" | "title" | "terminal";
  theme: "primary" | "secondary" | "terminal";

  text: {
    base: string;
    hover: string;
  };
};

export const uiDictionary: Record<UiVariant, UiConfig> = {
  primary: {
    transition: "crt",
    font: "psx",
    theme: "primary",
    text: {
      base: "text-white",
      hover: "group-hover:text-amber-400"
    }
  },

  secondary: {
    transition: "grid",
    font: "psx",
    theme: "secondary",
    text: {
      base: "text-white",
      hover: "group-hover:text-cyan-400"
    }
  },

  terminal: {
    transition: "crash",
    font: "terminal",
    theme: "terminal",
    text: {
      base: "text-green-200",
      hover: "group-hover:text-green-400"
    }
  }
};

export type ProjectRole =
  | "lead_programmer"
  | "developer"
  | "ui"
  | "game_design"
  | "art"
  | "audio"
  | "tech_art"
  | "systems"
  | "tools";