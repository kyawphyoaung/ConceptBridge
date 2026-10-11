/**
 * Quiz session query helpers (Section 3.11 / 7.5).
 */

import { createClient } from '@/lib/supabase/client'
import type { Session, SessionMode } from '@/lib/types/database'

/** Input for creating a session. */
export type CreateSessionInput = {
  userId: string | null
  subjectId: string
  topicId: string | null
  sessionMode: SessionMode
  questionsPlanned: number
}

/**
 * Create a new quiz session.
 *
 * @example
 * const session = await createSession({
 *   userId,
 *   subjectId,
 *   topicId,
 *   sessionMode: 'practice',
 *   questionsPlanned: 10,
 * })
 */
export async function createSession(
  input: CreateSessionInput
): Promise<Session> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: input.userId,
      subject_id: input.subjectId,
      topic_id: input.topicId,
      session_mode: input.sessionMode,
      questions_planned: input.questionsPlanned,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`[sessions.createSession] ${error.message}`)
  }

  return data as Session
}

/**
 * Update a session with partial fields.
 *
 * @example
 * const session = await updateSession(id, { questions_completed: 5 })
 */
export async function updateSession(
  id: string,
  updates: Partial<Session>
): Promise<Session> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[sessions.updateSession] ${error.message}`)
  }

  return data as Session
}

/**
 * Mark a session as completed with final stats.
 *
 * @example
 * await completeSession(id, {
 *   questionsCompleted: 10,
 *   correctCount: 8,
 *   scoreEarned: 8,
 * })
 */
export async function completeSession(
  id: string,
  stats: {
    questionsCompleted: number
    correctCount: number
    scoreEarned: number
  }
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('sessions')
    .update({
      questions_completed: stats.questionsCompleted,
      correct_count: stats.correctCount,
      score_earned: stats.scoreEarned,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`[sessions.completeSession] ${error.message}`)
  }
}

/**
 * List sessions for a user, newest first.
 *
 * @example
 * const history = await getUserSessions(userId, { limit: 20 })
 */
export async function getUserSessions(
  userId: string,
  options?: { limit?: number }
): Promise<Session[]> {
  const supabase = createClient()
  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (options?.limit !== undefined) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`[sessions.getUserSessions] ${error.message}`)
  }

  return (data ?? []) as Session[]
}

/**
 * Fetch a session by id.
 *
 * @example
 * const session = await getSessionById(id)
 */
export async function getSessionById(id: string): Promise<Session | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`[sessions.getSessionById] ${error.message}`)
  }

  return data as Session | null
}
