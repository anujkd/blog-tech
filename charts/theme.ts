// ============================================================
// THEME ENGINE — Design tokens, theme resolution, CSS variables
// ============================================================

import type { ResolvedTheme, ThemeMode } from "../types";

// ─── Design Tokens ───────────────────────────────────────────

const CHART_PALETTE_LIGHT = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#F97316", // orange-500
  "#84CC16", // lime-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#6366F1", // indigo-500
  "#D97706", // amber-600
];

const CHART_PALETTE_DARK = [
  "#60A5FA", // blue-400
  "#34D399", // emerald-400
  "#FBBF24", // amber-400
  "#F87171", // red-400
  "#A78BFA", // violet-400
  "#22D3EE", // cyan-400
  "#FB923C", // orange-400
  "#A3E635", // lime-400
  "#F472B6", // pink-400
  "#2DD4BF", // teal-400
  "#818CF8", // indigo-400
  "#FCD34D", // amber-300
];

export const LIGHT_THEME: ResolvedTheme = {
  mode: "light",
  colors: {
    primary: "#3B82F6",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    grid: "#F1F5F9",
    palette: CHART_PALETTE_LIGHT,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontSize: 12,
    fontWeight: 400,
  },
  spacing: { unit: 8 },
  borderRadius: 8,
};

export const DARK_THEME: ResolvedTheme = {
  mode: "dark",
  colors: {
    primary: "#60A5FA",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#334155",
    grid: "#1E293B",
    palette: CHART_PALETTE_DARK,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontSize: 12,
    fontWeight: 400,
  },
  spacing: { unit: 8 },
  borderRadius: 8,
};

// High-contrast for accessibility
export const HIGH_CONTRAST_THEME: ResolvedTheme = {
  mode: "light",
  colors: {
    primary: "#0000EE",
    background: "#FFFFFF",
    surface: "#F0F0F0",
    text: "#000000",
    textSecondary: "#333333",
    border: "#000000",
    grid: "#CCCCCC",
    palette: [
      "#0000EE", "#CC0000", "#006600", "#CC6600",
      "#660099", "#007777", "#AA0055", "#004499",
      "#007700", "#990000", "#550088", "#003366",
    ],
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 13,
    fontWeight: 500,
  },
  spacing: { unit: 8 },
  borderRadius: 4,
};

// ─── Theme Resolver ───────────────────────────────────────────

export function resolveTheme(
  mode: ThemeMode,
  systemPreference: "light" | "dark",
  customTokens?: Record<string, string>
): ResolvedTheme {
  let base: ResolvedTheme;

  const effective = mode === "system" ? systemPreference : mode;

  if (effective === "dark") {
    base = { ...DARK_THEME };
  } else if (mode === "custom" && customTokens) {
    base = buildCustomTheme(customTokens, systemPreference);
  } else {
    base = { ...LIGHT_THEME };
  }

  if (customTokens && mode !== "custom") {
    base = mergeCustomTokens(base, customTokens);
  }

  return base;
}

function buildCustomTheme(
  tokens: Record<string, string>,
  systemPref: "light" | "dark"
): ResolvedTheme {
  const base = systemPref === "dark" ? { ...DARK_THEME } : { ...LIGHT_THEME };
  return mergeCustomTokens({ ...base, mode: "custom" as ThemeMode }, tokens);
}

function mergeCustomTokens(
  base: ResolvedTheme,
  tokens: Record<string, string>
): ResolvedTheme {
  return {
    ...base,
    colors: {
      ...base.colors,
      ...(tokens.primary && { primary: tokens.primary }),
      ...(tokens.background && { background: tokens.background }),
      ...(tokens.surface && { surface: tokens.surface }),
      ...(tokens.text && { text: tokens.text }),
      ...(tokens.textSecondary && { textSecondary: tokens.textSecondary }),
      ...(tokens.border && { border: tokens.border }),
      ...(tokens.grid && { grid: tokens.grid }),
      ...(tokens.palette && { palette: tokens.palette.split(",").map((c) => c.trim()) }),
    },
    typography: {
      ...base.typography,
      ...(tokens.fontFamily && { fontFamily: tokens.fontFamily }),
      ...(tokens.fontSize && { fontSize: Number(tokens.fontSize) }),
    },
    ...(tokens.borderRadius && { borderRadius: Number(tokens.borderRadius) }),
  };
}

// ─── CSS Variable Injector ────────────────────────────────────

export function injectThemeCSSVars(theme: ResolvedTheme, scopeId?: string): void {
  const scope = scopeId ? `#${scopeId}` : ":root";
  const styleId = `cwf-theme-${scopeId ?? "root"}`;

  let el = document.getElementById(styleId);
  if (!el) {
    el = document.createElement("style");
    el.id = styleId;
    document.head.appendChild(el);
  }

  const vars = [
    `--cwf-color-primary: ${theme.colors.primary}`,
    `--cwf-color-bg: ${theme.colors.background}`,
    `--cwf-color-surface: ${theme.colors.surface}`,
    `--cwf-color-text: ${theme.colors.text}`,
    `--cwf-color-text-secondary: ${theme.colors.textSecondary}`,
    `--cwf-color-border: ${theme.colors.border}`,
    `--cwf-color-grid: ${theme.colors.grid}`,
    `--cwf-font-family: ${theme.typography.fontFamily}`,
    `--cwf-font-size: ${theme.typography.fontSize}px`,
    `--cwf-font-weight: ${theme.typography.fontWeight}`,
    `--cwf-border-radius: ${theme.borderRadius}px`,
    `--cwf-spacing: ${theme.spacing.unit}px`,
    ...theme.colors.palette.map((c, i) => `--cwf-palette-${i}: ${c}`),
  ].join("; ");

  el.textContent = `${scope} { ${vars} }`;
}
