'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { PatternHint } from '@/components/grammar/PatternHint'
import { TransformationExplanation } from '@/components/grammar/TransformationExplanation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkAnswer } from '@/lib/logic/answerCheck'
import { getGrammarPatternById } from '@/lib/queries/grammar'
import {
  isSentenceTransformData,
  type GrammarPattern,
} from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

/**
 * Grammar sentence transform with one retry, then sticky feedback + Continue.
 */
export function SentenceTransformQuestion({
  question,
  onSubmit,
}: BaseQuestionProps) {
  const { playCorrect, playWrong } = useSound()
  const [answer, setAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [pattern, setPattern] = useState<GrammarPattern | null>(null)

  const data = isSentenceTransformData(question.question_data)
    ? question.question_data
    : null

  const continueToNext = useCallback(() => {
    if (!revealed) return
    onSubmit(answer, isCorrect)
  }, [revealed, answer, isCorrect, onSubmit])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!question.grammar_pattern_id) {
        setPattern(null)
        return
      }
      try {
        const row = await getGrammarPatternById(question.grammar_pattern_id)
        if (!cancelled) setPattern(row)
      } catch {
        if (!cancelled) setPattern(null)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [question.grammar_pattern_id])

  if (!data) {
    return (
      <p className="text-sm text-destructive">Invalid sentence-transform data.</p>
    )
  }

  const finish = (userAnswer: string, correct: boolean) => {
    setRevealed(true)
    setIsCorrect(correct)
    if (correct) playCorrect()
    else playWrong()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (revealed || !answer.trim()) return

    const result = checkAnswer({
      userAnswer: answer,
      correctAnswer: data.answer,
      acceptableAnswers: question.correct_answer
        ? [question.correct_answer]
        : undefined,
    })

    if (result.isCorrect) {
      finish(answer, true)
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setSuggestion(
      result.spellingSuggestion
        ? `Did you mean “${result.spellingSuggestion.suggestedWord}”? (you wrote “${result.spellingSuggestion.wrongWord}”)`
        : null
    )

    if (nextAttempts >= 2) {
      finish(answer, false)
    } else {
      playWrong()
    }
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

      {data.transformation_hint ? (
        <p className="text-sm text-muted-foreground">
          Hint: {data.transformation_hint}
        </p>
      ) : null}

      {pattern ? <PatternHint pattern={pattern} /> : null}

      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type the transformed sentence…"
        disabled={revealed}
        className="h-12 min-h-[44px] text-base"
        autoComplete="off"
      />

      {suggestion && !revealed ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">{suggestion}</p>
      ) : null}

      {!revealed ? (
        <div className="space-y-2">
          <Button
            type="submit"
            className="h-12 min-h-[44px] w-full"
            disabled={!answer.trim()}
          >
            {attempts === 0 ? 'Check answer' : 'Try again'}
          </Button>
          {attempts === 1 ? (
            <p className="text-center text-xs text-muted-foreground">
              One more try before the answer is revealed.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <AnswerFeedback
            isCorrect={isCorrect}
            explanation={null}
            onContinue={continueToNext}
          >
            {suggestion ? <p className="mt-1">{suggestion}</p> : null}
          </AnswerFeedback>
          <TransformationExplanation
            userAnswer={answer}
            correctAnswer={data.answer}
            patternName={pattern?.name}
            note={pattern?.explanation_en ?? question.explanation}
          />
        </div>
      )}
    </form>
  )
}
