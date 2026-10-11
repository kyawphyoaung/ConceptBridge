'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isMCQData } from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

/**
 * Multiple-choice question with sticky feedback + Continue.
 */
export function MCQQuestion({ question, onSubmit }: BaseQuestionProps) {
  const { playCorrect, playWrong, playClick } = useSound()
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const data = isMCQData(question.question_data) ? question.question_data : null

  const continueToNext = useCallback(() => {
    if (!data || selected === null || !submitted) return
    onSubmit(data.options[selected] ?? String(selected), isCorrect)
  }, [data, selected, submitted, isCorrect, onSubmit])

  if (!data) {
    return <p className="text-sm text-destructive">Invalid MCQ data.</p>
  }

  const handleSubmit = () => {
    if (selected === null || submitted) return
    const correct = selected === data.correct_index
    setIsCorrect(correct)
    setSubmitted(true)
    if (correct) playCorrect()
    else playWrong()
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-medium leading-relaxed">{question.prompt}</p>

      <ul className="space-y-2">
        {data.options.map((option, index) => {
          const isSelected = selected === index
          const isCorrectOption = index === data.correct_index
          let stateClass = 'border-border bg-card'

          if (submitted) {
            if (isCorrectOption) stateClass = 'border-green-500 bg-green-500/10'
            else if (isSelected) stateClass = 'border-red-500 bg-red-500/10'
          } else if (isSelected) {
            stateClass = 'border-primary bg-primary/5'
          }

          return (
            <li key={`${index}-${option}`}>
              <motion.button
                type="button"
                disabled={submitted}
                whileTap={submitted ? undefined : { scale: 0.98 }}
                onClick={() => {
                  playClick()
                  setSelected(index)
                }}
                className={cn(
                  'flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                  stateClass
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>

      {!submitted ? (
        <Button
          type="button"
          className="h-12 min-h-[44px] w-full"
          disabled={selected === null}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      ) : (
        <AnswerFeedback
          isCorrect={isCorrect}
          explanation={question.explanation}
          onContinue={continueToNext}
        >
          {!isCorrect ? (
            <p className="mt-1">
              Correct answer: {data.options[data.correct_index]}
            </p>
          ) : null}
        </AnswerFeedback>
      )}
    </div>
  )
}
