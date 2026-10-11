'use client'

import { useState } from 'react'
import { PatternCard } from '@/components/grammar/PatternCard'
import { Button } from '@/components/ui/button'
import type { GrammarPattern } from '@/lib/types/database'

type PatternHintProps = {
  pattern: GrammarPattern
}

/**
 * Compact inline grammar hint; expands to full PatternCard.
 */
export function PatternHint({ pattern }: PatternHintProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {pattern.target_auxiliary ? (
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            {pattern.target_auxiliary}
          </span>
        ) : null}
        {pattern.trigger_words.slice(0, 4).map((word) => (
          <span
            key={word}
            className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"
          >
            {word}
          </span>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-9 min-h-[36px]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide' : 'Show more'}
        </Button>
      </div>
      {open ? (
        <div className="mt-3">
          <PatternCard pattern={pattern} defaultOpen />
        </div>
      ) : null}
    </div>
  )
}
