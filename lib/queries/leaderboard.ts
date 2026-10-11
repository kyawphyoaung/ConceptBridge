/**
 * Leaderboard query helpers (Section 7.6).
 *
 * - `all`: sort profiles by total_score
 * - `week` / `month`: aggregate correct-attempt counts from quiz_attempts
 *   in the period, then attach profile fields
 */

import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

export type LeaderboardPeriod = 'all' | 'week' | 'month'

export type LeaderboardEntry = {
  profile: Pick<
    Profile,
    'id' | 'display_name' | 'total_score' | 'rank' | 'current_streak'
  >
  position: number
}

type ProfileLeaderboardRow = Pick<
  Profile,
  'id' | 'display_name' | 'total_score' | 'rank' | 'current_streak' | 'is_active' | 'is_guest'
>

/**
 * Period start ISO string for week/month filters (UTC).
 */
function periodStartIso(period: 'week' | 'month'): string {
  const now = new Date()
  if (period === 'week') {
    const start = new Date(now)
    start.setUTCDate(start.getUTCDate() - 7)
    return start.toISOString()
  }
  const start = new Date(now)
  start.setUTCMonth(start.getUTCMonth() - 1)
  return start.toISOString()
}

/**
 * Get the leaderboard for a period.
 *
 * @example
 * const board = await getLeaderboard({ limit: 20, period: 'all' })
 * const weekly = await getLeaderboard({ period: 'week' })
 */
export async function getLeaderboard(options?: {
  limit?: number
  period?: LeaderboardPeriod
}): Promise<LeaderboardEntry[]> {
  const limit = options?.limit ?? 20
  const period = options?.period ?? 'all'
  const supabase = createClient()

  if (period === 'all') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, total_score, rank, current_streak')
      .eq('is_active', true)
      .eq('is_guest', false)
      .order('total_score', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(`[leaderboard.getLeaderboard] ${error.message}`)
    }

    const rows = (data ?? []) as Array<
      Pick<Profile, 'id' | 'display_name' | 'total_score' | 'rank' | 'current_streak'>
    >

    return rows.map((profile, index) => ({
      profile,
      position: index + 1,
    }))
  }

  // week / month: aggregate from quiz_attempts
  const since = periodStartIso(period)

  const { data: attempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('user_id, is_correct')
    .eq('is_correct', true)
    .gte('created_at', since)

  if (attemptsError) {
    throw new Error(`[leaderboard.getLeaderboard] ${attemptsError.message}`)
  }

  const scoreByUser = new Map<string, number>()
  for (const row of attempts ?? []) {
    const attempt = row as { user_id: string; is_correct: boolean }
    scoreByUser.set(
      attempt.user_id,
      (scoreByUser.get(attempt.user_id) ?? 0) + 1
    )
  }

  if (scoreByUser.size === 0) {
    return []
  }

  const userIds = Array.from(scoreByUser.keys())
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, total_score, rank, current_streak, is_active, is_guest')
    .in('id', userIds)
    .eq('is_active', true)
    .eq('is_guest', false)

  if (profilesError) {
    throw new Error(`[leaderboard.getLeaderboard] ${profilesError.message}`)
  }

  const ranked = ((profiles ?? []) as ProfileLeaderboardRow[])
    .map((p) => ({
      profile: {
        id: p.id,
        display_name: p.display_name,
        // Period score from correct attempts; keep profile.total_score for display context
        total_score: scoreByUser.get(p.id) ?? 0,
        rank: p.rank,
        current_streak: p.current_streak,
      },
      periodScore: scoreByUser.get(p.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.periodScore !== a.periodScore) {
        return b.periodScore - a.periodScore
      }
      return a.profile.id.localeCompare(b.profile.id)
    })
    .slice(0, limit)

  return ranked.map((entry, index) => ({
    profile: entry.profile,
    position: index + 1,
  }))
}

/**
 * Get a user's 1-based position on the all-time leaderboard.
 * Returns null if the user is not found / inactive / guest.
 *
 * @example
 * const pos = await getUserRankPosition(userId)
 */
export async function getUserRankPosition(
  userId: string
): Promise<number | null> {
  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, total_score, is_active, is_guest')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw new Error(`[leaderboard.getUserRankPosition] ${profileError.message}`)
  }

  if (!profile) {
    return null
  }

  const row = profile as Pick<Profile, 'id' | 'total_score' | 'is_active' | 'is_guest'>
  if (!row.is_active || row.is_guest) {
    return null
  }

  // Count users with a strictly higher score
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_guest', false)
    .gt('total_score', row.total_score)

  if (countError) {
    throw new Error(`[leaderboard.getUserRankPosition] ${countError.message}`)
  }

  // Tie-break: users with same score but smaller id rank higher
  const { count: tieCount, error: tieError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_guest', false)
    .eq('total_score', row.total_score)
    .lt('id', row.id)

  if (tieError) {
    throw new Error(`[leaderboard.getUserRankPosition] ${tieError.message}`)
  }

  return (count ?? 0) + (tieCount ?? 0) + 1
}
