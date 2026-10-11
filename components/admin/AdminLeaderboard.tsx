'use client'

import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { StreakFlame } from '@/components/shared/StreakFlame'
import { Button } from '@/components/ui/button'
import {
  getLeaderboard,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from '@/lib/queries/leaderboard'

const PERIODS: Array<{ key: LeaderboardPeriod; label: string }> = [
  { key: 'all', label: 'All time' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
]

/**
 * Admin leaderboard with period filter.
 */
export function AdminLeaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('all')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await getLeaderboard({ limit: 50, period }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Leaderboard"
        description="Learner rankings by score / activity."
        backHref="/admin"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <Button
            key={p.key}
            type="button"
            size="sm"
            variant={period === p.key ? 'default' : 'outline'}
            className="h-10 min-h-[40px] shrink-0"
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {loading ? <LoadingSpinner label="Loading leaderboard…" /> : null}
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {!loading && !error && entries.length === 0 ? (
        <EmptyState
          iconName="Trophy"
          title="No rankings yet"
          description="Scores appear after learners practice."
        />
      ) : null}

      {!loading && !error ? (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.profile.id}
              className="flex min-h-[64px] items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="w-8 shrink-0 text-center text-lg font-bold tabular-nums text-muted-foreground">
                {entry.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {entry.profile.display_name || 'Learner'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <RankBadge rank={entry.profile.rank} size="sm" />
                  <StreakFlame streak={entry.profile.current_streak} size="sm" />
                </div>
              </div>
              <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
                {entry.profile.total_score}
                <span className="block text-xs font-normal text-muted-foreground">
                  pts
                </span>
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
