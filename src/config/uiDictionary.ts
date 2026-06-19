export type UiVariant = "primary" | "secondary" | "terminal";

export type UiConfig = {
  transition: "crt" | "grid" | "crash";

  font: {
    body: "font-body" | "font-alt-body" | "font-terminal";
    title: "font-title" | "font-alt-title" | "font-terminal";
    default: "font-ui" | "font-alt-ui" | "font-terminal";
  };

  theme: UiVariant;

  text: {
    base: string;
    hover: string;
  };
};

export const uiDictionary: Record<UiVariant, UiConfig> = {
  primary: {
    transition: "crt",
    theme: "primary",
    font: {
      default: "font-ui",
      body: "font-body",
      title: "font-title"
    },
    text: {
      base: "text-ui-invert",
      hover: "hover:text-retro-primary"
    }
  },

  secondary: {
    transition: "grid",
    theme: "secondary",
    font: {
      default: "font-ui",
      body: "font-body",
      title: "font-alt-title"
    },
    text: {
      base: "text-ui-invert",
      hover: "hover:text-retro-secondary"
    }
  },

  terminal: {
    transition: "crash",
    theme: "terminal",
    font: {
      default: "font-terminal",
      body: "font-terminal",
      title: "font-terminal"
    },
    text: {
      base: "text-ui-base",
      hover: "hover:text-retro-terminal"
    }
  }
}
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