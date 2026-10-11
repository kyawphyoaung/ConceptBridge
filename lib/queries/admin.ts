/**
 * Admin dashboard query helpers (Section 7.7).
 * All operations rely on RLS admin policies.
 */

import { createClient } from '@/lib/supabase/client'
import type {
  Profile,
  Question,
  QuestionData,
  QuestionType,
  QuizAttempt,
  Session,
} from '@/lib/types/database'

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  totalQuestions: number
  totalSessions: number
  recentSessions: Session[]
}

export type UserWithStats = {
  profile: Profile
  sessionCount: number
  attemptCount: number
  accuracy: number
}

export type UserDetail = {
  profile: Profile
  recentSessions: Session[]
  recentAttempts: QuizAttempt[]
  progressSummary: {
    mastered: number
    learning: number
    mistakeBank: number
  }
}

/** Bulk-insert question payload (no generated columns). */
export type BulkQuestionInput = Omit<
  Question,
  'id' | 'created_at' | 'updated_at' | 'created_by'
>

/**
 * Aggregate overview stats for the admin dashboard.
 *
 * @example
 * const stats = await getAdminStats()
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient()

  const [
    totalUsersResult,
    activeUsersResult,
    totalQuestionsResult,
    totalSessionsResult,
    recentSessionsResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_guest', false),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_guest', false)
      .eq('is_active', true),
    supabase
      .from('questions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10),
  ])

  if (totalUsersResult.error) {
    throw new Error(`[admin.getAdminStats] ${totalUsersResult.error.message}`)
  }
  if (activeUsersResult.error) {
    throw new Error(`[admin.getAdminStats] ${activeUsersResult.error.message}`)
  }
  if (totalQuestionsResult.error) {
    throw new Error(
      `[admin.getAdminStats] ${totalQuestionsResult.error.message}`
    )
  }
  if (totalSessionsResult.error) {
    throw new Error(
      `[admin.getAdminStats] ${totalSessionsResult.error.message}`
    )
  }
  if (recentSessionsResult.error) {
    throw new Error(
      `[admin.getAdminStats] ${recentSessionsResult.error.message}`
    )
  }

  return {
    totalUsers: totalUsersResult.count ?? 0,
    activeUsers: activeUsersResult.count ?? 0,
    totalQuestions: totalQuestionsResult.count ?? 0,
    totalSessions: totalSessionsResult.count ?? 0,
    recentSessions: (recentSessionsResult.data ?? []) as Session[],
  }
}

/**
 * List all users with session/attempt stats (admin only).
 *
 * @example
 * const users = await listAllUsersWithStats()
 */
export async function listAllUsersWithStats(): Promise<UserWithStats[]> {
  const supabase = createClient()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('total_score', { ascending: false })
    .order('created_at', { ascending: true })

  if (profilesError) {
    throw new Error(`[admin.listAllUsersWithStats] ${profilesError.message}`)
  }

  const list = (profiles ?? []) as Profile[]
  if (list.length === 0) {
    return []
  }

  const userIds = list.map((p) => p.id)

  const [sessionsResult, attemptsResult] = await Promise.all([
    supabase.from('sessions').select('user_id').in('user_id', userIds),
    supabase
      .from('quiz_attempts')
      .select('user_id, is_correct')
      .in('user_id', userIds),
  ])

  if (sessionsResult.error) {
    throw new Error(
      `[admin.listAllUsersWithStats] ${sessionsResult.error.message}`
    )
  }
  if (attemptsResult.error) {
    throw new Error(
      `[admin.listAllUsersWithStats] ${attemptsResult.error.message}`
    )
  }

  const sessionCountByUser = new Map<string, number>()
  for (const row of sessionsResult.data ?? []) {
    const s = row as { user_id: string | null }
    if (!s.user_id) continue
    sessionCountByUser.set(s.user_id, (sessionCountByUser.get(s.user_id) ?? 0) + 1)
  }

  const attemptStatsByUser = new Map<
    string,
    { total: number; correct: number }
  >()
  for (const row of attemptsResult.data ?? []) {
    const a = row as { user_id: string; is_correct: boolean }
    const prev = attemptStatsByUser.get(a.user_id) ?? { total: 0, correct: 0 }
    prev.total += 1
    if (a.is_correct) prev.correct += 1
    attemptStatsByUser.set(a.user_id, prev)
  }

  return list.map((profile) => {
    const attemptStats = attemptStatsByUser.get(profile.id) ?? {
      total: 0,
      correct: 0,
    }
    const accuracy =
      attemptStats.total === 0
        ? 0
        : Math.round((attemptStats.correct / attemptStats.total) * 1000) / 10

    return {
      profile,
      sessionCount: sessionCountByUser.get(profile.id) ?? 0,
      attemptCount: attemptStats.total,
      accuracy,
    }
  })
}

/**
 * Fetch a user's detail view for the admin panel.
 *
 * @example
 * const detail = await getUserDetail(userId)
 */
export async function getUserDetail(userId: string): Promise<UserDetail> {
  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw new Error(`[admin.getUserDetail] ${profileError.message}`)
  }
  if (!profile) {
    throw new Error(`[admin.getUserDetail] Profile not found for ${userId}`)
  }

  const [sessionsResult, attemptsResult, progressResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20),
    supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('user_progress')
      .select('mastery_level, is_in_mistake_bank')
      .eq('user_id', userId),
  ])

  if (sessionsResult.error) {
    throw new Error(`[admin.getUserDetail] ${sessionsResult.error.message}`)
  }
  if (attemptsResult.error) {
    throw new Error(`[admin.getUserDetail] ${attemptsResult.error.message}`)
  }
  if (progressResult.error) {
    throw new Error(`[admin.getUserDetail] ${progressResult.error.message}`)
  }

  let mastered = 0
  let learning = 0
  let mistakeBank = 0

  for (const row of progressResult.data ?? []) {
    const p = row as {
      mastery_level: number
      is_in_mistake_bank: boolean
    }
    if (p.mastery_level === 3) mastered += 1
    if (p.mastery_level === 1) learning += 1
    if (p.is_in_mistake_bank) mistakeBank += 1
  }

  return {
    profile: profile as Profile,
    recentSessions: (sessionsResult.data ?? []) as Session[],
    recentAttempts: (attemptsResult.data ?? []) as QuizAttempt[],
    progressSummary: { mastered, learning, mistakeBank },
  }
}

/**
 * Bulk-insert questions (admin only via RLS).
 *
 * @example
 * const created = await bulkInsertQuestions([
 *   {
 *     topic_id,
 *     question_type: 'mcq',
 *     prompt: '...',
 *     correct_answer: null,
 *     explanation: null,
 *     grammar_pattern_id: null,
 *     difficulty: 1,
 *     question_data: { options: ['A','B'], correct_index: 0, passage_id: null },
 *     display_order: 0,
 *     is_active: true,
 *   },
 * ])
 */
export async function bulkInsertQuestions(
  questions: BulkQuestionInput[]
): Promise<Question[]> {
  if (questions.length === 0) {
    return []
  }

  // Validate minimal shape without using `any`
  for (const q of questions) {
    if (typeof q.topic_id !== 'string' || typeof q.prompt !== 'string') {
      throw new Error(
        '[admin.bulkInsertQuestions] Each question requires topic_id and prompt'
      )
    }
    if (typeof q.question_type !== 'string') {
      throw new Error(
        '[admin.bulkInsertQuestions] Each question requires question_type'
      )
    }
  }

  const supabase = createClient()
  const payload = questions.map((q) => ({
    topic_id: q.topic_id,
    question_type: q.question_type as QuestionType,
    prompt: q.prompt,
    correct_answer: q.correct_answer ?? null,
    explanation: q.explanation ?? null,
    grammar_pattern_id: q.grammar_pattern_id ?? null,
    difficulty: q.difficulty ?? 1,
    question_data: (q.question_data ?? {}) as QuestionData,
    display_order: q.display_order ?? 0,
    is_active: q.is_active ?? true,
  }))

  const { data, error } = await supabase
    .from('questions')
    .insert(payload)
    .select('*')

  if (error) {
    throw new Error(`[admin.bulkInsertQuestions] ${error.message}`)
  }

  return (data ?? []) as Question[]
}
