'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProgressRing } from '@/components/learn/ProgressRing'
import { Button } from '@/components/ui/button'
import { countQuestionsByTopic } from '@/lib/queries/questions'
import { getSubjectWithTopics } from '@/lib/queries/subjects'
import type { Subject, Topic, TopicType } from '@/lib/types/database'

type SubjectTopicsViewProps = {
  slug: string
}

const GROUP_ORDER: Array<{ key: string; types: TopicType[]; label: string }> = [
  { key: 'flashcards', types: ['flashcard'], label: 'Flashcards' },
  { key: 'grammar', types: ['sentence-transform'], label: 'Grammar' },
  { key: 'mcqs', types: ['mcq'], label: 'MCQs' },
  { key: 'essays', types: ['essay'], label: 'Essays' },
  {
    key: 'logic',
    types: ['truth-table', 'quantification', 'drag-drop'],
    label: 'Logic',
  },
]

type PaperGroup = {
  groupSlug: string
  groupName: string
  groupSubtitle: string
  groupOrder: number
  topics: Topic[]
}

/**
 * Subject detail: English topics by type; Philo topics by paper group.
 */
export function SubjectTopicsView({ slug }: SubjectTopicsViewProps) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    setMissing(false)
    try {
      const result = await getSubjectWithTopics(slug)
      if (!result) {
        setMissing(true)
        return
      }
      setSubject(result.subject)
      setTopics(result.topics)

      const entries = await Promise.all(
        result.topics.map(async (topic) => {
          const count = await countQuestionsByTopic(topic.id)
          return [topic.id, count] as const
        })
      )
      setCounts(Object.fromEntries(entries))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subject')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const typeGroups = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      ...group,
      topics: topics.filter((t) => group.types.includes(t.topic_type)),
    })).filter((g) => g.topics.length > 0)
  }, [topics])

  const paperGroups = useMemo((): PaperGroup[] => {
    const map = new Map<string, PaperGroup>()
    for (const topic of topics) {
      const groupSlug = topic.group_slug
      if (!groupSlug) continue
      const existing = map.get(groupSlug)
      if (existing) {
        existing.topics.push(topic)
        continue
      }
      map.set(groupSlug, {
        groupSlug,
        groupName: topic.group_name ?? groupSlug,
        groupSubtitle: topic.group_subtitle ?? '',
        groupOrder: topic.group_order ?? topic.display_order,
        topics: [topic],
      })
    }
    return Array.from(map.values()).sort((a, b) => a.groupOrder - b.groupOrder)
  }, [topics])

  if (loading) return <LoadingSpinner label="Loading topics…" />
  if (missing) notFound()
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!subject) return null

  const isPhilo = subject.slug === 'philo'

  return (
    <div className="space-y-6">
      <PageHeader
        title={subject.name}
        description={subject.description ?? undefined}
        backHref="/learn"
      />

      {topics.length === 0 ? (
        <EmptyState
          iconName="BookOpen"
          title="No topics yet"
          description="This subject has no active topics."
        />
      ) : isPhilo ? (
        <ul className="space-y-3">
          {paperGroups.map((group, index) => (
            <motion.li
              key={group.groupSlug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <h2 className="text-lg font-semibold leading-snug">
                {group.groupName}
              </h2>
              {group.groupSubtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {group.groupSubtitle}
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.groupSlug === 'logic' ? (
                  <>
                    <PaperModeButton
                      subjectSlug={subject.slug}
                      topic={group.topics.find(
                        (t) => t.mode === 'logic-truth-table'
                      )}
                      label="Truth Tables"
                      count={
                        counts[
                          group.topics.find(
                            (t) => t.mode === 'logic-truth-table'
                          )?.id ?? ''
                        ]
                      }
                    />
                    <PaperModeButton
                      subjectSlug={subject.slug}
                      topic={group.topics.find(
                        (t) => t.mode === 'logic-quantification'
                      )}
                      label="Quantification"
                      count={
                        counts[
                          group.topics.find(
                            (t) => t.mode === 'logic-quantification'
                          )?.id ?? ''
                        ]
                      }
                    />
                  </>
                ) : (
                  <>
                    <PaperModeButton
                      subjectSlug={subject.slug}
                      topic={group.topics.find((t) => t.mode === 'mcq')}
                      label="MCQs"
                      count={
                        counts[
                          group.topics.find((t) => t.mode === 'mcq')?.id ?? ''
                        ]
                      }
                    />
                    <PaperModeButton
                      subjectSlug={subject.slug}
                      topic={group.topics.find((t) => t.mode === 'qa')}
                      label="Questions & Answers"
                      count={
                        counts[
                          group.topics.find((t) => t.mode === 'qa')?.id ?? ''
                        ]
                      }
                    />
                  </>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="space-y-8">
          {typeGroups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.topics.map((topic, index) => (
                  <motion.li
                    key={topic.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/learn/${subject.slug}/${topic.slug}`}
                      className="flex min-h-[96px] items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors active:bg-accent"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{topic.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {topic.description || 'Open topic to start practicing.'}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {counts[topic.id] ?? 0} questions
                        </p>
                      </div>
                      <ProgressRing value={0} max={0} size={44} />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function PaperModeButton({
  subjectSlug,
  topic,
  label,
  count,
}: {
  subjectSlug: string
  topic: Topic | undefined
  label: string
  count: number | undefined
}) {
  if (!topic) {
    return (
      <Button variant="outline" className="h-12 min-h-[44px] w-full" disabled>
        {label}
      </Button>
    )
  }

  return (
    <Button asChild variant="outline" className="h-12 min-h-[44px] w-full">
      <Link href={`/learn/${subjectSlug}/${topic.slug}`}>
        <span className="flex w-full items-center justify-between gap-2">
          <span>{label}</span>
          <span className="text-xs text-muted-foreground">
            {count ?? 0}
          </span>
        </span>
      </Link>
    </Button>
  )
}
