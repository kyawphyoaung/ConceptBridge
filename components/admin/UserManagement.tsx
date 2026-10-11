'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { UserDetailSheet } from '@/components/admin/UserDetailSheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  listAllUsersWithStats,
  type UserWithStats,
} from '@/lib/queries/admin'
import { setUserActive, setUserRole } from '@/lib/queries/profiles'
import type { Role } from '@/lib/types/database'

type FilterKey = 'all' | 'active' | 'inactive' | 'guests' | 'admins'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'guests', label: 'Guests' },
  { key: 'admins', label: 'Admins' },
]

type PendingAction =
  | { type: 'active'; user: UserWithStats; next: boolean }
  | { type: 'role'; user: UserWithStats; next: Role }
  | null

/**
 * Admin user management: filters, search, role/active toggles, detail sheet.
 */
export function UserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)
  const [acting, setActing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await listAllUsersWithStats())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const p = u.profile
      if (filter === 'active' && !p.is_active) return false
      if (filter === 'inactive' && p.is_active) return false
      if (filter === 'guests' && !p.is_guest) return false
      if (filter === 'admins' && p.role !== 'admin') return false
      if (!q) return true
      const email = (p.email ?? '').toLowerCase()
      const name = (p.display_name ?? '').toLowerCase()
      return email.includes(q) || name.includes(q)
    })
  }, [users, filter, search])

  const runPending = async () => {
    if (!pending) return
    setActing(true)
    try {
      if (pending.type === 'active') {
        await setUserActive(pending.user.profile.id, pending.next)
        toast.success(
          pending.next ? 'User reactivated' : 'User deactivated'
        )
      } else {
        await setUserRole(pending.user.profile.id, pending.next)
        toast.success(
          pending.next === 'admin' ? 'Promoted to admin' : 'Demoted to user'
        )
      }
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActing(false)
      setPending(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading users…" />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Manage access, roles, and activity."
        backHref="/admin"
      />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search email or name…"
        className="h-11 min-h-[44px] w-full"
        aria-label="Search users"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            type="button"
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            className="h-10 min-h-[40px] shrink-0"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          iconName="Users"
          title="No users found"
          description="Try a different filter or search."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((u) => {
            const p = u.profile
            return (
              <li
                key={p.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {p.display_name || 'Unnamed'}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.email || 'No email'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={p.is_active ? 'default' : 'secondary'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{p.role}</Badge>
                    {p.is_guest ? (
                      <Badge variant="secondary">Guest</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <RankBadge rank={p.rank} size="sm" />
                  <span className="tabular-nums text-muted-foreground">
                    {p.total_score} pts · streak {p.current_streak} ·{' '}
                    {u.sessionCount} sessions
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last active{' '}
                  {p.last_active_at
                    ? new Date(p.last_active_at).toLocaleString()
                    : '—'}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-h-[44px]"
                    onClick={() => setDetailId(p.id)}
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-h-[44px]"
                    onClick={() =>
                      setPending({
                        type: 'active',
                        user: u,
                        next: !p.is_active,
                      })
                    }
                  >
                    {p.is_active ? 'Deactivate' : 'Reactivate'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="col-span-2 h-11 min-h-[44px] sm:col-span-2"
                    onClick={() =>
                      setPending({
                        type: 'role',
                        user: u,
                        next: p.role === 'admin' ? 'user' : 'admin',
                      })
                    }
                  >
                    {p.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <UserDetailSheet
        userId={detailId}
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      />

      <ConfirmAction
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title={
          pending?.type === 'active'
            ? pending.next
              ? 'Reactivate user?'
              : 'Deactivate user?'
            : pending?.next === 'admin'
              ? 'Promote to admin?'
              : 'Demote to user?'
        }
        description={
          pending
            ? `${pending.user.profile.display_name || pending.user.profile.email || 'This user'} will be updated.`
            : ''
        }
        confirmLabel="Confirm"
        loading={acting}
        onConfirm={runPending}
      />
    </div>
  )
}
