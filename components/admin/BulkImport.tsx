'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  bulkInsertQuestions,
  type BulkQuestionInput,
} from '@/lib/queries/admin'
import type { QuestionType } from '@/lib/types/database'

const EXAMPLE_JSON = `[
  {
    "topic_id": "REPLACE_WITH_TOPIC_UUID",
    "question_type": "mcq",
    "prompt": "What is aesthetics?",
    "correct_answer": null,
    "explanation": "Sample explanation",
    "grammar_pattern_id": null,
    "difficulty": 1,
    "question_data": {
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "passage_id": null
    },
    "display_order": 1,
    "is_active": true
  }
]`

type ParseResult =
  | { ok: true; items: BulkQuestionInput[] }
  | { ok: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseBulkJson(raw: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Invalid JSON' }
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, error: 'Root value must be an array' }
  }
  const items: BulkQuestionInput[] = []
  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i]
    if (!isRecord(row)) {
      return { ok: false, error: `Item ${i + 1} is not an object` }
    }
    if (typeof row.topic_id !== 'string' || !row.topic_id) {
      return { ok: false, error: `Item ${i + 1}: topic_id required` }
    }
    if (typeof row.prompt !== 'string' || !row.prompt.trim()) {
      return { ok: false, error: `Item ${i + 1}: prompt required` }
    }
    if (typeof row.question_type !== 'string') {
      return { ok: false, error: `Item ${i + 1}: question_type required` }
    }
    items.push({
      topic_id: row.topic_id,
      question_type: row.question_type as QuestionType,
      prompt: row.prompt,
      correct_answer:
        typeof row.correct_answer === 'string' ? row.correct_answer : null,
      explanation: typeof row.explanation === 'string' ? row.explanation : null,
      grammar_pattern_id:
        typeof row.grammar_pattern_id === 'string'
          ? row.grammar_pattern_id
          : null,
      difficulty: typeof row.difficulty === 'number' ? row.difficulty : 1,
      question_data:
        isRecord(row.question_data)
          ? (row.question_data as BulkQuestionInput['question_data'])
          : ({} as BulkQuestionInput['question_data']),
      display_order:
        typeof row.display_order === 'number' ? row.display_order : i,
      is_active: row.is_active !== false,
    })
  }
  return { ok: true, items }
}

/**
 * Admin bulk import via paste JSON or file upload.
 */
export function BulkImport() {
  const [raw, setRaw] = useState(EXAMPLE_JSON)
  const [mode, setMode] = useState<'paste' | 'file'>('paste')
  const [inserting, setInserting] = useState(false)
  const [result, setResult] = useState<{
    inserted: number
    failed: string[]
  } | null>(null)

  const parsed = useMemo(() => parseBulkJson(raw), [raw])

  const onFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      setRaw(text)
      setMode('file')
      toast.success(`Loaded ${file.name}`)
    } catch {
      toast.error('Could not read file')
    }
  }

  const insert = async () => {
    if (!parsed.ok) {
      toast.error(parsed.error)
      return
    }
    setInserting(true)
    setResult(null)
    try {
      const created = await bulkInsertQuestions(parsed.items)
      setResult({ inserted: created.length, failed: [] })
      toast.success(`Inserted ${created.length} questions`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Insert failed'
      setResult({ inserted: 0, failed: [message] })
      toast.error(message)
    } finally {
      setInserting(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bulk Import"
        description="Paste or upload a JSON array of questions."
        backHref="/admin"
      />

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mode === 'paste' ? 'default' : 'outline'}
          className="h-11 min-h-[44px]"
          onClick={() => setMode('paste')}
        >
          Paste JSON
        </Button>
        <label className="inline-flex h-11 min-h-[44px] cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium">
          Upload file
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>JSON payload</Label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(EXAMPLE_JSON)
              toast.success('Example copied')
            }}
          >
            Copy example
          </Button>
        </div>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="min-h-56 w-full font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {!parsed.ok ? (
        <p className="text-sm text-destructive">{parsed.error}</p>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold">
            Valid · {parsed.items.length} question
            {parsed.items.length === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Preview (first 5)</p>
          <ul className="mt-2 space-y-2">
            {parsed.items.slice(0, 5).map((item, i) => (
              <li key={i} className="rounded-lg bg-muted/50 p-2 text-sm">
                <span className="font-medium">{item.question_type}</span>
                {' · '}
                <span className="text-muted-foreground line-clamp-2">
                  {item.prompt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="button"
        className="h-12 min-h-[44px] w-full"
        disabled={!parsed.ok || inserting}
        onClick={() => void insert()}
      >
        {inserting ? 'Inserting…' : 'Insert questions'}
      </Button>

      {result ? (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="font-semibold">{result.inserted} inserted</p>
          {result.failed.length > 0 ? (
            <ul className="mt-2 space-y-1 text-destructive">
              {result.failed.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            <EmptyState
              iconName="CheckCircle2"
              title="Import complete"
              className="min-h-[12dvh] py-4"
            />
          )}
        </div>
      ) : null}
    </div>
  )
}
