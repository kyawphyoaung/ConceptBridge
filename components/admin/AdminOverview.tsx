'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { IconName } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { getAdminStats, type AdminStats } from '@/lib/queries/admin'

type AdminLink = {
  href: string
  title: string
  desc: string
  iconName: IconName
}

const QUICK_LINKS: AdminLink[] = [
  {
    href: '/admin/users',
    title: 'Users',
    desc: 'Roles, access, and activity',
    iconName: 'Users',
  },
  {
    href: '/admin/questions',
    title: 'Questions',
    desc: 'Create and edit questions',
    iconName: 'HelpCircle',
  },
  {
    href: '/admin/grammar',
    title: 'Grammar Patterns',
    desc: 'Triggers, rules, examples',
    iconName: 'BookOpen',
  },
  {
    href: '/admin/essays',
    title: 'Essays',
    desc: 'Lines, terms, paper codes',
    iconName: 'FileText',
  },
  {
    href: '/admin/import',
    title: 'Bulk Import',
    desc: 'Paste or upload JSON',
    iconName: 'Upload',
  },
  {
    href: '/admin/leaderboard',
    title: 'Leaderboard',
    desc: 'Learner rankings',
    iconName: 'Trophy',
  },
]

function getIcon(name: IconName): LucideIcon {
  return Icons[name] as LucideIcon
}

/**
 * Admin dashboard overview with stats, quick links, and recent sessions.
 */
export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setStats(await getAdminStats())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) return <LoadingSpinner label="Loading admin stats…" />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!stats) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of users, content, and recent activity."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total users" value={stats.totalUsers} />
        <Stat label="Active users" value={stats.activeUsers} />
        <Stat label="Questions" value={stats.totalQuestions} />
        <Stat label="Sessions" value={stats.totalSessions} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick links
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((link, index) => {
            const Icon = getIcon(link.iconName)
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={link.href}
                  className="flex min-h-[72px] items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors active:bg-accent"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <p className="font-semibold">{link.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {link.desc}
                    </p>
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </h2>
        {stats.recentSessions.length === 0 ? (
          <EmptyState
            iconName="Activity"
            title="No sessions yet"
            description="Learner sessions will appear here."
            className="min-h-[20dvh]"
          />
        ) : (
          <ul className="space-y-2">
            {stats.recentSessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-border bg-card p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium capitalize">
                      {session.session_mode.replace(/-/g, ' ')}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(session.started_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <p className="font-semibold">{session.score_earned} pts</p>
                    <p className="text-xs text-muted-foreground">
                      {session.correct_count}/{session.questions_completed}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
