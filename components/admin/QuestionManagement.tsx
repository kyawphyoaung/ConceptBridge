'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { QuestionFormSheet } from '@/components/admin/QuestionFormSheet'
import { QUESTION_TYPES } from '@/components/admin/questionFormUtils'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { listGrammarPatterns } from '@/lib/queries/grammar'
import {
  deleteQuestion,
  listQuestionsAdmin,
  updateQuestion,
} from '@/lib/queries/questions'
import { listSubjects, listTopicsBySubject } from '@/lib/queries/subjects'
import type {
  GrammarPattern,
  Question,
  QuestionType,
  Subject,
  Topic,
} from '@/lib/types/database'

/**
 * Admin question list with filters and CRUD sheet.
 */
export function QuestionManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [patterns, setPatterns] = useState<GrammarPattern[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [subjectId, setSubjectId] = useState<string>('__all__')
  const [topicId, setTopicId] = useState<string>('__all__')
  const [qType, setQType] = useState<string>('__all__')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
  const [acting, setActing] = useState(false)

  const topicMap = useMemo(
    () => new Map(topics.map((t) => [t.id, t])),
    [topics]
  )

  const filteredTopics = useMemo(() => {
    if (subjectId === '__all__') return topics
    return topics.filter((t) => t.subject_id === subjectId)
  }, [topics, subjectId])

  const loadMeta = async () => {
    const [subs, pats] = await Promise.all([
      listSubjects(),
      listGrammarPatterns(),
    ])
    setSubjects(subs)
    setPatterns(pats)
    const allTopics = (
      await Promise.all(subs.map((s) => listTopicsBySubject(s.id)))
    ).flat()
    setTopics(allTopics)
  }

  const loadQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await listQuestionsAdmin({
        topicId: topicId === '__all__' ? undefined : topicId,
        questionType:
          qType === '__all__' ? undefined : (qType as QuestionType),
        search: search.trim() || undefined,
        limit: 200,
      })
      const scoped =
        subjectId === '__all__'
          ? list
          : list.filter((q) => {
              const t = topicMap.get(q.topic_id)
              return t?.subject_id === subjectId
            })
      setQuestions(scoped)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadMeta()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load meta')
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (topics.length === 0 && subjects.length === 0) return
    void loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, topicId, qType, topics.length])

  const toggleActive = async (q: Question) => {
    try {
      await updateQuestion(q.id, { is_active: !q.is_active })
      toast.success(q.is_active ? 'Deactivated' : 'Activated')
      await loadQuestions()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setActing(true)
    try {
      await deleteQuestion(deleteTarget.id)
      toast.success('Question deleted')
      await loadQuestions()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActing(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Questions"
        description="Create, edit, and filter question content."
        backHref="/admin"
      />

      <Button
        type="button"
        className="h-12 min-h-[44px] w-full sm:w-auto"
        onClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
      >
        New question
      </Button>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select
          value={subjectId}
          onValueChange={(v) => {
            setSubjectId(v)
            setTopicId('__all__')
          }}
        >
          <SelectTrigger className="h-11 min-h-[44px] w-full">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={topicId} onValueChange={setTopicId}>
          <SelectTrigger className="h-11 min-h-[44px] w-full">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All topics</SelectItem>
            {filteredTopics.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={qType} onValueChange={setQType}>
          <SelectTrigger className="h-11 min-h-[44px] w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompt…"
          className="h-11 min-h-[44px] flex-1 text-base"
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 min-h-[44px]"
          onClick={() => void loadQuestions()}
        >
          Search
        </Button>
      </div>

      {loading ? <LoadingSpinner label="Loading questions…" /> : null}
      {error ? (
        <ErrorState message={error} onRetry={() => void loadQuestions()} />
      ) : null}

      {!loading && !error && questions.length === 0 ? (
        <EmptyState
          iconName="HelpCircle"
          title="No questions"
          description="Create a question or adjust filters."
        />
      ) : null}

      {!loading && !error ? (
        <ul className="space-y-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-medium leading-snug line-clamp-3">{q.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline">{q.question_type}</Badge>
                <Badge variant="secondary">
                  {topicMap.get(q.topic_id)?.name ?? 'Topic'}
                </Badge>
                <Badge variant="outline">D{q.difficulty}</Badge>
                <Badge variant={q.is_active ? 'default' : 'secondary'}>
                  {q.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 min-h-[44px]"
                  onClick={() => {
                    setEditing(q)
                    setFormOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 min-h-[44px]"
                  onClick={() => void toggleActive(q)}
                >
                  {q.is_active ? 'Off' : 'On'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 min-h-[44px]"
                  onClick={() => setDeleteTarget(q)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <QuestionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        question={editing}
        subjects={subjects}
        topics={topics}
        patterns={patterns}
        onSaved={() => void loadQuestions()}
      />

      <ConfirmAction
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete question?"
        description="This cannot be undone. Attempts linked to this question may also be removed."
        confirmLabel="Delete"
        loading={acting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
