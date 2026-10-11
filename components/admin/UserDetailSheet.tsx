'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { RankBadge } from '@/components/shared/RankBadge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getUserDetail, type UserDetail } from '@/lib/queries/admin'

type UserDetailSheetProps = {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Admin user detail: session history + progress summary.
 */
export function UserDetailSheet({
  userId,
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !userId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getUserDetail(userId)
        if (!cancelled) setDetail(data)
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load user')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [open, userId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:side-right md:max-h-none md:rounded-none"
      >
        <SheetHeader>
          <SheetTitle>User detail</SheetTitle>
        </SheetHeader>

        {loading ? <LoadingSpinner label="Loading user…" /> : null}
        {error ? (
          <ErrorState message={error} className="min-h-[20dvh]" />
        ) : null}

        {!loading && !error && detail ? (
          <div className="mt-4 space-y-4 px-1">
            <div>
              <p className="text-lg font-semibold">
                {detail.profile.display_name || 'Unnamed'}
              </p>
              <p className="text-sm text-muted-foreground">
                {detail.profile.email || 'No email'}
              </p>
              <div className="mt-2">
                <RankBadge rank={detail.profile.rank} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <Summary
                label="Mastered"
                value={detail.progressSummary.mastered}
              />
              <Summary
                label="Learning"
                value={detail.progressSummary.learning}
              />
              <Summary
                label="Mistakes"
                value={detail.progressSummary.mistakeBank}
              />
            </div>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Recent sessions</h3>
              {detail.recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.recentSessions.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <p className="font-medium capitalize">
                        {s.session_mode.replace(/-/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.started_at).toLocaleString()} ·{' '}
                        {s.score_earned} pts · {s.correct_count}/
                        {s.questions_completed}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  )
}
