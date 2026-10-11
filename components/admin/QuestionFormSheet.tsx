'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
  buildQuestionData,
  emptyQuestionForm,
  QUESTION_TYPES,
  valuesFromQuestionData,
  type QuestionFormValues,
} from '@/components/admin/questionFormUtils'
import {
  createQuestion,
  updateQuestion,
} from '@/lib/queries/questions'
import type { GrammarPattern, Question, Subject, Topic } from '@/lib/types/database'

type QuestionFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question | null
  subjects: Subject[]
  topics: Topic[]
  patterns: GrammarPattern[]
  onSaved: () => void
}

/**
 * Multi-step question create/edit sheet (mobile-friendly).
 */
export function QuestionFormSheet({
  open,
  onOpenChange,
  question,
  subjects,
  topics,
  patterns,
  onSaved,
}: QuestionFormSheetProps) {
  const [step, setStep] = useState(1)
  const [values, setValues] = useState<QuestionFormValues>(emptyQuestionForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep(1)
    if (question) {
      setValues(
        emptyQuestionForm({
          topic_id: question.topic_id,
          question_type: question.question_type,
          prompt: question.prompt,
          correct_answer: question.correct_answer ?? '',
          explanation: question.explanation ?? '',
          difficulty: question.difficulty,
          grammar_pattern_id: question.grammar_pattern_id ?? '',
          is_active: question.is_active,
          ...valuesFromQuestionData(
            question.question_type,
            question.question_data
          ),
        })
      )
    } else {
      setValues(emptyQuestionForm())
    }
  }, [open, question])

  const set = <K extends keyof QuestionFormValues>(
    key: K,
    value: QuestionFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }))

  const topicsBySubject = subjects.map((s) => ({
    subject: s,
    topics: topics.filter((t) => t.subject_id === s.id),
  }))

  const save = async () => {
    if (!values.topic_id || !values.prompt.trim()) {
      toast.error('Topic and prompt are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        topic_id: values.topic_id,
        question_type: values.question_type,
        prompt: values.prompt.trim(),
        correct_answer: values.correct_answer.trim() || null,
        explanation: values.explanation.trim() || null,
        difficulty: values.difficulty,
        grammar_pattern_id: values.grammar_pattern_id || null,
        is_active: values.is_active,
        question_data: buildQuestionData(values),
      }
      if (question) {
        await updateQuestion(question.id, payload)
        toast.success('Question updated')
      } else {
        await createQuestion(payload)
        toast.success('Question created')
      }
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>
            {question ? 'Edit question' : 'New question'} · Step {step}/3
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 px-1">
          {step === 1 ? (
            <>
              <Field label="Topic">
                <Select
                  value={values.topic_id}
                  onValueChange={(v) => set('topic_id', v)}
                >
                  <SelectTrigger className="h-11 min-h-[44px] w-full">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicsBySubject.map(({ subject, topics: ts }) =>
                      ts.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {subject.name} · {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Type">
                <Select
                  value={values.question_type}
                  onValueChange={(v) =>
                    set('question_type', v as QuestionFormValues['question_type'])
                  }
                >
                  <SelectTrigger className="h-11 min-h-[44px] w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Difficulty">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((d) => (
                    <Button
                      key={d}
                      type="button"
                      variant={values.difficulty === d ? 'default' : 'outline'}
                      className="h-11 min-h-[44px]"
                      onClick={() => set('difficulty', d)}
                    >
                      {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
                    </Button>
                  ))}
                </div>
              </Field>
              <Field label="Grammar pattern (optional)">
                <Select
                  value={values.grammar_pattern_id || '__none__'}
                  onValueChange={(v) =>
                    set('grammar_pattern_id', v === '__none__' ? '' : v)
                  }
                >
                  <SelectTrigger className="h-11 min-h-[44px] w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {patterns.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field label="Prompt">
                <Textarea
                  value={values.prompt}
                  onChange={(e) => set('prompt', e.target.value)}
                  className="min-h-24 w-full text-base"
                />
              </Field>
              <Field label="Correct answer">
                <Input
                  value={values.correct_answer}
                  onChange={(e) => set('correct_answer', e.target.value)}
                  className="h-11 min-h-[44px] w-full text-base"
                />
              </Field>
              <Field label="Explanation">
                <Textarea
                  value={values.explanation}
                  onChange={(e) => set('explanation', e.target.value)}
                  className="min-h-20 w-full text-base"
                />
              </Field>
            </>
          ) : null}

          {step === 3 ? (
            <TypeFields values={values} set={set} />
          ) : null}

          <div className="flex gap-2 pt-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 min-h-[44px] flex-1"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            ) : null}
            {step < 3 ? (
              <Button
                type="button"
                className="h-12 min-h-[44px] flex-1"
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                className="h-12 min-h-[44px] flex-1"
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

function TypeFields({
  values,
  set,
}: {
  values: QuestionFormValues
  set: <K extends keyof QuestionFormValues>(
    key: K,
    value: QuestionFormValues[K]
  ) => void
}) {
  switch (values.question_type) {
    case 'flashcard':
      return (
        <>
          <Field label="Term">
            <Input
              value={values.term}
              onChange={(e) => set('term', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Definition">
            <Input
              value={values.definition}
              onChange={(e) => set('definition', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Category">
            <Input
              value={values.category}
              onChange={(e) => set('category', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
        </>
      )
    case 'mcq':
      return (
        <>
          <Field label="Options (one per line)">
            <Textarea
              value={values.optionsText}
              onChange={(e) => set('optionsText', e.target.value)}
              className="min-h-28 w-full"
            />
          </Field>
          <Field label="Correct index (0-based)">
            <Input
              type="number"
              min={0}
              value={values.correct_index}
              onChange={(e) => set('correct_index', Number(e.target.value))}
              className="h-11 w-full"
            />
          </Field>
        </>
      )
    case 'sentence-transform':
    case 'idiom-transform':
      return (
        <>
          <Field label="Original">
            <Textarea
              value={values.original}
              onChange={(e) => set('original', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
          <Field label="Answer">
            <Textarea
              value={values.answer}
              onChange={(e) => set('answer', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
          {values.question_type === 'sentence-transform' ? (
            <>
              <Field label="Hint">
                <Input
                  value={values.hint}
                  onChange={(e) => set('hint', e.target.value)}
                  className="h-11 w-full"
                />
              </Field>
              <Field label="Tags (comma-separated)">
                <Input
                  value={values.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  className="h-11 w-full"
                />
              </Field>
            </>
          ) : (
            <Field label="Idiom">
              <Input
                value={values.idiom}
                onChange={(e) => set('idiom', e.target.value)}
                className="h-11 w-full"
              />
            </Field>
          )}
        </>
      )
    case 'simile-fill':
      return (
        <>
          <Field label="Sentence">
            <Textarea
              value={values.sentence}
              onChange={(e) => set('sentence', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
          <Field label="Answer">
            <Input
              value={values.answer}
              onChange={(e) => set('answer', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Hint">
            <Input
              value={values.hint}
              onChange={(e) => set('hint', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Acceptable answers (one per line)">
            <Textarea
              value={values.acceptable_answers}
              onChange={(e) => set('acceptable_answers', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
        </>
      )
    case 'truth-table':
      return (
        <>
          <Field label="Expression">
            <Input
              value={values.expression}
              onChange={(e) => set('expression', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Classification">
            <Select
              value={values.classification}
              onValueChange={(v) =>
                set(
                  'classification',
                  v as QuestionFormValues['classification']
                )
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tautology">tautology</SelectItem>
                <SelectItem value="contradiction">contradiction</SelectItem>
                <SelectItem value="contingency">contingency</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Explanation">
            <Textarea
              value={values.tt_explanation}
              onChange={(e) => set('tt_explanation', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
        </>
      )
    case 'quantification':
      return (
        <>
          <Field label="Premises (one per line)">
            <Textarea
              value={values.premises}
              onChange={(e) => set('premises', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
          <Field label="Components (one per line)">
            <Textarea
              value={values.components}
              onChange={(e) => set('components', e.target.value)}
              className="min-h-20 w-full"
            />
          </Field>
          <Field label="Correct answer">
            <Input
              value={values.answer}
              onChange={(e) => set('answer', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Rule">
            <Input
              value={values.rule}
              onChange={(e) => set('rule', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
        </>
      )
    case 'essay-question':
      return (
        <>
          <Field label="Paper code">
            <Input
              value={values.paper_code}
              onChange={(e) => set('paper_code', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
          <Field label="Essay ID">
            <Input
              value={values.essay_id}
              onChange={(e) => set('essay_id', e.target.value)}
              className="h-11 w-full"
            />
          </Field>
        </>
      )
    default:
      return null
  }
}
