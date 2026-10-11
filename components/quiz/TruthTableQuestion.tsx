'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  generateTruthTable,
  TruthTableError,
} from '@/lib/logic/truthTable'
import {
  isTruthTableData,
  type TruthClassification,
} from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

type CellValue = 'T' | 'F' | null

/**
 * Interactive truth-table question (practice cell-by-cell or exam submit-all).
 */
export function TruthTableQuestion({
  question,
  onSubmit,
  mode,
}: BaseQuestionProps) {
  const { playCorrect, playWrong, playClick } = useSound()
  const data = isTruthTableData(question.question_data)
    ? question.question_data
    : null

  const table = useMemo(() => {
    if (!data) return null
    try {
      return generateTruthTable(data.expression)
    } catch (err: unknown) {
      if (err instanceof TruthTableError) return null
      return null
    }
  }, [data])

  const expected = useMemo(
    () =>
      data
        ? data.correct_truth_values.map((v) =>
            v.toUpperCase() === 'T' ? ('T' as const) : ('F' as const)
          )
        : [],
    [data]
  )

  const [userResults, setUserResults] = useState<CellValue[]>(() =>
    data ? data.correct_truth_values.map(() => null) : []
  )
  const [shakeIndex, setShakeIndex] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)

  const continueToNext = useCallback(() => {
    if (!submitted || pendingAnswer === null) return
    onSubmit(pendingAnswer, isCorrect)
  }, [submitted, pendingAnswer, isCorrect, onSubmit])

  if (!data || !table) {
    return (
      <p className="text-sm text-destructive">
        Invalid or unparseable truth-table expression.
      </p>
    )
  }

  const allFilled = userResults.every((v) => v !== null)

  const onCellClick = (index: number) => {
    if (submitted) return
    playClick()

    setUserResults((prev) => {
      const next = [...prev]
      const current = next[index]
      const updated: CellValue =
        current === null ? 'T' : current === 'T' ? 'F' : null
      next[index] = updated

      if (mode === 'practice' && updated !== null && updated !== expected[index]) {
        setShakeIndex(index)
        window.setTimeout(() => setShakeIndex(null), 400)
        playWrong()
      }

      return next
    })
  }

  const finish = (cls: TruthClassification) => {
    if (submitted || !allFilled) return

    const valuesOk = userResults.every((v, i) => v === expected[i])
    const classOk = cls === data.classification
    const ok = valuesOk && classOk

    setIsCorrect(ok)
    setSubmitted(true)
    setPendingAnswer(
      JSON.stringify({ results: userResults, classification: cls })
    )
    if (ok) playCorrect()
    else playWrong()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Expression</p>
        <p className="text-xl font-semibold tracking-wide">{data.expression}</p>
        <p className="mt-1 text-sm text-muted-foreground">{question.prompt}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Mode: {mode === 'exam' ? 'Exam (fill all, then classify)' : 'Practice (cells check as you go)'}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[280px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {table.variables.map((v) => (
                <th key={v} className="px-3 py-2 text-center font-semibold">
                  {v}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-semibold">
                {data.expression}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-0">
                {table.variables.map((v) => (
                  <td key={v} className="px-3 py-2 text-center tabular-nums">
                    {row.assignments[v] ? 'T' : 'F'}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center">
                  <motion.button
                    type="button"
                    disabled={submitted}
                    animate={
                      shakeIndex === rowIndex
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.35 }}
                    onClick={() => onCellClick(rowIndex)}
                    className={cn(
                      'inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md border text-sm font-semibold',
                      userResults[rowIndex] === null &&
                        'border-dashed text-muted-foreground',
                      userResults[rowIndex] === 'T' &&
                        'border-primary bg-primary/10 text-primary',
                      userResults[rowIndex] === 'F' &&
                        'border-orange-500 bg-orange-500/10 text-orange-700',
                      submitted &&
                        userResults[rowIndex] === expected[rowIndex] &&
                        'border-green-500 bg-green-500/10',
                      submitted &&
                        userResults[rowIndex] !== expected[rowIndex] &&
                        'border-red-500 bg-red-500/10'
                    )}
                    aria-label={`Result row ${rowIndex + 1}`}
                  >
                    {userResults[rowIndex] ?? '—'}
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allFilled && !submitted ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Classify this expression:</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(['tautology', 'contradiction', 'contingency'] as const).map(
              (cls) => (
                <Button
                  key={cls}
                  type="button"
                  variant="outline"
                  className="h-11 min-h-[44px] capitalize"
                  onClick={() => finish(cls)}
                >
                  {cls}
                </Button>
              )
            )}
          </div>
        </div>
      ) : null}

      {submitted ? (
        <AnswerFeedback
          isCorrect={isCorrect}
          explanation={data.explanation || question.explanation}
          onContinue={continueToNext}
        >
          <p className="mt-1 capitalize">
            Classification: {data.classification}
          </p>
        </AnswerFeedback>
      ) : null}
    </div>
  )
}
