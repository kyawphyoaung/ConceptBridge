'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateThemePreference } from '@/lib/queries/profiles'
import {
  getThemeStyles,
  isThemeName,
  type ThemeName,
} from '@/lib/themes'

const THEME_STORAGE_KEY = 'conceptbridge-theme'
const DARK_STORAGE_KEY = 'conceptbridge-dark'

type ThemeContextValue = {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyThemeToDocument(theme: ThemeName, darkMode: boolean): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', darkMode)

  const styles = getThemeStyles(theme, darkMode)
  for (const [key, value] of Object.entries(styles)) {
    root.style.setProperty(key, value)
  }
}

function readStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'default'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeName(stored) ? stored : 'default'
}

function readStoredDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(DARK_STORAGE_KEY) === 'true'
}

function syncThemeToProfile(theme: ThemeName, darkMode: boolean): void {
  const supabase = createClient()
  void supabase.auth.getUser().then(({ data }) => {
    const userId = data.user?.id
    if (!userId) return
    void updateThemePreference(userId, theme, darkMode).catch(() => {
      // Fire-and-forget — local preference still applied
    })
  })
}

/**
 * Provides color theme + dark mode, persists to localStorage,
 * and syncs to the user profile when logged in.
 *
 * @example
 * <ThemeProvider>{children}</ThemeProvider>
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('default')
  const [darkMode, setDarkModeState] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initialTheme = readStoredTheme()
    const initialDark = readStoredDark()
    setThemeState(initialTheme)
    setDarkModeState(initialDark)
    applyThemeToDocument(initialTheme, initialDark)
    setReady(true)
  }, [])

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next)
    window.localStorage.setItem(THEME_STORAGE_KEY, next)
    const dark = readStoredDark()
    applyThemeToDocument(next, dark)
    syncThemeToProfile(next, dark)
  }, [])

  const setDarkMode = useCallback(
    (dark: boolean) => {
      setDarkModeState(dark)
      window.localStorage.setItem(DARK_STORAGE_KEY, String(dark))
      const currentTheme = isThemeName(
        window.localStorage.getItem(THEME_STORAGE_KEY)
      )
        ? (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName)
        : theme
      applyThemeToDocument(currentTheme, dark)
      syncThemeToProfile(currentTheme, dark)
    },
    [theme]
  )

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode)
  }, [darkMode, setDarkMode])

  // Keep document in sync when state changes after ready
  useEffect(() => {
    if (!ready) return
    applyThemeToDocument(theme, darkMode)
  }, [theme, darkMode, ready])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      darkMode,
      setDarkMode,
      toggleDarkMode,
    }),
    [theme, setTheme, darkMode, setDarkMode, toggleDarkMode]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

/**
 * Access theme context.
 *
 * @example
 * const { theme, setTheme, darkMode, toggleDarkMode } = useTheme()
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
