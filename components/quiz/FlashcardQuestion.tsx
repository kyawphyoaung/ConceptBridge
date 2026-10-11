'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { isFlashcardData } from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

/**
 * Flashcard with 3D flip + self-rating + Continue before advancing.
 */
export function FlashcardQuestion({ question, onSubmit }: BaseQuestionProps) {
  const { playClick, playCorrect, playWrong } = useSound()
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState(false)
  const [knewIt, setKnewIt] = useState(false)

  const data = isFlashcardData(question.question_data)
    ? question.question_data
    : null

  const continueToNext = useCallback(() => {
    if (!data || !rated) return
    onSubmit(knewIt ? data.definition : '', knewIt)
  }, [data, rated, knewIt, onSubmit])

  if (!data) {
    return (
      <p className="text-sm text-destructive">Invalid flashcard data.</p>
    )
  }

  const reveal = () => {
    if (flipped || rated) return
    playClick()
    setFlipped(true)
  }

  const rate = (knew: boolean) => {
    if (rated) return
    setRated(true)
    setKnewIt(knew)
    if (knew) playCorrect()
    else playWrong()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{question.prompt}</p>

      <button
        type="button"
        onClick={reveal}
        className="relative mx-auto block h-48 w-full max-w-sm perspective-[1000px]"
        aria-label={flipped ? 'Card revealed' : 'Tap to reveal'}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-2xl font-bold tracking-wide">{data.term}</p>
            <p className="mt-3 text-xs text-muted-foreground">Tap to reveal</p>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-6"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-lg font-semibold text-center">{data.definition}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              {data.category}
            </p>
          </div>
        </motion.div>
      </button>

      {flipped && !rated ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="h-12 min-h-[44px] flex-1"
            onClick={() => rate(true)}
          >
            I knew it
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[44px] flex-1"
            onClick={() => rate(false)}
          >
            I didn&apos;t know
          </Button>
        </div>
      ) : null}

      {rated ? (
        <AnswerFeedback
          isCorrect={knewIt}
          explanation={question.explanation}
          onContinue={continueToNext}
        >
          <p className="mt-1">{data.term} — {data.definition}</p>
        </AnswerFeedback>
      ) : null}
    </div>
  )
}
