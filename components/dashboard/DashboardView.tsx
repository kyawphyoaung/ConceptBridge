'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, RotateCcw } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { StreakFlame } from '@/components/shared/StreakFlame'
import { Button } from '@/components/ui/button'
import { getUserSessions } from '@/lib/queries/sessions'
import { getUserProgress } from '@/lib/queries/progress'
import type { Session, UserProgress } from '@/lib/types/database'

/**
 * Dashboard content (client) — uses AuthProvider + lib/queries.
 */
export function DashboardView() {
  const { user, profile, loading: authLoading, refresh } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [sessionRows, progressRows] = await Promise.all([
        getUserSessions(user.id, { limit: 5 }),
        profile?.is_guest ? Promise.resolve([]) : getUserProgress(user.id),
      ])
      setSessions(sessionRows)
      setProgress(progressRows)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading, profile?.is_guest])

  if (authLoading || loading) {
    return <LoadingSpinner label="Loading dashboard…" />
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void refresh()
          void load()
        }}
      />
    )
  }

  const name = profile?.display_name || profile?.email || 'Learner'
  const questionsAnswered = progress.reduce(
    (sum, row) => sum + row.times_attempted,
    0
  )
  const isGuest = profile?.is_guest === true

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi, ${name}!`}
        description="Keep your streak alive and review mistakes regularly."
      />

      {isGuest ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">Sign in to save your progress</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Guest sessions are temporary. Create an account to keep scores,
            streaks, and your mistake bank.
          </p>
          <Button asChild className="mt-3 h-11 min-h-[44px]">
            <Link href="/auth/sign-up">Create account</Link>
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {profile?.rank ? <RankBadge rank={profile.rank} size="md" /> : null}
        <StreakFlame streak={profile?.current_streak ?? 0} size="md" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Score" value={String(profile?.total_score ?? 0)} />
        <StatCard
          label="Current Streak"
          value={String(profile?.current_streak ?? 0)}
        />
        <StatCard label="Questions Answered" value={String(questionsAnswered)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/learn"
          className="flex min-h-[88px] items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors active:bg-accent"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold">Continue learning</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse English and Philo topics →
            </p>
          </div>
        </Link>
        <Link
          href="/learn?mode=review"
          className="flex min-h-[88px] items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors active:bg-accent"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
            <RotateCcw className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold">Review your mistakes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Practice items in your mistake bank →
            </p>
          </div>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
        {sessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Start a practice session from Learn to see activity here."
            action={
              <Button asChild className="h-11 min-h-[44px]">
                <Link href="/learn">Go to Learn</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">
                    {session.session_mode.replace('-', ' ')}
                  </span>
                  <span className="text-muted-foreground">
                    {session.correct_count}/{session.questions_completed} correct
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(session.started_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
