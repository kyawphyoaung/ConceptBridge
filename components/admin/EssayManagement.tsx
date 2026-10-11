'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  createEssay,
  deleteEssay,
  getEssayWithLinesAndTerms,
  listEssaysAdmin,
  replaceEssayLines,
  replaceEssayTerms,
  updateEssay,
} from '@/lib/queries/essays'
import { listSubjects } from '@/lib/queries/subjects'
import type { Essay, EssayLine, EssayTerm, Subject } from '@/lib/types/database'

type LineDraft = { line_en: string; line_mm: string }
type TermDraft = {
  term: string
  definition_mm: string
  definition_en: string
}

/**
 * Admin essay CRUD with lines + terms editors.
 */
export function EssayManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Essay | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Essay | null>(null)
  const [saving, setSaving] = useState(false)

  const [subjectId, setSubjectId] = useState('')
  const [paperCode, setPaperCode] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [lines, setLines] = useState<LineDraft[]>([])
  const [terms, setTerms] = useState<TermDraft[]>([])

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  )

  const grouped = useMemo(() => {
    return subjects
      .map((s) => ({
        subject: s,
        essays: essays.filter((e) => e.subject_id === s.id),
      }))
      .filter((g) => g.essays.length > 0)
  }, [subjects, essays])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const subs = await listSubjects()
      setSubjects(subs)
      setEssays(await listEssaysAdmin())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load essays')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setSubjectId(subjects[0]?.id ?? '')
    setPaperCode('')
    setTitle('')
    setContent('')
    setDisplayOrder(0)
    setIsActive(true)
    setLines([])
    setTerms([])
    setOpen(true)
  }

  const openEdit = async (essay: Essay) => {
    setEditing(essay)
    setSubjectId(essay.subject_id)
    setPaperCode(essay.paper_code ?? '')
    setTitle(essay.title)
    setContent(essay.content_en ?? essay.content_mm ?? '')
    setDisplayOrder(essay.display_order)
    setIsActive(essay.is_active)
    setOpen(true)
    try {
      const bundle = await getEssayWithLinesAndTerms(essay.id)
      if (bundle) {
        setLines(
          bundle.lines.map((l: EssayLine) => ({
            line_en: l.line_en,
            line_mm: l.line_mm ?? '',
          }))
        )
        setTerms(
          bundle.terms.map((t: EssayTerm) => ({
            term: t.term,
            definition_mm: t.definition_mm ?? '',
            definition_en: t.definition_en ?? '',
          }))
        )
      }
    } catch {
      toast.error('Could not load lines/terms')
    }
  }

  const autoLines = () => {
    const parts = content
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) {
      toast.error('Add content first')
      return
    }
    setLines(parts.map((line_en) => ({ line_en, line_mm: '' })))
    toast.success(`Generated ${parts.length} lines`)
  }

  const autoTerms = () => {
    const words = content
      .toLowerCase()
      .replace(/[^a-z\s'-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 8)
    const unique = Array.from(new Set(words)).slice(0, 12)
    if (unique.length === 0) {
      toast.error('No long words detected')
      return
    }
    setTerms((prev) => {
      const existing = new Set(prev.map((t) => t.term.toLowerCase()))
      const added = unique
        .filter((w) => !existing.has(w))
        .map((term) => ({
          term,
          definition_mm: '',
          definition_en: '',
        }))
      return [...prev, ...added]
    })
    toast.success('Suggested terms added')
  }

  const save = async () => {
    if (!subjectId || !title.trim() || !content.trim()) {
      toast.error('Subject, title, and content are required')
      return
    }
    setSaving(true)
    try {
      let essayId = editing?.id
      if (editing) {
        await updateEssay(editing.id, {
          subject_id: subjectId,
          paper_code: paperCode.trim() || null,
          title: title.trim(),
          content_en: content,
          display_order: displayOrder,
          is_active: isActive,
        })
      } else {
        const created = await createEssay({
          subject_id: subjectId,
          paper_code: paperCode.trim() || null,
          title: title.trim(),
          content_en: content,
          display_order: displayOrder,
          is_active: isActive,
        })
        essayId = created.id
      }
      if (!essayId) throw new Error('Missing essay id')
      await replaceEssayLines(
        essayId,
        lines.map((l, i) => ({
          line_number: i + 1,
          line_en: l.line_en,
          line_mm: l.line_mm || null,
        }))
      )
      await replaceEssayTerms(
        essayId,
        terms
          .filter((t) => t.term.trim())
          .map((t) => ({
            term: t.term.trim(),
            definition_mm: t.definition_mm || null,
            definition_en: t.definition_en || null,
            occurrence_line: null,
          }))
      )
      toast.success('Essay saved')
      setOpen(false)
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteEssay(deleteTarget.id)
      toast.success('Essay deleted')
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
      setDeleteTarget(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading essays…" />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Essays"
        description="Manage essays, lines, and vocabulary terms."
        backHref="/admin"
      />

      <Button
        type="button"
        className="h-12 min-h-[44px] w-full sm:w-auto"
        onClick={openCreate}
      >
        New essay
      </Button>

      {essays.length === 0 ? (
        <EmptyState
          iconName="FileText"
          title="No essays yet"
          description="Create an English or Philo essay."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ subject, essays: list }) => (
            <section key={subject.id}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {subject.name}
              </h2>
              <ul className="space-y-3">
                {list.map((essay) => (
                  <li
                    key={essay.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <p className="font-semibold">{essay.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {essay.paper_code ? (
                        <Badge variant="outline">{essay.paper_code}</Badge>
                      ) : null}
                      <Badge variant={essay.is_active ? 'default' : 'secondary'}>
                        {essay.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 min-h-[44px]"
                        onClick={() => void openEdit(essay)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-11 min-h-[44px]"
                        onClick={() => setDeleteTarget(essay)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {essays.some((e) => !subjectMap.has(e.subject_id)) ? (
            <p className="text-xs text-muted-foreground">
              Some essays belong to inactive subjects.
            </p>
          ) : null}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>{editing ? 'Edit essay' : 'New essay'}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 px-1">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Paper code</Label>
                <Input
                  value={paperCode}
                  onChange={(e) => setPaperCode(e.target.value)}
                  className="h-11 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="h-11 w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content (English)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-40 w-full text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={autoLines}>
                Auto-generate lines
              </Button>
              <Button type="button" variant="outline" onClick={autoTerms}>
                Suggest terms
              </Button>
              <Button
                type="button"
                variant={isActive ? 'default' : 'secondary'}
                onClick={() => setIsActive((v) => !v)}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Button>
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Lines ({lines.length})</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLines((prev) => [...prev, { line_en: '', line_mm: '' }])
                  }
                >
                  Add line
                </Button>
              </div>
              {lines.map((line, i) => (
                <div key={i} className="space-y-1 rounded-lg border p-2">
                  <Input
                    value={line.line_en}
                    placeholder={`EN line ${i + 1}`}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, idx) =>
                          idx === i ? { ...l, line_en: e.target.value } : l
                        )
                      )
                    }
                    className="h-10"
                  />
                  <Input
                    value={line.line_mm}
                    placeholder="MM translation"
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, idx) =>
                          idx === i ? { ...l, line_mm: e.target.value } : l
                        )
                      )
                    }
                    className="h-10"
                  />
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Terms ({terms.length})</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setTerms((prev) => [
                      ...prev,
                      { term: '', definition_mm: '', definition_en: '' },
                    ])
                  }
                >
                  Add term
                </Button>
              </div>
              {terms.map((term, i) => (
                <div key={i} className="space-y-1 rounded-lg border p-2">
                  <Input
                    value={term.term}
                    placeholder="Term"
                    onChange={(e) =>
                      setTerms((prev) =>
                        prev.map((t, idx) =>
                          idx === i ? { ...t, term: e.target.value } : t
                        )
                      )
                    }
                    className="h-10"
                  />
                  <Input
                    value={term.definition_en}
                    placeholder="Definition (EN)"
                    onChange={(e) =>
                      setTerms((prev) =>
                        prev.map((t, idx) =>
                          idx === i
                            ? { ...t, definition_en: e.target.value }
                            : t
                        )
                      )
                    }
                    className="h-10"
                  />
                  <Input
                    value={term.definition_mm}
                    placeholder="Definition (MM)"
                    onChange={(e) =>
                      setTerms((prev) =>
                        prev.map((t, idx) =>
                          idx === i
                            ? { ...t, definition_mm: e.target.value }
                            : t
                        )
                      )
                    }
                    className="h-10"
                  />
                </div>
              ))}
            </section>

            <Button
              type="button"
              className="h-12 min-h-[44px] w-full"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? 'Saving…' : 'Save essay'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmAction
        open={deleteTarget !== null}
        onOpenChange={(openState) => {
          if (!openState) setDeleteTarget(null)
        }}
        title="Delete essay?"
        description="Lines and terms will be deleted too."
        confirmLabel="Delete"
        loading={saving}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
