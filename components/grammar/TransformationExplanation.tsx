'use client'

type TransformationExplanationProps = {
  userAnswer: string
  correctAnswer: string
  patternName?: string | null
  note?: string | null
}

type DiffPart = {
  text: string
  kind: 'same' | 'removed' | 'added'
}

function wordDiff(user: string, correct: string): DiffPart[] {
  const a = user.trim().split(/\s+/).filter(Boolean)
  const b = correct.trim().split(/\s+/).filter(Boolean)
  const max = Math.max(a.length, b.length)
  const parts: DiffPart[] = []

  for (let i = 0; i < max; i += 1) {
    const left = a[i]
    const right = b[i]
    if (left && right && left.toLowerCase() === right.toLowerCase()) {
      parts.push({ text: right, kind: 'same' })
    } else {
      if (left) parts.push({ text: left, kind: 'removed' })
      if (right) parts.push({ text: right, kind: 'added' })
    }
  }

  return parts
}

/**
 * Simple word-level diff between user and correct answers.
 */
export function TransformationExplanation({
  userAnswer,
  correctAnswer,
  patternName,
  note,
}: TransformationExplanationProps) {
  const parts = wordDiff(userAnswer, correctAnswer)

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your answer → Correct answer
      </p>
      <p className="mt-2 leading-relaxed">
        {parts.map((part, i) => (
          <span
            key={`${part.kind}-${i}-${part.text}`}
            className={
              part.kind === 'removed'
                ? 'mx-0.5 rounded bg-red-500/15 px-1 text-red-700 line-through dark:text-red-400'
                : part.kind === 'added'
                  ? 'mx-0.5 rounded bg-green-500/15 px-1 font-medium text-green-700 dark:text-green-400'
                  : 'mx-0.5'
            }
          >
            {part.text}
          </span>
        ))}
      </p>
      {patternName ? (
        <p className="mt-3 text-muted-foreground">
          Pattern: <span className="font-medium text-foreground">{patternName}</span>
        </p>
      ) : null}
      {note ? <p className="mt-1 text-muted-foreground">{note}</p> : null}
    </div>
  )
}
