/**
 * User progress / mistake-bank query helpers (Section 3.10 / 6).
 *
 * Note: Inserting a quiz_attempt also upserts progress via trigger.
 * These helpers support direct reads/updates for review scheduling.
 */

import { createClient } from '@/lib/supabase/client'
import type { MasteryLevel, UserProgress } from '@/lib/types/database'

/** Input for upserting progress. */
export type UpsertProgressInput = {
  userId: string
  questionId: string
  timesAttempted?: number
  timesCorrect?: number
  consecutiveCorrect?: number
  lastAttemptedAt?: string | null
  nextReviewAt?: string | null
  masteryLevel?: MasteryLevel
  isInMistakeBank?: boolean
}

/**
 * Fetch all progress rows for a user.
 *
 * @example
 * const progress = await getUserProgress(userId)
 */
export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('last_attempted_at', { ascending: false, nullsFirst: false })

  if (error) {
    throw new Error(`[progress.getUserProgress] ${error.message}`)
  }

  return (data ?? []) as UserProgress[]
}

/**
 * Fetch progress for one user + question pair.
 *
 * @example
 * const row = await getUserProgressForQuestion(userId, questionId)
 */
export async function getUserProgressForQuestion(
  userId: string,
  questionId: string
): Promise<UserProgress | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle()

  if (error) {
    throw new Error(`[progress.getUserProgressForQuestion] ${error.message}`)
  }

  return data as UserProgress | null
}

/**
 * Fetch questions currently in the mistake bank.
 *
 * @example
 * const mistakes = await getMistakeBank(userId)
 */
export async function getMistakeBank(userId: string): Promise<UserProgress[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('is_in_mistake_bank', true)
    .order('last_attempted_at', { ascending: false, nullsFirst: false })

  if (error) {
    throw new Error(`[progress.getMistakeBank] ${error.message}`)
  }

  return (data ?? []) as UserProgress[]
}

/**
 * Fetch progress rows due for review (next_review_at <= now).
 *
 * @example
 * const due = await getDueForReview(userId)
 */
export async function getDueForReview(userId: string): Promise<UserProgress[]> {
  const supabase = createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review_at', now)
    .order('next_review_at', { ascending: true })

  if (error) {
    throw new Error(`[progress.getDueForReview] ${error.message}`)
  }

  return (data ?? []) as UserProgress[]
}

/**
 * Upsert a progress row for (user_id, question_id).
 *
 * @example
 * const row = await upsertProgress({
 *   userId,
 *   questionId,
 *   masteryLevel: 2,
 *   isInMistakeBank: false,
 * })
 */
export async function upsertProgress(
  input: UpsertProgressInput
): Promise<UserProgress> {
  const supabase = createClient()
  const payload = {
    user_id: input.userId,
    question_id: input.questionId,
    times_attempted: input.timesAttempted ?? 0,
    times_correct: input.timesCorrect ?? 0,
    consecutive_correct: input.consecutiveCorrect ?? 0,
    last_attempted_at: input.lastAttemptedAt ?? null,
    next_review_at: input.nextReviewAt ?? null,
    mastery_level: input.masteryLevel ?? 0,
    is_in_mistake_bank: input.isInMistakeBank ?? false,
  }

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(payload, { onConflict: 'user_id,question_id' })
    .select('*')
    .single()

  if (error) {
    throw new Error(`[progress.upsertProgress] ${error.message}`)
  }

  return data as UserProgress
}

/**
 * Set next_review_at for a user + question.
 *
 * @example
 * await setNextReview(userId, questionId, new Date())
 */
export async function setNextReview(
  userId: string,
  questionId: string,
  nextReviewAt: Date
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('user_progress')
    .update({ next_review_at: nextReviewAt.toISOString() })
    .eq('user_id', userId)
    .eq('question_id', questionId)

  if (error) {
    throw new Error(`[progress.setNextReview] ${error.message}`)
  }
}

/**
 * Remove a question from the user's mistake bank.
 *
 * @example
 * await removeFromMistakeBank(userId, questionId)
 */
export async function removeFromMistakeBank(
  userId: string,
  questionId: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('user_progress')
    .update({ is_in_mistake_bank: false })
    .eq('user_id', userId)
    .eq('question_id', questionId)

  if (error) {
    throw new Error(`[progress.removeFromMistakeBank] ${error.message}`)
  }
}
