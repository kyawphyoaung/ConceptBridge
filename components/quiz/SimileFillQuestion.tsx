'use client'

import { useCallback, useState } from 'react'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkAnswer } from '@/lib/logic/answerCheck'
import { isSimileFillData } from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

/**
 * Simile fill-in-the-blank with sticky feedback + Continue.
 */
export function SimileFillQuestion({ question, onSubmit }: BaseQuestionProps) {
  const { playCorrect, playWrong } = useSound()
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [extra, setExtra] = useState<string | null>(null)

  const data = isSimileFillData(question.question_data)
    ? question.question_data
    : null

  const continueToNext = useCallback(() => {
    if (!submitted) return
    onSubmit(answer, isCorrect)
  }, [submitted, answer, isCorrect, onSubmit])

  if (!data) {
    return <p className="text-sm text-destructive">Invalid simile data.</p>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitted || !answer.trim()) return

    const result = checkAnswer({
      userAnswer: answer,
      correctAnswer: data.answer,
      acceptableAnswers: data.acceptable_answers,
    })

    setSubmitted(true)
    setIsCorrect(result.isCorrect)

    if (result.isCorrect) {
      playCorrect()
      setExtra(null)
    } else {
      playWrong()
      const parts = [
        `Correct answer: ${data.answer}`,
        data.hint_context ? `Hint: ${data.hint_context}` : null,
        result.spellingSuggestion
          ? `Did you mean “${result.spellingSuggestion.suggestedWord}”?`
          : null,
      ].filter(Boolean)
      setExtra(parts.join(' · '))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-base font-medium leading-relaxed">{data.sentence}</p>
      {question.prompt && question.prompt !== data.sentence ? (
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      ) : null}

      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Fill in the blank…"
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
          {extra ? <p className="mt-1">{extra}</p> : null}
        </AnswerFeedback>
      )}
    </form>
  )
}
