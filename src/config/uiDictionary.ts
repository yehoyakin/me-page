export type UiVariant = "primary" | "secondary" | "terminal";

export type UiConfig = {
  transition: "crt" | "grid" | "crash";

  fontClass: "font-psx" | "font-title" | "font-terminal";

  theme: UiVariant;

  text: {
    base: string;   // normal text color class
    hover: string;  // MUST include full Tailwind hover class
  };
};

export const uiDictionary: Record<UiVariant, UiConfig> = {
  primary: {
    transition: "crt",
    fontClass: "font-psx",
    theme: "primary",
    text: {
      base: "text-ui-invert",
      hover: "hover:text-retro-primary"
    }
  },

  secondary: {
    transition: "grid",
    fontClass: "font-psx",
    theme: "secondary",
    text: {
      base: "text-ui-invert",
      hover: "hover:text-retro-secondary"
    }
  },

  terminal: {
    transition: "crash",
    fontClass: "font-terminal",
    theme: "terminal",
    text: {
      base: "text-ui-base",
      hover: "hover:text-retro-terminal"
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