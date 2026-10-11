'use client'

import type { ReactNode } from 'react'
import { EssayTermButton } from '@/components/essay/EssayTermButton'
import type { Essay, EssayTerm } from '@/lib/types/database'

type EssayFullViewProps = {
  essay: Essay
  terms: EssayTerm[]
  fontSizeClass?: string
}

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'term'; term: EssayTerm }

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function segmentParagraph(text: string, terms: EssayTerm[]): Segment[] {
  if (terms.length === 0) return [{ kind: 'text', value: text }]

  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length)
  const pattern = sorted.map((t) => escapeRegExp(t.term)).join('|')

  if (!pattern) return [{ kind: 'text', value: text }]

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi')
  const parts: Segment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', value: text.slice(lastIndex, match.index) })
    }
    const matched = match[1]
    const term =
      sorted.find((t) => t.term.toLowerCase() === matched.toLowerCase()) ??
      sorted[0]
    parts.push({ kind: 'term', term: { ...term, term: matched } })
    lastIndex = match.index + matched.length
  }

  if (lastIndex < text.length) {
    parts.push({ kind: 'text', value: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ kind: 'text', value: text }]
}

function Body({
  text,
  terms,
  fontSizeClass,
  label,
}: {
  text: string
  terms: EssayTerm[]
  fontSizeClass: string
  label?: string
}) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
  return (
    <div className="space-y-3">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      ) : null}
      <article className={`space-y-4 leading-relaxed ${fontSizeClass}`}>
        {paragraphs.map((paragraph, pIndex) => {
          const segments = segmentParagraph(
            paragraph.replace(/\n/g, ' '),
            terms
          )
          const nodes: ReactNode[] = segments.map((seg, i) =>
            seg.kind === 'text' ? (
              <span key={`t-${pIndex}-${i}`}>{seg.value}</span>
            ) : (
              <EssayTermButton key={`term-${pIndex}-${i}`} term={seg.term} />
            )
          )
          return (
            <p key={pIndex} className="text-pretty">
              {nodes}
            </p>
          )
        })}
      </article>
    </div>
  )
}

/**
 * Full essay body — English and/or Myanmar, with clickable vocabulary terms.
 */
export function EssayFullView({
  essay,
  terms,
  fontSizeClass = 'text-base',
}: EssayFullViewProps) {
  const hasEn = Boolean(essay.content_en?.trim())
  const hasMm = Boolean(essay.content_mm?.trim())

  if (!hasEn && !hasMm) {
    return (
      <p className="text-sm text-muted-foreground">No essay content yet.</p>
    )
  }

  // Myanmar-only primary view
  if (!hasEn && hasMm && essay.content_mm) {
    return (
      <Body
        text={essay.content_mm}
        terms={terms}
        fontSizeClass={fontSizeClass}
        label="Myanmar"
      />
    )
  }

  // English (+ optional Myanmar)
  return (
    <div className="space-y-6">
      {hasEn && essay.content_en ? (
        <Body
          text={essay.content_en}
          terms={terms}
          fontSizeClass={fontSizeClass}
          label={hasMm ? 'English' : undefined}
        />
      ) : null}
      {hasMm && essay.content_mm ? (
        <Body
          text={essay.content_mm}
          terms={terms}
          fontSizeClass={fontSizeClass}
          label="Myanmar"
        />
      ) : null}
    </div>
  )
}
