/**
 * CSS variable names for theme. Use these when setting or reading theme values
 * so components can reference e.g. var(--theme-primary).
 */
export const THEME_CSS_VARS = {
  primary: "--theme-primary",
  secondary: "--theme-secondary",
} as const;

/** Default hex values for theme colors (used in root defaultProps and globals.css). */
export const THEME_DEFAULTS = {
  primary: "#0ea5e9",
  secondary: "#64748b",
} as const;
