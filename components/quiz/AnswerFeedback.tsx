'use client'

import { useEffect, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type AnswerFeedbackProps = {
  isCorrect: boolean
  explanation?: string | null
  children?: ReactNode
  onContinue: () => void
  continueLabel?: string
}

/**
 * Sticky feedback panel with Continue — does not auto-advance.
 * Enter key triggers Continue when focused in the session.
 */
export function AnswerFeedback({
  isCorrect,
  explanation,
  children,
  onContinue,
  continueLabel = 'Continue →',
}: AnswerFeedbackProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'TEXTAREA' ||
          (target.tagName === 'INPUT' &&
            (target as HTMLInputElement).type !== 'button' &&
            (target as HTMLInputElement).type !== 'submit'))
      ) {
        return
      }
      e.preventDefault()
      onContinue()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onContinue])

  return (
    <div className="space-y-3">
      <div
        className={`rounded-lg p-3 text-sm ${
          isCorrect
            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
            : 'bg-red-500/10 text-red-700 dark:text-red-400'
        }`}
        role="status"
      >
        <p className="font-semibold">
          {isCorrect ? 'Correct ✅' : 'Incorrect ❌'}
        </p>
        {children}
        {explanation ? (
          <p className="mt-2 text-muted-foreground">{explanation}</p>
        ) : null}
      </div>
      <Button
        type="button"
        className="h-12 min-h-[44px] w-full"
        onClick={onContinue}
      >
        {continueLabel}
      </Button>
    </div>
  )
}
