'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMediaQuery } from '@/components/essay/useMediaQuery'
import type { EssayTerm } from '@/lib/types/database'

type EssayTermButtonProps = {
  term: EssayTerm
}

/**
 * Inline clickable essay term → Sheet (mobile) / Dialog (desktop).
 */
export function EssayTermButton({ term }: EssayTermButtonProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mx-0.5 inline min-h-[44px] rounded-sm border-b border-primary/60 px-0.5 font-medium text-primary underline-offset-2 hover:bg-primary/10"
    >
      {term.term}
    </button>
  )

  const body = (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Myanmar
        </p>
        <p className="mt-1">{term.definition_mm || '—'}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          English
        </p>
        <p className="mt-1">{term.definition_en || '—'}</p>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{term.term}</DialogTitle>
            </DialogHeader>
            {body}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      {trigger}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>{term.term}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 px-1">{body}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
