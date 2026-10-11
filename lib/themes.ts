/**
 * ConceptBridge theme definitions (Section 8.2).
 * Values are HSL components without `hsl()` wrapper — matches Tailwind
 * `hsl(var(--token))` usage in tailwind.config.ts.
 */

export type ThemeName = 'default' | 'forest' | 'sunset' | 'mono'

export type ThemeMeta = {
  name: string
  description: string
  previewColor: string
}

export const THEMES: Record<ThemeName, ThemeMeta> = {
  default: {
    name: 'Default',
    description: 'Blue / Indigo — focused and clear',
    previewColor: '#4F46E5',
  },
  forest: {
    name: 'Forest',
    description: 'Green / Teal — calm study mode',
    previewColor: '#0D9488',
  },
  sunset: {
    name: 'Sunset',
    description: 'Orange / Pink — warm energy',
    previewColor: '#EA580C',
  },
  mono: {
    name: 'Mono',
    description: 'Gray / Black — minimal contrast',
    previewColor: '#171717',
  },
}

type ThemeTokens = Record<string, string>

const defaultLight: ThemeTokens = {
  '--background': '210 40% 98%',
  '--foreground': '222 47% 11%',
  '--card': '0 0% 100%',
  '--card-foreground': '222 47% 11%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '222 47% 11%',
  '--primary': '239 84% 67%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '214 32% 91%',
  '--secondary-foreground': '222 47% 11%',
  '--muted': '210 40% 96%',
  '--muted-foreground': '215 16% 47%',
  '--accent': '226 100% 94%',
  '--accent-foreground': '226 71% 40%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '214 32% 91%',
  '--input': '214 32% 91%',
  '--ring': '239 84% 67%',
  '--radius': '0.5rem',
}

const defaultDark: ThemeTokens = {
  '--background': '222 47% 7%',
  '--foreground': '210 40% 98%',
  '--card': '222 47% 10%',
  '--card-foreground': '210 40% 98%',
  '--popover': '222 47% 10%',
  '--popover-foreground': '210 40% 98%',
  '--primary': '234 89% 74%',
  '--primary-foreground': '222 47% 11%',
  '--secondary': '217 33% 17%',
  '--secondary-foreground': '210 40% 98%',
  '--muted': '217 33% 17%',
  '--muted-foreground': '215 20% 65%',
  '--accent': '226 45% 22%',
  '--accent-foreground': '226 100% 90%',
  '--destructive': '0 63% 45%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '217 33% 17%',
  '--input': '217 33% 17%',
  '--ring': '234 89% 74%',
  '--radius': '0.5rem',
}

const forestLight: ThemeTokens = {
  '--background': '150 30% 97%',
  '--foreground': '162 47% 12%',
  '--card': '0 0% 100%',
  '--card-foreground': '162 47% 12%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '162 47% 12%',
  '--primary': '173 80% 32%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '160 30% 92%',
  '--secondary-foreground': '162 47% 12%',
  '--muted': '160 25% 94%',
  '--muted-foreground': '165 15% 40%',
  '--accent': '168 70% 90%',
  '--accent-foreground': '173 80% 22%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '160 25% 88%',
  '--input': '160 25% 88%',
  '--ring': '173 80% 32%',
  '--radius': '0.5rem',
}

const forestDark: ThemeTokens = {
  '--background': '168 40% 7%',
  '--foreground': '160 30% 96%',
  '--card': '168 35% 10%',
  '--card-foreground': '160 30% 96%',
  '--popover': '168 35% 10%',
  '--popover-foreground': '160 30% 96%',
  '--primary': '172 66% 45%',
  '--primary-foreground': '168 40% 8%',
  '--secondary': '170 30% 16%',
  '--secondary-foreground': '160 30% 96%',
  '--muted': '170 30% 16%',
  '--muted-foreground': '165 15% 65%',
  '--accent': '170 35% 20%',
  '--accent-foreground': '168 70% 85%',
  '--destructive': '0 63% 45%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '170 30% 18%',
  '--input': '170 30% 18%',
  '--ring': '172 66% 45%',
  '--radius': '0.5rem',
}

const sunsetLight: ThemeTokens = {
  '--background': '30 50% 98%',
  '--foreground': '20 30% 12%',
  '--card': '0 0% 100%',
  '--card-foreground': '20 30% 12%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '20 30% 12%',
  '--primary': '21 90% 48%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '30 60% 93%',
  '--secondary-foreground': '20 30% 12%',
  '--muted': '30 40% 95%',
  '--muted-foreground': '20 12% 42%',
  '--accent': '340 80% 94%',
  '--accent-foreground': '340 70% 35%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '30 35% 88%',
  '--input': '30 35% 88%',
  '--ring': '21 90% 48%',
  '--radius': '0.5rem',
}

const sunsetDark: ThemeTokens = {
  '--background': '20 30% 8%',
  '--foreground': '30 40% 96%',
  '--card': '20 28% 11%',
  '--card-foreground': '30 40% 96%',
  '--popover': '20 28% 11%',
  '--popover-foreground': '30 40% 96%',
  '--primary': '24 95% 58%',
  '--primary-foreground': '20 30% 8%',
  '--secondary': '20 25% 18%',
  '--secondary-foreground': '30 40% 96%',
  '--muted': '20 25% 18%',
  '--muted-foreground': '25 15% 65%',
  '--accent': '340 40% 22%',
  '--accent-foreground': '340 80% 88%',
  '--destructive': '0 63% 45%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '20 25% 20%',
  '--input': '20 25% 20%',
  '--ring': '24 95% 58%',
  '--radius': '0.5rem',
}

const monoLight: ThemeTokens = {
  '--background': '0 0% 98%',
  '--foreground': '0 0% 9%',
  '--card': '0 0% 100%',
  '--card-foreground': '0 0% 9%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '0 0% 9%',
  '--primary': '0 0% 9%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '0 0% 94%',
  '--secondary-foreground': '0 0% 9%',
  '--muted': '0 0% 94%',
  '--muted-foreground': '0 0% 45%',
  '--accent': '0 0% 92%',
  '--accent-foreground': '0 0% 9%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '0 0% 89%',
  '--input': '0 0% 89%',
  '--ring': '0 0% 9%',
  '--radius': '0.5rem',
}

const monoDark: ThemeTokens = {
  '--background': '0 0% 6%',
  '--foreground': '0 0% 98%',
  '--card': '0 0% 9%',
  '--card-foreground': '0 0% 98%',
  '--popover': '0 0% 9%',
  '--popover-foreground': '0 0% 98%',
  '--primary': '0 0% 98%',
  '--primary-foreground': '0 0% 9%',
  '--secondary': '0 0% 15%',
  '--secondary-foreground': '0 0% 98%',
  '--muted': '0 0% 15%',
  '--muted-foreground': '0 0% 64%',
  '--accent': '0 0% 15%',
  '--accent-foreground': '0 0% 98%',
  '--destructive': '0 63% 40%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '0 0% 18%',
  '--input': '0 0% 18%',
  '--ring': '0 0% 83%',
  '--radius': '0.5rem',
}

const LIGHT_THEMES: Record<ThemeName, ThemeTokens> = {
  default: defaultLight,
  forest: forestLight,
  sunset: sunsetLight,
  mono: monoLight,
}

const DARK_THEMES: Record<ThemeName, ThemeTokens> = {
  default: defaultDark,
  forest: forestDark,
  sunset: sunsetDark,
  mono: monoDark,
}

/**
 * Resolve CSS variable map for a theme + light/dark mode.
 *
 * @example
 * getThemeStyles('forest') // light forest tokens
 * getThemeStyles('forest', true) // dark forest tokens
 */
export function getThemeStyles(
  theme: ThemeName,
  darkMode = false
): Record<string, string> {
  return darkMode ? DARK_THEMES[theme] : LIGHT_THEMES[theme]
}

export function isThemeName(value: unknown): value is ThemeName {
  return (
    value === 'default' ||
    value === 'forest' ||
    value === 'sunset' ||
    value === 'mono'
  )
}
