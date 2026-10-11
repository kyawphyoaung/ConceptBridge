'use client'

import { useEffect, useState } from 'react'
import { EssayFullView } from '@/components/essay/EssayFullView'
import { EssayLineView } from '@/components/essay/EssayLineView'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { getEssayWithLinesAndTerms } from '@/lib/queries/essays'
import type { Essay, EssayLine, EssayTerm } from '@/lib/types/database'

type EssayReaderViewProps = {
  essayId: string
  subjectSlug: string
  topicSlug: string
}

type ViewMode = 'full' | 'lines'
type FontSize = 'sm' | 'base' | 'lg'

const FONT_CLASS: Record<FontSize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}

/**
 * Essay reader with full / line-by-line modes + scroll progress.
 */
export function EssayReaderView({
  essayId,
  subjectSlug,
  topicSlug,
}: EssayReaderViewProps) {
  const [essay, setEssay] = useState<Essay | null>(null)
  const [lines, setLines] = useState<EssayLine[]>([])
  const [terms, setTerms] = useState<EssayTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<ViewMode>('full')
  const [showMyanmar, setShowMyanmar] = useState(true)
  const [fontSize, setFontSize] = useState<FontSize>('base')
  const [progress, setProgress] = useState(0)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const bundle = await getEssayWithLinesAndTerms(essayId)
      if (!bundle) {
        setError('Essay not found')
        return
      }
      setEssay(bundle.essay)
      setLines(bundle.lines)
      setTerms(bundle.terms)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load essay')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essayId])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return <LoadingSpinner label="Loading essay…" />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!essay) {
    return (
      <EmptyState
        iconName="BookOpen"
        title="Essay not found"
        description="This essay may have been removed."
      />
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur md:top-0 md:mx-0 md:rounded-lg md:border">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <PageHeader
        title={essay.title}
        description={
          essay.paper_code
            ? `Paper ${essay.paper_code}`
            : subjectSlug === 'philo'
              ? 'Questions & Answers'
              : 'Essay reading'
        }
        backHref={`/learn/${subjectSlug}/${topicSlug}`}
      />

      {essay.question ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Question
          </p>
          <p className="mt-1 text-base font-medium leading-relaxed">
            {essay.question}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'full' ? 'default' : 'outline'}
          className="h-10 min-h-[40px]"
          onClick={() => setMode('full')}
        >
          {!essay.content_en?.trim() && essay.content_mm?.trim()
            ? 'Full text'
            : 'Full English'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'lines' ? 'default' : 'outline'}
          className="h-10 min-h-[40px]"
          onClick={() => setMode('lines')}
        >
          Line-by-line
        </Button>
        {mode === 'lines' ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-10 min-h-[40px]"
            onClick={() => setShowMyanmar((v) => !v)}
          >
            {showMyanmar ? 'Hide Myanmar' : 'Show Myanmar'}
          </Button>
        ) : null}
        <div className="ml-auto flex gap-1">
          {(['sm', 'base', 'lg'] as const).map((size) => (
            <Button
              key={size}
              type="button"
              size="sm"
              variant={fontSize === size ? 'secondary' : 'ghost'}
              className="h-10 min-h-[40px] min-w-[40px] px-2 uppercase"
              onClick={() => setFontSize(size)}
              aria-label={`Font size ${size}`}
            >
              {size === 'sm' ? 'A-' : size === 'lg' ? 'A+' : 'A'}
            </Button>
          ))}
        </div>
      </div>

      {mode === 'full' ? (
        <EssayFullView
          essay={essay}
          terms={terms}
          fontSizeClass={FONT_CLASS[fontSize]}
        />
      ) : lines.length === 0 ? (
        <EmptyState
          iconName="BookOpen"
          title="No line translations yet"
          description="An admin can add essay lines for line-by-line mode."
        />
      ) : (
        <EssayLineView
          lines={lines}
          terms={terms}
          showMyanmar={showMyanmar}
          fontSizeClass={FONT_CLASS[fontSize]}
        />
      )}
    </div>
  )
}
