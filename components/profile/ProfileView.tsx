'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { StreakFlame } from '@/components/shared/StreakFlame'
import { EmptyState } from '@/components/shared/EmptyState'

/**
 * Basic profile info placeholder.
 */
export function ProfileView() {
  const { profile, loading } = useAuth()

  if (loading) return <LoadingSpinner label="Loading profile…" />

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        description="Your profile row may still be creating. Refresh in a moment."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your learning identity and progress snapshot."
      />

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xl font-semibold">
          {profile.display_name || 'Learner'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.email || (profile.is_guest ? 'Guest account' : 'No email')}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <RankBadge rank={profile.rank} size="md" />
          <StreakFlame streak={profile.current_streak} size="md" />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Total score</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {profile.total_score}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Longest streak</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {profile.longest_streak}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="mt-1 font-medium capitalize">{profile.role}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Guest</dt>
            <dd className="mt-1 font-medium">{profile.is_guest ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
