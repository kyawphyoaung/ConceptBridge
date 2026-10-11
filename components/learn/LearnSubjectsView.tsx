'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProgressRing } from '@/components/learn/ProgressRing'
import { listSubjects } from '@/lib/queries/subjects'
import type { Subject } from '@/lib/types/database'

function resolveIcon(icon: string | null): LucideIcon {
  if (icon && icon in Icons) {
    return Icons[icon as keyof typeof Icons] as LucideIcon
  }
  return Icons.BookOpen as LucideIcon
}

/**
 * Learn subject browser with staggered cards.
 */
export function LearnSubjectsView() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setSubjects(await listSubjects())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) return <LoadingSpinner label="Loading subjects…" />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learn"
        description="Choose English or Philo Major to browse topics."
      />

      {subjects.length === 0 ? (
        <EmptyState
          iconName="Inbox"
          title="No subjects yet"
          description="Ask an admin to add English and Philo subjects."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {subjects.map((subject, index) => {
            const Icon = resolveIcon(subject.icon)
            return (
              <motion.li
                key={subject.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <Link
                  href={`/learn/${subject.slug}`}
                  className="flex min-h-[140px] items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors active:bg-accent"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold">{subject.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {subject.description || 'Browse topics for this subject.'}
                    </p>
                    <p className="mt-3 text-sm font-medium text-primary">
                      Browse topics →
                    </p>
                  </div>
                  <ProgressRing value={0} max={0} label="Topic progress" />
                </Link>
              </motion.li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
