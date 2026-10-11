'use client'

import { Check, Moon, Palette, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { THEMES, type ThemeName } from '@/lib/themes'
import { cn } from '@/lib/utils'

const THEME_NAMES = Object.keys(THEMES) as ThemeName[]

function ThemeCards({
  theme,
  onSelect,
}: {
  theme: ThemeName
  onSelect: (name: ThemeName) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {THEME_NAMES.map((name) => {
        const meta = THEMES[name]
        const selected = theme === name
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={cn(
              'flex min-h-[72px] flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'border-primary bg-accent'
                : 'border-border bg-card'
            )}
            aria-pressed={selected}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span
                className="h-6 w-6 rounded-full border border-border"
                style={{ backgroundColor: meta.previewColor }}
                aria-hidden
              />
              {selected ? (
                <Check className="h-4 w-4 text-primary" aria-hidden />
              ) : null}
            </span>
            <span className="text-sm font-medium">{meta.name}</span>
            <span className="text-xs text-muted-foreground">
              {meta.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Switch between 4 color themes + dark mode.
 * Mobile: bottom sheet. Desktop: dropdown.
 *
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { theme, setTheme, darkMode, toggleDarkMode } = useTheme()

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px]"
              aria-label="Change theme"
            >
              <Palette className="h-5 w-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <SheetHeader>
              <SheetTitle>Theme</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4 px-1 pb-4">
              <ThemeCards theme={theme} onSelect={setTheme} />
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full min-h-[44px]"
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <>
                    <Sun className="h-4 w-4" aria-hidden /> Light mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" aria-hidden /> Dark mode
                  </>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px]"
              aria-label="Change theme"
            >
              <Palette className="h-5 w-5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {THEME_NAMES.map((name) => {
              const meta = THEMES[name]
              return (
                <DropdownMenuItem
                  key={name}
                  onClick={() => setTheme(name)}
                  className="min-h-[44px] cursor-pointer gap-2"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border"
                    style={{ backgroundColor: meta.previewColor }}
                    aria-hidden
                  />
                  <span className="flex-1">{meta.name}</span>
                  {theme === name ? (
                    <Check className="h-4 w-4 text-primary" aria-hidden />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={toggleDarkMode}
              className="min-h-[44px] cursor-pointer gap-2"
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4" aria-hidden /> Light mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" aria-hidden /> Dark mode
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
