'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { listEssaysBySubject } from '@/lib/queries/essays'
import { getGrammarPatternBySlug } from '@/lib/queries/grammar'
import { countQuestionsByTopic } from '@/lib/queries/questions'
import { getMistakeBank, getUserProgress } from '@/lib/queries/progress'
import { getSubjectBySlug, getTopicBySlug } from '@/lib/queries/subjects'
import type { Essay, GrammarPattern, Topic, UserProgress } from '@/lib/types/database'

type TopicDetailViewProps = {
  subjectSlug: string
  topicSlug: string
}

/**
 * Topic detail with practice / review / quiz entry points.
 */
export function TopicDetailView({
  subjectSlug,
  topicSlug,
}: TopicDetailViewProps) {
  const { user, profile, loading: authLoading } = useAuth()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [pattern, setPattern] = useState<GrammarPattern | null>(null)
  const [essays, setEssays] = useState<Essay[]>([])
  const [questionCount, setQuestionCount] = useState(0)
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [hasMistakes, setHasMistakes] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    setMissing(false)
    try {
      const subject = await getSubjectBySlug(subjectSlug)
      if (!subject) {
        setMissing(true)
        return
      }
      const nextTopic = await getTopicBySlug(subject.id, topicSlug)
      if (!nextTopic) {
        setMissing(true)
        return
      }
      setTopic(nextTopic)

      const count = await countQuestionsByTopic(nextTopic.id)
      setQuestionCount(count)

      if (nextTopic.topic_type === 'sentence-transform') {
        const bySlug = nextTopic.slug.replace(/^grammar-/, '')
        setPattern(await getGrammarPatternBySlug(bySlug))
      } else {
        setPattern(null)
      }

      if (nextTopic.topic_type === 'essay') {
        setEssays(await listEssaysBySubject(subject.id))
      } else {
        setEssays([])
      }

      if (user && profile && !profile.is_guest) {
        const [allProgress, mistakes] = await Promise.all([
          getUserProgress(user.id),
          getMistakeBank(user.id),
        ])
        setProgress(allProgress)
        setHasMistakes(mistakes.length > 0)
      } else {
        setProgress([])
        setHasMistakes(false)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectSlug, topicSlug, user?.id, authLoading, profile?.is_guest])

  if (authLoading || loading) return <LoadingSpinner label="Loading topic…" />
  if (missing) notFound()
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!topic) return null

  const attempted = progress.reduce((s, p) => s + p.times_attempted, 0)
  const correct = progress.reduce((s, p) => s + p.times_correct, 0)
  const mastered = progress.filter((p) => p.mastery_level === 3).length
  const learning = progress.filter((p) => p.mastery_level === 1).length
  const isGuest = profile?.is_guest === true

  const sessionBase = `/session/${topic.slug}`
  const isPhilo = subjectSlug === 'philo'
  const essayListLabel = isPhilo ? 'Questions & Answers' : 'Essays'
  const essayEmptyTitle = isPhilo
    ? 'No questions & answers yet'
    : 'No essays yet'
  const essayEmptyDescription = isPhilo
    ? 'An admin can add questions & answers for this paper.'
    : 'An admin can add essays for this subject.'
  const essayOpenLabel = isPhilo ? 'Open →' : 'Read essay →'

  return (
    <div className="space-y-6">
      <PageHeader
        title={topic.name}
        description={topic.description ?? undefined}
        backHref={`/learn/${subjectSlug}`}
      />

      {isGuest ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          Guest mode — practice freely, but progress is not saved.{' '}
          <Link href="/auth/sign-up" className="font-medium text-primary underline">
            Sign up to save
          </Link>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Total questions</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{questionCount}</p>
      </div>

      {pattern ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Learn pattern
          </p>
          <h2 className="mt-1 text-lg font-semibold">{pattern.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {pattern.explanation_en || pattern.explanation_mm || 'Study this pattern before practicing.'}
          </p>
          {pattern.trigger_words.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {pattern.trigger_words.map((word) => (
                <span
                  key={word}
                  className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : null}
          {pattern.examples.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {pattern.examples.slice(0, 2).map((ex, i) => (
                <li key={i} className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">{ex.from}</p>
                  <p className="font-medium">→ {ex.to}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {topic.topic_type === 'essay' ? (
        essays.length === 0 ? (
          <EmptyState
            iconName="BookOpen"
            title={essayEmptyTitle}
            description={essayEmptyDescription}
          />
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {essayListLabel}
            </h2>
            <ul className="space-y-3">
              {essays.map((essay) => (
                <li key={essay.id}>
                  <Link
                    href={`/learn/${subjectSlug}/${topicSlug}/essay/${essay.id}`}
                    className="flex min-h-[72px] flex-col rounded-xl border border-border bg-card p-4 transition-colors active:bg-accent"
                  >
                    <p className="font-semibold">{essay.title}</p>
                    {essay.paper_code ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Paper {essay.paper_code}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-primary">{essayOpenLabel}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : topic.slug === 'idioms' ? (
        <div className="flex flex-col gap-3">
          <Button asChild className="h-12 min-h-[44px] w-full" disabled={questionCount === 0}>
            <Link href={`${sessionBase}?mode=practice&format=mcq&count=10`}>
              MCQ practice
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 min-h-[44px] w-full"
            disabled={questionCount === 0}
          >
            <Link href={`${sessionBase}?mode=practice&format=sentence&count=10`}>
              Sentence practice
            </Link>
          </Button>
          {hasMistakes && !isGuest ? (
            <Button asChild variant="secondary" className="h-12 min-h-[44px] w-full">
              <Link href={`${sessionBase}?mode=review-mistakes&format=sentence&count=10`}>
                Review mistakes only
              </Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button asChild className="h-12 min-h-[44px] w-full" disabled={questionCount === 0}>
            <Link href={`${sessionBase}?mode=practice&count=10`}>
              Start practice (10)
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 min-h-[44px] w-full"
            disabled={questionCount === 0}
          >
            <Link
              href={
                topic.topic_type === 'flashcard'
                  ? `${sessionBase}?mode=quiz&count=20`
                  : `${sessionBase}?mode=practice&count=20`
              }
            >
              Quick quiz (20 questions)
            </Link>
          </Button>
          {hasMistakes && !isGuest ? (
            <Button asChild variant="secondary" className="h-12 min-h-[44px] w-full">
              <Link href={`${sessionBase}?mode=review-mistakes&count=10`}>
                Review mistakes only
              </Link>
            </Button>
          ) : null}
        </div>
      )}

      {questionCount === 0 ? (
        <EmptyState
          iconName="Inbox"
          title="No questions yet"
          description="An admin needs to add questions for this topic."
        />
      ) : null}

      {!isGuest && user ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold">Your stats</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Attempted" value={attempted} />
            <Stat label="Correct" value={correct} />
            <Stat label="Learning" value={learning} />
            <Stat label="Mastered" value={mastered} />
          </dl>
        </section>
      ) : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
