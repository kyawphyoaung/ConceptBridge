'use client'

import { useEffect, useState } from 'react'
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
  createGrammarPattern,
  deleteGrammarPattern,
  listGrammarPatterns,
  updateGrammarPattern,
} from '@/lib/queries/grammar'
import type {
  GrammarCategory,
  GrammarExample,
  GrammarPattern,
} from '@/lib/types/database'

const CATEGORIES: GrammarCategory[] = [
  'modal',
  'tense',
  'causative',
  'wish',
  'third-person',
  'interrogative',
  'deduction',
]

type ExampleDraft = { from: string; to: string; note: string }

/**
 * Admin grammar pattern CRUD.
 */
export function GrammarManagement() {
  const [patterns, setPatterns] = useState<GrammarPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GrammarPattern | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GrammarPattern | null>(null)
  const [saving, setSaving] = useState(false)

  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<GrammarCategory>('modal')
  const [triggers, setTriggers] = useState('')
  const [auxiliary, setAuxiliary] = useState('')
  const [explanationEn, setExplanationEn] = useState('')
  const [explanationMm, setExplanationMm] = useState('')
  const [examples, setExamples] = useState<ExampleDraft[]>([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setPatterns(await listGrammarPatterns())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load patterns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setSlug('')
    setName('')
    setCategory('modal')
    setTriggers('')
    setAuxiliary('')
    setExplanationEn('')
    setExplanationMm('')
    setExamples([{ from: '', to: '', note: '' }])
    setOpen(true)
  }

  const openEdit = (p: GrammarPattern) => {
    setEditing(p)
    setSlug(p.slug)
    setName(p.name)
    setCategory(p.category)
    setTriggers(p.trigger_words.join(', '))
    setAuxiliary(p.target_auxiliary ?? '')
    setExplanationEn(p.explanation_en ?? '')
    setExplanationMm(p.explanation_mm ?? '')
    setExamples(
      p.examples.length > 0
        ? p.examples.map((e: GrammarExample) => ({
            from: e.from,
            to: e.to,
            note: e.note,
          }))
        : [{ from: '', to: '', note: '' }]
    )
    setOpen(true)
  }

  const save = async () => {
    if (!slug.trim() || !name.trim()) {
      toast.error('Slug and name are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        slug: slug.trim(),
        name: name.trim(),
        category,
        trigger_words: triggers
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        target_auxiliary: auxiliary.trim() || null,
        explanation_en: explanationEn.trim() || null,
        explanation_mm: explanationMm.trim() || null,
        examples: examples
          .filter((e) => e.from.trim() && e.to.trim())
          .map((e) => ({
            from: e.from.trim(),
            to: e.to.trim(),
            note: e.note.trim(),
          })),
      }
      if (editing) {
        await updateGrammarPattern(editing.id, payload)
        toast.success('Pattern updated')
      } else {
        await createGrammarPattern(payload)
        toast.success('Pattern created')
      }
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
      await deleteGrammarPattern(deleteTarget.id)
      toast.success('Pattern deleted')
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
      setDeleteTarget(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading patterns…" />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Grammar Patterns"
        description="Manage trigger words, auxiliaries, and examples."
        backHref="/admin"
      />

      <Button
        type="button"
        className="h-12 min-h-[44px] w-full sm:w-auto"
        onClick={openCreate}
      >
        New pattern
      </Button>

      {patterns.length === 0 ? (
        <EmptyState
          iconName="BookOpen"
          title="No patterns"
          description="Create a grammar pattern to get started."
        />
      ) : (
        <ul className="space-y-3">
          {patterns.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-semibold">{p.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline">{p.category}</Badge>
                {p.target_auxiliary ? (
                  <Badge variant="secondary">{p.target_auxiliary}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {p.trigger_words.join(', ') || 'No trigger words'}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 min-h-[44px]"
                  onClick={() => openEdit(p)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 min-h-[44px]"
                  onClick={() => setDeleteTarget(p)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>{editing ? 'Edit pattern' : 'New pattern'}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 px-1">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-11 w-full"
                disabled={!!editing}
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as GrammarCategory)}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trigger words (comma-separated)</Label>
              <Input
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                className="h-11 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Target auxiliary</Label>
              <Input
                value={auxiliary}
                onChange={(e) => setAuxiliary(e.target.value)}
                className="h-11 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation (EN)</Label>
              <Textarea
                value={explanationEn}
                onChange={(e) => setExplanationEn(e.target.value)}
                className="min-h-20 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation (MM)</Label>
              <Textarea
                value={explanationMm}
                onChange={(e) => setExplanationMm(e.target.value)}
                className="min-h-20 w-full"
              />
            </div>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Examples</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setExamples((prev) => [
                      ...prev,
                      { from: '', to: '', note: '' },
                    ])
                  }
                >
                  Add
                </Button>
              </div>
              {examples.map((ex, i) => (
                <div key={i} className="space-y-1 rounded-lg border p-2">
                  <Input
                    value={ex.from}
                    placeholder="From"
                    onChange={(e) =>
                      setExamples((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, from: e.target.value } : x
                        )
                      )
                    }
                    className="h-10"
                  />
                  <Input
                    value={ex.to}
                    placeholder="To"
                    onChange={(e) =>
                      setExamples((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, to: e.target.value } : x
                        )
                      )
                    }
                    className="h-10"
                  />
                  <Input
                    value={ex.note}
                    placeholder="Note"
                    onChange={(e) =>
                      setExamples((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, note: e.target.value } : x
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
              {saving ? 'Saving…' : 'Save pattern'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmAction
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        title="Delete pattern?"
        description="Questions linked to this pattern may keep a null reference."
        confirmLabel="Delete"
        loading={saving}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
