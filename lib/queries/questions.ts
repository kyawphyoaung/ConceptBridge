/**
 * Question query helpers (Section 3.4 / 7.7).
 */

import { createClient } from '@/lib/supabase/client'
import type {
  Question,
  QuestionData,
  QuestionType,
} from '@/lib/types/database'

/** Input for creating a question (admin). */
export type CreateQuestionInput = {
  topic_id: string
  question_type: QuestionType
  prompt: string
  correct_answer?: string | null
  explanation?: string | null
  grammar_pattern_id?: string | null
  difficulty?: number
  question_data?: QuestionData
  display_order?: number
  is_active?: boolean
  created_by?: string | null
}

/** Partial updates for a question (admin). */
export type UpdateQuestionInput = Partial<
  Omit<Question, 'id' | 'created_at' | 'updated_at'>
>

/**
 * List active questions for a topic, ordered by display_order.
 *
 * @example
 * const questions = await listQuestionsByTopic(topicId, { limit: 20 })
 */
export async function listQuestionsByTopic(
  topicId: string,
  options?: { limit?: number }
): Promise<Question[]> {
  const supabase = createClient()
  let query = supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (options?.limit !== undefined) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`[questions.listQuestionsByTopic] ${error.message}`)
  }

  return (data ?? []) as Question[]
}

/**
 * Fetch a single question by id.
 *
 * @example
 * const q = await getQuestionById(id)
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`[questions.getQuestionById] ${error.message}`)
  }

  return data as Question | null
}

/**
 * Fetch multiple questions by id list, preserving deterministic order
 * by display_order then created_at.
 *
 * @example
 * const qs = await getQuestionsByIds(['id1', 'id2'])
 */
export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (ids.length === 0) {
    return []
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', ids)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`[questions.getQuestionsByIds] ${error.message}`)
  }

  return (data ?? []) as Question[]
}

/**
 * Create a question (admin only via RLS).
 *
 * @example
 * const q = await createQuestion({
 *   topic_id,
 *   question_type: 'mcq',
 *   prompt: 'What is ...?',
 *   question_data: { options: ['A','B'], correct_index: 0, passage_id: null },
 * })
 */
export async function createQuestion(
  input: CreateQuestionInput
): Promise<Question> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('questions')
    .insert({
      topic_id: input.topic_id,
      question_type: input.question_type,
      prompt: input.prompt,
      correct_answer: input.correct_answer ?? null,
      explanation: input.explanation ?? null,
      grammar_pattern_id: input.grammar_pattern_id ?? null,
      difficulty: input.difficulty ?? 1,
      question_data: input.question_data ?? {},
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
      created_by: input.created_by ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`[questions.createQuestion] ${error.message}`)
  }

  return data as Question
}

/**
 * Update a question (admin only via RLS).
 *
 * @example
 * const q = await updateQuestion(id, { prompt: 'Updated prompt' })
 */
export async function updateQuestion(
  id: string,
  updates: UpdateQuestionInput
): Promise<Question> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('questions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[questions.updateQuestion] ${error.message}`)
  }

  return data as Question
}

/**
 * Delete a question (admin only via RLS).
 *
 * @example
 * await deleteQuestion(id)
 */
export async function deleteQuestion(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('questions').delete().eq('id', id)

  if (error) {
    throw new Error(`[questions.deleteQuestion] ${error.message}`)
  }
}

/**
 * List questions for admin (includes inactive). Optional filters.
 *
 * @example
 * const all = await listQuestionsAdmin({ topicId, questionType: 'mcq' })
 */
export async function listQuestionsAdmin(options?: {
  topicId?: string
  questionType?: QuestionType
  search?: string
  limit?: number
}): Promise<Question[]> {
  const supabase = createClient()
  let query = supabase
    .from('questions')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (options?.topicId) {
    query = query.eq('topic_id', options.topicId)
  }
  if (options?.questionType) {
    query = query.eq('question_type', options.questionType)
  }
  if (options?.search?.trim()) {
    query = query.ilike('prompt', `%${options.search.trim()}%`)
  }
  if (options?.limit !== undefined) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`[questions.listQuestionsAdmin] ${error.message}`)
  }

  return (data ?? []) as Question[]
}

/**
 * Count active questions for a topic.
 *
 * @example
 * const n = await countQuestionsByTopic(topicId)
 */
export async function countQuestionsByTopic(topicId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', topicId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`[questions.countQuestionsByTopic] ${error.message}`)
  }

  return count ?? 0
}
