'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isIdiomTransformData } from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'
import type { Question } from '@/lib/types/database'

type IdiomMcqQuestionProps = BaseQuestionProps & {
  allTopicQuestions: Question[]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]!
    copy[j] = tmp!
  }
  return copy
}

function getIdiomWord(q: Question): string | null {
  if (!isIdiomTransformData(q.question_data)) return null
  return q.question_data.idiom_word ?? q.question_data.idiom
}

function getOriginalWord(q: Question): string | null {
  if (!isIdiomTransformData(q.question_data)) return null
  return q.question_data.original_word ?? null
}

/**
 * Idiom MCQ: show original_word, pick correct idiom_word from 4 options.
 */
export function IdiomMcqQuestion({
  question,
  onSubmit,
  allTopicQuestions,
}: IdiomMcqQuestionProps) {
  const { playCorrect, playWrong, playClick } = useSound()
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const promptWord = getOriginalWord(question) ?? question.prompt
  const correctWord = getIdiomWord(question)

  const options = useMemo(() => {
    if (!correctWord) return []
    const distractors = allTopicQuestions
      .filter((q) => q.id !== question.id)
      .map(getIdiomWord)
      .filter((w): w is string => typeof w === 'string' && w !== correctWord)
    const unique = Array.from(new Set(distractors))
    const wrong = shuffle(unique).slice(0, 3)
    while (wrong.length < 3) {
      wrong.push(`(option ${wrong.length + 1})`)
    }
    return shuffle([correctWord, ...wrong.slice(0, 3)])
  }, [allTopicQuestions, question.id, correctWord])

  const correctIndex = options.indexOf(correctWord ?? '')

  const continueToNext = useCallback(() => {
    if (selected === null || !submitted) return
    onSubmit(options[selected] ?? '', isCorrect)
  }, [selected, submitted, options, isCorrect, onSubmit])

  if (!correctWord || options.length < 4) {
    return (
      <p className="text-sm text-destructive">
        Not enough idiom options for MCQ practice.
      </p>
    )
  }

  const handleSubmit = () => {
    if (selected === null || submitted) return
    const ok = selected === correctIndex
    setIsCorrect(ok)
    setSubmitted(true)
    if (ok) playCorrect()
    else playWrong()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose the idiom
        </p>
        <p className="mt-1 text-xl font-semibold">{promptWord}</p>
        {question.prompt && question.prompt !== promptWord ? (
          <p className="mt-1 text-sm text-muted-foreground">{question.prompt}</p>
        ) : null}
      </div>

      <ul className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selected === index
          const isCorrectOption = index === correctIndex
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
                  'flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm',
                  stateClass
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
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
          <p className="mt-1">
            Correct idiom:{' '}
            <span className="font-semibold">{correctWord}</span>
          </p>
        </AnswerFeedback>
      )}
    </div>
  )
}
