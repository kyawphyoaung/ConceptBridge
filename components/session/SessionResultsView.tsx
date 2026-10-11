'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { Button } from '@/components/ui/button'
import { listAttemptsForSession } from '@/lib/queries/attempts'
import { getSessionById } from '@/lib/queries/sessions'
import type { QuizAttempt, Session } from '@/lib/types/database'

type SessionResultsViewProps = {
  topicSlug: string
}

/**
 * Session results with score animation and next actions.
 */
export function SessionResultsView({ topicSlug }: SessionResultsViewProps) {
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const sessionId = searchParams.get('sessionId')
  const guestCorrect = Number(searchParams.get('correct') ?? '0')
  const guestCompleted = Number(searchParams.get('completed') ?? '0')
  const guestScore = Number(searchParams.get('score') ?? '0')
  const isGuestResult = searchParams.get('guest') === '1'

  const [session, setSession] = useState<Session | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState<string | null>(null)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [s, a] = await Promise.all([
          getSessionById(sessionId),
          listAttemptsForSession(sessionId),
        ])
        setSession(s)
        setAttempts(a)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [sessionId])

  const stats = useMemo(() => {
    if (session) {
      return {
        correct: session.correct_count,
        completed: session.questions_completed,
        score: session.score_earned,
      }
    }
    return {
      correct: guestCorrect,
      completed: guestCompleted,
      score: guestScore,
    }
  }, [session, guestCorrect, guestCompleted, guestScore])

  const accuracy =
    stats.completed > 0
      ? Math.round((stats.correct / stats.completed) * 100)
      : 0

  const mistakeCount = attempts.filter((a) => !a.is_correct).length

  useEffect(() => {
    let frame = 0
    const target = stats.score
    const start = performance.now()
    const duration = 800

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setDisplayScore(Math.round(target * t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [stats.score])

  if (loading) return <LoadingSpinner label="Loading results…" />
  if (error) return <ErrorState message={error} />

  if (!sessionId && !isGuestResult) {
    return (
      <EmptyState
        iconName="Trophy"
        title="No session found"
        description="Start a practice session to see results here."
      />
    )
  }

  return (
    <div className="relative mx-auto max-w-lg space-y-6 overflow-hidden">
      {accuracy >= 80 ? <CelebrationBurst /> : null}

      <PageHeader
        title="Session results"
        description="Nice work — review your score and next steps."
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl border border-border bg-card p-6 text-center"
      >
        <p className="text-sm text-muted-foreground">Score earned</p>
        <p className="mt-1 text-5xl font-bold tabular-nums text-primary">
          {displayScore}
        </p>
        <p className="mt-3 text-sm">
          {stats.correct} / {stats.completed} correct · {accuracy}% accuracy
        </p>
        {profile?.rank ? (
          <div className="mt-4 flex justify-center">
            <RankBadge rank={profile.rank} size="md" />
          </div>
        ) : null}
      </motion.div>

      <div className="flex flex-col gap-3">
        {mistakeCount > 0 || (!sessionId && stats.correct < stats.completed) ? (
          <Button asChild className="h-12 min-h-[44px] w-full">
            <Link href={`/session/${topicSlug}?mode=review-mistakes&count=10`}>
              Review mistakes
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" className="h-12 min-h-[44px] w-full">
          <Link href={`/session/${topicSlug}?mode=practice&count=10`}>
            Try again
          </Link>
        </Button>
        <Button asChild variant="ghost" className="h-12 min-h-[44px] w-full">
          <Link href={`/learn`}>Back to Learn</Link>
        </Button>
      </div>
    </div>
  )
}

function CelebrationBurst() {
  const pieces = Array.from({ length: 14 }, (_, i) => i)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-full bg-primary"
          style={{ left: `${8 + (i * 6) % 84}%` }}
          initial={{ y: -10, opacity: 1, scale: 1 }}
          animate={{ y: 140, opacity: 0, rotate: 180 }}
          transition={{
            duration: 1.4 + (i % 5) * 0.1,
            delay: i * 0.04,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
