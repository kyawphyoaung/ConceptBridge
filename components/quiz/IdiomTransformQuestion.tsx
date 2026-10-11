'use client'

import { useCallback, useState } from 'react'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkAnswer } from '@/lib/logic/answerCheck'
import { isIdiomTransformData } from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

/**
 * Idiom rewrite with sticky feedback + Continue.
 */
export function IdiomTransformQuestion({
  question,
  onSubmit,
}: BaseQuestionProps) {
  const { playCorrect, playWrong } = useSound()
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const data = isIdiomTransformData(question.question_data)
    ? question.question_data
    : null

  const continueToNext = useCallback(() => {
    if (!submitted) return
    onSubmit(answer, isCorrect)
  }, [submitted, answer, isCorrect, onSubmit])

  if (!data) {
    return <p className="text-sm text-destructive">Invalid idiom data.</p>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitted || !answer.trim()) return

    const result = checkAnswer({
      userAnswer: answer,
      correctAnswer: data.answer,
      acceptableAnswers: question.correct_answer
        ? [question.correct_answer]
        : undefined,
    })

    setSubmitted(true)
    setIsCorrect(result.isCorrect)
    if (result.isCorrect) playCorrect()
    else playWrong()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Original
        </p>
        <p className="mt-1 text-base font-medium leading-relaxed">
          {data.original}
        </p>
      </div>

      {question.prompt ? (
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      ) : null}

      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Rewrite using the idiom…"
        disabled={submitted}
        className="h-12 min-h-[44px] text-base"
        autoComplete="off"
      />

      {!submitted ? (
        <Button
          type="submit"
          className="h-12 min-h-[44px] w-full"
          disabled={!answer.trim()}
        >
          Check answer
        </Button>
      ) : (
        <AnswerFeedback
          isCorrect={isCorrect}
          explanation={question.explanation}
          onContinue={continueToNext}
        >
          <p className="mt-1">
            Idiom: <span className="font-semibold">{data.idiom}</span>
          </p>
          <p className="mt-1">Answer: {data.answer}</p>
        </AnswerFeedback>
      )}
    </form>
  )
}
