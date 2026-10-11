'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GrammarPattern } from '@/lib/types/database'

type PatternCardProps = {
  pattern: GrammarPattern
  defaultOpen?: boolean
  className?: string
}

/**
 * Full grammar pattern card (trigger words + examples).
 */
export function PatternCard({
  pattern,
  defaultOpen = false,
  className,
}: PatternCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <button
        type="button"
        className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-3 text-left md:cursor-default"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="font-semibold">{pattern.name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {pattern.category}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform md:hidden',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      <div className={cn('space-y-4 px-4 pb-4', !open && 'hidden md:block')}>
        {pattern.explanation_en ? (
          <p className="text-sm text-muted-foreground">{pattern.explanation_en}</p>
        ) : null}
        {pattern.explanation_mm ? (
          <p className="text-sm text-muted-foreground">{pattern.explanation_mm}</p>
        ) : null}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trigger words
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pattern.trigger_words.map((word) => (
              <span
                key={word}
                className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Examples (from → to)
          </p>
          <ul className="mt-2 space-y-2">
            {pattern.examples.map((ex, i) => (
              <li key={i} className="rounded-md bg-muted/50 p-2 text-sm">
                <p className="text-muted-foreground">{ex.from}</p>
                <p className="font-medium">→ {ex.to}</p>
                {ex.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">{ex.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
