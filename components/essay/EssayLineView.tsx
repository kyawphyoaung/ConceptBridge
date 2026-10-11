'use client'

import { EssayTermButton } from '@/components/essay/EssayTermButton'
import type { EssayLine, EssayTerm } from '@/lib/types/database'

type EssayLineViewProps = {
  lines: EssayLine[]
  terms: EssayTerm[]
  showMyanmar: boolean
  fontSizeClass?: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderLineWithTerms(text: string, terms: EssayTerm[]) {
  if (terms.length === 0) return text

  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length)
  const pattern = sorted.map((t) => escapeRegExp(t.term)).join('|')
  if (!pattern) return text

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi')
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let i = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index))
    }
    const matched = match[1]
    const term =
      sorted.find((t) => t.term.toLowerCase() === matched.toLowerCase()) ??
      sorted[0]
    nodes.push(
      <EssayTermButton
        key={`${matched}-${i}`}
        term={{ ...term, term: matched }}
      />
    )
    i += 1
    last = match.index + matched.length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/**
 * Line-by-line essay view with optional Myanmar translations.
 */
export function EssayLineView({
  lines,
  terms,
  showMyanmar,
  fontSizeClass = 'text-base',
}: EssayLineViewProps) {
  const sorted = [...lines].sort((a, b) => a.line_number - b.line_number)

  return (
    <ol className={`space-y-4 ${fontSizeClass}`}>
      {sorted.map((line) => {
        const lineTerms = terms.filter(
          (t) =>
            t.occurrence_line === null ||
            t.occurrence_line === line.line_number
        )
        return (
          <li
            key={line.id}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-xs font-semibold text-muted-foreground">
              Line {line.line_number}
            </p>
            <p className="mt-1 leading-relaxed">
              {renderLineWithTerms(line.line_en, lineTerms)}
            </p>
            {showMyanmar && line.line_mm ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {line.line_mm}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
