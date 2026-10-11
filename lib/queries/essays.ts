/**
 * Essay query helpers (Section 3.6–3.8 / 7.2.5 / 7.3 / 7.7).
 */

import { createClient } from '@/lib/supabase/client'
import type { Essay, EssayLine, EssayTerm } from '@/lib/types/database'

/** Input for creating an essay (admin). */
export type CreateEssayInput = {
  subject_id: string
  paper_code?: string | null
  title: string
  question?: string | null
  content_en?: string | null
  content_mm?: string | null
  display_order?: number
  is_active?: boolean
}

/** Partial updates for an essay (admin). */
export type UpdateEssayInput = Partial<
  Omit<Essay, 'id'>
>

/** Line payload without generated columns. */
export type EssayLineInput = Omit<EssayLine, 'id' | 'essay_id' | 'created_at'>

/** Term payload without generated columns. */
export type EssayTermInput = Omit<EssayTerm, 'id' | 'essay_id'>

/**
 * List active essays for a subject, ordered by display_order.
 *
 * @example
 * const essays = await listEssaysBySubject(subjectId)
 */
export async function listEssaysBySubject(subjectId: string): Promise<Essay[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`[essays.listEssaysBySubject] ${error.message}`)
  }

  return (data ?? []) as Essay[]
}

/**
 * List all essays for admin (includes inactive), optionally by subject.
 */
export async function listEssaysAdmin(subjectId?: string): Promise<Essay[]> {
  const supabase = createClient()
  let query = supabase
    .from('essays')
    .select('*')
    .order('display_order', { ascending: true })
    .order('title', { ascending: true })

  if (subjectId) {
    query = query.eq('subject_id', subjectId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`[essays.listEssaysAdmin] ${error.message}`)
  }

  return (data ?? []) as Essay[]
}

/**
 * Fetch a single essay by id.
 *
 * @example
 * const essay = await getEssayById(id)
 */
export async function getEssayById(id: string): Promise<Essay | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`[essays.getEssayById] ${error.message}`)
  }

  return data as Essay | null
}

/**
 * Fetch an essay with its lines and terms.
 *
 * @example
 * const bundle = await getEssayWithLinesAndTerms(essayId)
 */
export async function getEssayWithLinesAndTerms(
  essayId: string
): Promise<{
  essay: Essay
  lines: EssayLine[]
  terms: EssayTerm[]
} | null> {
  const essay = await getEssayById(essayId)
  if (!essay) {
    return null
  }

  const supabase = createClient()

  const [linesResult, termsResult] = await Promise.all([
    supabase
      .from('essay_lines')
      .select('*')
      .eq('essay_id', essayId)
      .order('line_number', { ascending: true }),
    supabase
      .from('essay_terms')
      .select('*')
      .eq('essay_id', essayId)
      .order('occurrence_line', { ascending: true })
      .order('term', { ascending: true }),
  ])

  if (linesResult.error) {
    throw new Error(
      `[essays.getEssayWithLinesAndTerms] ${linesResult.error.message}`
    )
  }
  if (termsResult.error) {
    throw new Error(
      `[essays.getEssayWithLinesAndTerms] ${termsResult.error.message}`
    )
  }

  return {
    essay,
    lines: (linesResult.data ?? []) as EssayLine[],
    terms: (termsResult.data ?? []) as EssayTerm[],
  }
}

/**
 * Create an essay (admin only via RLS).
 *
 * @example
 * const essay = await createEssay({
 *   subject_id,
 *   title: 'Western Aesthetics Intro',
 *   content_en: '...',
 *   paper_code: '3101',
 * })
 */
export async function createEssay(input: CreateEssayInput): Promise<Essay> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('essays')
    .insert({
      subject_id: input.subject_id,
      paper_code: input.paper_code ?? null,
      title: input.title,
      question: input.question ?? null,
      content_en: input.content_en ?? null,
      content_mm: input.content_mm ?? null,
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`[essays.createEssay] ${error.message}`)
  }

  return data as Essay
}

/**
 * Update an essay (admin only via RLS).
 *
 * @example
 * const essay = await updateEssay(id, { title: 'Updated title' })
 */
export async function updateEssay(
  id: string,
  updates: UpdateEssayInput
): Promise<Essay> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('essays')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[essays.updateEssay] ${error.message}`)
  }

  return data as Essay
}

/**
 * Delete an essay (admin only via RLS). Cascades to lines/terms.
 *
 * @example
 * await deleteEssay(id)
 */
export async function deleteEssay(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('essays').delete().eq('id', id)

  if (error) {
    throw new Error(`[essays.deleteEssay] ${error.message}`)
  }
}

/**
 * Replace all lines for an essay (delete then insert). Admin only.
 *
 * @example
 * await replaceEssayLines(essayId, [
 *   { line_number: 1, line_en: 'Hello', line_mm: 'မင်္ဂလာပါ' },
 * ])
 */
export async function replaceEssayLines(
  essayId: string,
  lines: EssayLineInput[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('essay_lines')
    .delete()
    .eq('essay_id', essayId)

  if (deleteError) {
    throw new Error(`[essays.replaceEssayLines] ${deleteError.message}`)
  }

  if (lines.length === 0) {
    return
  }

  const payload = lines.map((line) => ({
    essay_id: essayId,
    line_number: line.line_number,
    line_en: line.line_en,
    line_mm: line.line_mm ?? null,
  }))

  const { error: insertError } = await supabase
    .from('essay_lines')
    .insert(payload)

  if (insertError) {
    throw new Error(`[essays.replaceEssayLines] ${insertError.message}`)
  }
}

/**
 * Replace all terms for an essay (delete then insert). Admin only.
 *
 * @example
 * await replaceEssayTerms(essayId, [
 *   { term: 'aesthetics', definition_mm: '...', definition_en: '...', occurrence_line: 1 },
 * ])
 */
export async function replaceEssayTerms(
  essayId: string,
  terms: EssayTermInput[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('essay_terms')
    .delete()
    .eq('essay_id', essayId)

  if (deleteError) {
    throw new Error(`[essays.replaceEssayTerms] ${deleteError.message}`)
  }

  if (terms.length === 0) {
    return
  }

  const payload = terms.map((term) => ({
    essay_id: essayId,
    term: term.term,
    definition_mm: term.definition_mm ?? null,
    definition_en: term.definition_en ?? null,
    occurrence_line: term.occurrence_line ?? null,
  }))

  const { error: insertError } = await supabase
    .from('essay_terms')
    .insert(payload)

  if (insertError) {
    throw new Error(`[essays.replaceEssayTerms] ${insertError.message}`)
  }
}
