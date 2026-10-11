'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useSound } from '@/components/providers/SoundProvider'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isQuantificationData } from '@/lib/types/database'
import type { BaseQuestionProps } from '@/components/quiz/types'

function normalizeAnswer(parts: string[]): string {
  return [...parts].sort().join('|')
}

function tokenizeCorrect(answer: string): string[] {
  // Split on whitespace while keeping common logic tokens intact when already spaced
  return answer
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function Chip({
  id,
  label,
  disabled,
}: {
  id: string
  label: string
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-[44px] items-center rounded-md border border-border bg-card px-3 text-sm font-medium',
        isDragging && 'opacity-40',
        disabled && 'opacity-50'
      )}
    >
      {label}
    </button>
  )
}

function DropZone({
  items,
  onRemove,
  disabled,
}: {
  items: string[]
  onRemove: (index: number) => void
  disabled?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'answer-zone' })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[88px] rounded-xl border border-dashed border-border bg-muted/30 p-3',
        isOver && 'border-primary bg-primary/5'
      )}
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Drag components here — or tap them below on mobile.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => onRemove(index)}
              className="inline-flex min-h-[40px] items-center rounded-md bg-primary/10 px-3 text-sm font-medium text-primary"
            >
              {item} ×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Quantification drag-and-drop (order-insensitive) with tap-to-add fallback.
 */
export function QuantificationQuestion({
  question,
  onSubmit,
}: BaseQuestionProps) {
  const { playCorrect, playWrong, playClick } = useSound()
  const data = isQuantificationData(question.question_data)
    ? question.question_data
    : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  )

  const [selected, setSelected] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const pool = useMemo(() => data?.available_components ?? [], [data])

  const continueToNext = useCallback(() => {
    if (!submitted) return
    onSubmit(selected.join(' '), isCorrect)
  }, [submitted, selected, isCorrect, onSubmit])

  if (!data) {
    return (
      <p className="text-sm text-destructive">Invalid quantification data.</p>
    )
  }

  const addComponent = (label: string) => {
    if (submitted) return
    playClick()
    setSelected((prev) => [...prev, label])
  }

  const removeAt = (index: number) => {
    if (submitted) return
    playClick()
    setSelected((prev) => prev.filter((_, i) => i !== index))
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    if (submitted) return
    const { over, active } = event
    if (!over || over.id !== 'answer-zone') return
    const raw = String(active.id)
    const label = raw.replace(/^comp-\d+-/, '')
    addComponent(label)
  }

  const handleSubmit = () => {
    if (submitted || selected.length === 0) return

    const correctTokens = tokenizeCorrect(data.correct_answer)
    const ok =
      normalizeAnswer(selected) === normalizeAnswer(correctTokens) ||
      normalizeAnswer(selected) ===
        normalizeAnswer(
          data.correct_answer
            .replace(/[\[\]()]/g, ' $& ')
            .split(/\s+/)
            .filter(Boolean)
        )

    // Also accept exact string match ignoring spaces
    const compactSelected = selected.join('').replace(/\s+/g, '')
    const compactCorrect = data.correct_answer.replace(/\s+/g, '')
    const exactOk = compactSelected === compactCorrect
    const finalOk = ok || exactOk

    setIsCorrect(finalOk)
    setSubmitted(true)
    if (finalOk) playCorrect()
    else playWrong()
  }

  const activeLabel = activeId
    ? activeId.replace(/^comp-\d+-/, '')
    : null

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">{question.prompt}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.premises.map((premise) => (
            <span
              key={premise}
              className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
            >
              {premise}
            </span>
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your answer
          </p>
          <DropZone
            items={selected}
            onRemove={removeAt}
            disabled={submitted}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Available components
          </p>
          <div className="flex flex-wrap gap-2">
            {pool.map((comp, index) => (
              <div key={`${comp}-${index}`} className="flex">
                <Chip
                  id={`comp-${index}-${comp}`}
                  label={comp}
                  disabled={submitted}
                />
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => addComponent(comp)}
                  className="ml-1 inline-flex h-11 min-h-[44px] items-center rounded-md px-2 text-xs text-primary md:hidden"
                  aria-label={`Add ${comp}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 hidden text-xs text-muted-foreground md:block">
            Tip: drag chips into the answer zone. Tap × on a chip to remove it.
          </p>
        </div>

        <DragOverlay>
          {activeLabel ? (
            <span className="inline-flex min-h-[44px] items-center rounded-md border border-primary bg-card px-3 text-sm font-medium shadow-md">
              {activeLabel}
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!submitted ? (
        <Button
          type="button"
          className="h-12 min-h-[44px] w-full"
          disabled={selected.length === 0}
          onClick={handleSubmit}
        >
          Submit answer
        </Button>
      ) : (
        <AnswerFeedback
          isCorrect={isCorrect}
          explanation={question.explanation}
          onContinue={continueToNext}
        >
          <p className="mt-1">Rule: {data.rule_applied}</p>
          <p className="mt-1">Answer: {data.correct_answer}</p>
        </AnswerFeedback>
      )}
    </div>
  )
}
