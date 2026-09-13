/**
 * Theme Configuration System
 *
 * HOW TO ADD A NEW THEME:
 * 1. Add --theme-{name}: <color>; to tokens.css
 * 2. Add a [data-theme="--theme-{name}"] font set to fonts.css
 * 3. Use theme: "{name}" in any .md file (blog or project)
 * 4. Done — no TypeScript changes needed.
 *
 * A theme drives two things: colour (tokens.css) and fonts (fonts.css). A
 * theme without a font set in fonts.css falls back to the :root fonts. The
 * page transition is the same pixel dissolve everywhere — see
 * styles/base/viewTransitions.css.
 */

export type ThemeConfig = {
  text: {
    base: string;
    hover: string;
  };
};

/**
 * Known theme configurations.
 * Add entries here to customize text classes for specific themes.
 * Themes NOT listed here still work — they use the defaults below.
 */
const themeConfigs: Record<string, ThemeConfig> = {
  primary: {
    text: {
      base: "text-ui-invert",
      hover: "hover:text-project-tag",
    },
  },

  secondary: {
    text: {
      base: "text-ui-invert",
      hover: "hover:text-project-tag",
    },
  },

  terminal: {
    text: {
      base: "text-ui-base",
      hover: "hover:text-project-tag",
    },
  },
};

/** Default config used when a theme name has no entry in themeConfigs. */
const defaultThemeConfig: ThemeConfig = {
  text: {
    base: "text-ui-invert",
    hover: "hover:text-project-tag",
  },
};

/**
 * Get the full config (text classes) for a theme name.
 * Falls back to defaults for unknown themes.
 */
export function getThemeConfig(themeName: string): ThemeConfig {
  return themeConfigs[themeName] ?? defaultThemeConfig;
}

/**
 * Theme token NAME, i.e. the string declared in tokens.css and used as the
 * value of the `data-theme` attribute.
 *
 * Convention: theme name "forest" → `--theme-forest`
 *
 * `data-theme="--theme-forest"` is what makes fonts.css hand out that
 * theme's font set (and tokens.css its colour), so anything that can be
 * themed — the <html> element via MyLayout, or a single component such as
 * Title/Body — carries this token.
 */
export function toThemeToken(themeName: string): string {
  return `--theme-${themeName}`;
}

/**
 * Resolve a theme name to its CSS custom-property reference.
 *
 * Convention: theme name "forest" → `var(--theme-forest)`
 *
 * If --theme-forest is not defined in tokens.css, the browser treats
 * the var() as invalid and drops the declaration — graceful degradation.
 */
export function resolveThemeToken(themeName: string): string {
  return `var(${toThemeToken(themeName)})`;
}

/**
 * Normalize an arbitrary value into a valid theme name string.
 * Returns "primary" for null/undefined/empty, passes through everything else.
 */
export function toThemeName(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "primary";
}

// ── Backward-compatible aliases ──────────────────────────────────────────

/** @deprecated Use ThemeConfig directly */
export type UiConfig = ThemeConfig;

/** @deprecated Use getThemeConfig() instead */
export const uiDictionary: Record<string, ThemeConfig> = themeConfigs;

/** @deprecated Use string directly */
export type UiVariant = string;

/** @deprecated Use resolveThemeToken() directly */
export function resolveThemeToken_legacy(variant: UiVariant): string {
  return resolveThemeToken(variant);
}

/** @deprecated Use toThemeName() */
export function toUiVariant(value: unknown): UiVariant {
  return toThemeName(value);
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
