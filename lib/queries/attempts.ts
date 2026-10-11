/**
 * Quiz attempt query helpers (Section 3.9).
 *
 * NOTE: Do NOT insert attempts for guest users — caller must enforce this.
 * The handle_quiz_attempt trigger updates progress + score on insert.
 */

import { createClient } from '@/lib/supabase/client'
import type { QuizAttempt } from '@/lib/types/database'

/** Input for inserting a quiz attempt. */
export type InsertAttemptInput = {
  userId: string
  questionId: string
  topicId: string
  sessionId: string
  userAnswer: string
  isCorrect: boolean
  timeTakenSeconds?: number
  attemptNumber?: number
}

/**
 * Insert a quiz attempt for an authenticated (non-guest) user.
 * Caller must not call this for guests.
 *
 * @example
 * const attempt = await insertAttempt({
 *   userId,
 *   questionId,
 *   topicId,
 *   sessionId,
 *   userAnswer: 'may',
 *   isCorrect: true,
 * })
 */
export async function insertAttempt(
  input: InsertAttemptInput
): Promise<QuizAttempt> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: input.userId,
      question_id: input.questionId,
      topic_id: input.topicId,
      session_id: input.sessionId,
      user_answer: input.userAnswer,
      is_correct: input.isCorrect,
      time_taken_seconds: input.timeTakenSeconds ?? null,
      attempt_number: input.attemptNumber ?? 1,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`[attempts.insertAttempt] ${error.message}`)
  }

  return data as QuizAttempt
}

/**
 * List all attempts for a session, oldest first.
 *
 * @example
 * const attempts = await listAttemptsForSession(sessionId)
 */
export async function listAttemptsForSession(
  sessionId: string
): Promise<QuizAttempt[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`[attempts.listAttemptsForSession] ${error.message}`)
  }

  return (data ?? []) as QuizAttempt[]
}

/**
 * List attempts for a user, newest first.
 *
 * @example
 * const attempts = await listAttemptsForUser(userId, { limit: 50 })
 */
export async function listAttemptsForUser(
  userId: string,
  options?: { limit?: number }
): Promise<QuizAttempt[]> {
  const supabase = createClient()
  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options?.limit !== undefined) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`[attempts.listAttemptsForUser] ${error.message}`)
  }

  return (data ?? []) as QuizAttempt[]
}
