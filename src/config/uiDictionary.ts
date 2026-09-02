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

/**
 * Resolve a UiVariant to its CSS custom-property reference.
 * This is the SINGLE source of truth for mapping variant → color token.
 * Use this anywhere you need the inline-style value for `--project-tag-color`.
 */
export function resolveThemeToken(variant: UiVariant): string {
  switch (variant) {
    case "secondary":
      return "var(--retro-secondary)";
    case "terminal":
      return "var(--retro-terminal)";
    case "primary":
    default:
      return "var(--retro-primary)";
  }
}

/**
 * Normalize an arbitrary string into a valid UiVariant.
 */
export function toUiVariant(value: unknown): UiVariant {
  if (value === "secondary") return "secondary";
  if (value === "terminal") return "terminal";
  return "primary";
}

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
      hover: "hover:text-project-tag"
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
      hover: "hover:text-project-tag"
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
      hover: "hover:text-project-tag"
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