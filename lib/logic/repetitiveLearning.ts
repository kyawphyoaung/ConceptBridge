/**
 * Repetitive learning session queue algorithm (Section 6).
 * Pure TypeScript — no React, no Supabase, no I/O.
 *
 * Rules:
 * - Mistake bank priority: up to 40% of session from mistake bank
 * - Wrong answer → requeue at currentIndex + random(3, 4)
 * - Correct answer → do not requeue
 * - Mastery: 3 consecutive correct → level 3 (mastered)
 * - Review mode: only pull from mistake bank
 *
 * @example
 * const queue = buildSessionQueue({
 *   questionIds: ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'],
 *   totalQuestions: 10,
 *   mode: 'practice',
 *   mistakeBankIds: ['q2','q5'],
 * })
 */

import type { MasteryLevel, SessionMode } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Thrown when session-queue inputs are invalid.
 */
export class RepetitiveLearningError extends Error {
  readonly name = 'RepetitiveLearningError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QueueItem = {
  questionId: string
  /** true if sourced from the mistake bank */
  isReview: boolean
}

export type SessionConfig = {
  /** All candidate question IDs for this session */
  questionIds: string[]
  /** Planned session length (typically 10 or 20) */
  totalQuestions: number
  mode: SessionMode
  /** Questions currently in the mistake bank */
  mistakeBankIds?: string[]
  /** Already-answered state within this session (optional, for rebuilds) */
  questionsAnswered?: Record<
    string,
    {
      isCorrect: boolean
      requeued: boolean
    }
  >
  currentIndex?: number
}

export type HandleAnswerResult = {
  requeue: boolean
  requeueAtIndex: number | null
}

// ---------------------------------------------------------------------------
// Internal helpers (pure)
// ---------------------------------------------------------------------------

/**
 * Deterministic shuffle using Fisher–Yates with a seeded LCG.
 * Keeps the function free of Math.random side-effect concerns for tests
 * when a seed is provided; defaults to Math.random for production use.
 */
function shuffleCopy<T>(items: T[], random: () => number = Math.random): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function uniqueStrings(ids: string[]): string[] {
  return Array.from(new Set(ids))
}

function assertValidConfig(config: SessionConfig): void {
  if (!Array.isArray(config.questionIds)) {
    throw new RepetitiveLearningError('questionIds must be an array of strings')
  }
  if (!config.questionIds.every((id) => typeof id === 'string' && id.length > 0)) {
    throw new RepetitiveLearningError('Every questionId must be a non-empty string')
  }
  if (
    !Number.isInteger(config.totalQuestions) ||
    config.totalQuestions < 1
  ) {
    throw new RepetitiveLearningError('totalQuestions must be a positive integer')
  }
  const validModes: SessionMode[] = [
    'practice',
    'review-mistakes',
    'exam',
    'guest',
  ]
  if (!validModes.includes(config.mode)) {
    throw new RepetitiveLearningError(
      `Invalid mode '${String(config.mode)}'. Expected one of: ${validModes.join(', ')}`
    )
  }
  if (
    config.mistakeBankIds !== undefined &&
    (!Array.isArray(config.mistakeBankIds) ||
      !config.mistakeBankIds.every((id) => typeof id === 'string'))
  ) {
    throw new RepetitiveLearningError('mistakeBankIds must be an array of strings')
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the initial question queue when a session starts.
 *
 * - `review-mistakes`: only mistake-bank IDs (capped at totalQuestions)
 * - `practice` / `exam` / `guest`: up to 40% from mistake bank (intersected
 *   with candidates), remainder filled from fresh/other candidates
 *
 * @param config - Session configuration
 * @returns Ordered QueueItem list
 * @throws {RepetitiveLearningError} on invalid config
 *
 * @example
 * buildSessionQueue({
 *   questionIds: ['a','b','c','d','e','f','g','h','i','j'],
 *   totalQuestions: 10,
 *   mode: 'practice',
 *   mistakeBankIds: ['a','b','c'],
 * })
 * // → up to 4 review items + 6 fresh
 */
export function buildSessionQueue(config: SessionConfig): QueueItem[] {
  assertValidConfig(config)

  const candidates = uniqueStrings(config.questionIds)
  const mistakeSet = new Set(config.mistakeBankIds ?? [])
  const total = Math.min(config.totalQuestions, candidates.length)

  if (total === 0) {
    return []
  }

  // Review-mistakes: only mistake bank
  if (config.mode === 'review-mistakes') {
    const reviewIds = shuffleCopy(
      candidates.filter((id) => mistakeSet.has(id))
    )
    if (reviewIds.length === 0) {
      throw new RepetitiveLearningError(
        'No mistake-bank questions available for review-mistakes mode'
      )
    }
    return reviewIds.slice(0, total).map((questionId) => ({
      questionId,
      isReview: true,
    }))
  }

  // Practice / exam / guest: up to 40% from mistake bank
  const maxReview = Math.floor(total * 0.4)
  const availableReview = shuffleCopy(
    candidates.filter((id) => mistakeSet.has(id))
  )
  const reviewPick = availableReview.slice(0, maxReview)
  const reviewSet = new Set(reviewPick)

  const freshPool = shuffleCopy(
    candidates.filter((id) => !reviewSet.has(id))
  )
  const freshNeeded = total - reviewPick.length
  const freshPick = freshPool.slice(0, freshNeeded)

  // If not enough fresh, top up from remaining review (beyond the 40% cap)
  const combined = [...reviewPick, ...freshPick]
  if (combined.length < total) {
    const leftoverReview = availableReview.filter((id) => !reviewSet.has(id))
    for (const id of leftoverReview) {
      if (combined.length >= total) break
      combined.push(id)
      reviewSet.add(id)
    }
  }

  // Still short? (fewer candidates than total — already capped)
  const queue = shuffleCopy(combined).slice(0, total).map((questionId) => ({
    questionId,
    isReview: reviewSet.has(questionId) && mistakeSet.has(questionId),
  }))

  return queue
}

/**
 * Process an answer within a live session queue.
 * Wrong answers are requeued `random(minGap, maxGap)` positions later.
 * Correct answers are not requeued.
 *
 * Returns a *description* of the requeue action; the caller applies it
 * to their queue copy (this function does not mutate `currentQueue`).
 *
 * @param params.questionId - Answered question
 * @param params.isCorrect - Whether the answer was correct
 * @param params.currentQueue - Current session queue (read-only)
 * @param params.currentIndex - Index of the answered item
 * @param params.minGap - Minimum requeue gap (default 3)
 * @param params.maxGap - Maximum requeue gap (default 4)
 * @returns Whether to requeue and the target index
 * @throws {RepetitiveLearningError} on invalid params
 *
 * @example
 * handleAnswer({
 *   questionId: 'q1',
 *   isCorrect: false,
 *   currentQueue: queue,
 *   currentIndex: 2,
 * })
 * // → { requeue: true, requeueAtIndex: 5 or 6 }
 */
export function handleAnswer(params: {
  questionId: string
  isCorrect: boolean
  currentQueue: QueueItem[]
  currentIndex: number
  minGap?: number
  maxGap?: number
}): HandleAnswerResult {
  const {
    questionId,
    isCorrect,
    currentQueue,
    currentIndex,
    minGap = 3,
    maxGap = 4,
  } = params

  if (typeof questionId !== 'string' || questionId.length === 0) {
    throw new RepetitiveLearningError('questionId must be a non-empty string')
  }
  if (typeof isCorrect !== 'boolean') {
    throw new RepetitiveLearningError('isCorrect must be a boolean')
  }
  if (!Array.isArray(currentQueue)) {
    throw new RepetitiveLearningError('currentQueue must be an array')
  }
  if (
    !Number.isInteger(currentIndex) ||
    currentIndex < 0 ||
    currentIndex >= currentQueue.length
  ) {
    throw new RepetitiveLearningError(
      `currentIndex ${currentIndex} is out of bounds for queue length ${currentQueue.length}`
    )
  }
  if (!Number.isInteger(minGap) || !Number.isInteger(maxGap) || minGap < 1) {
    throw new RepetitiveLearningError('minGap and maxGap must be positive integers')
  }
  if (maxGap < minGap) {
    throw new RepetitiveLearningError('maxGap must be >= minGap')
  }

  const current = currentQueue[currentIndex]
  if (current.questionId !== questionId) {
    throw new RepetitiveLearningError(
      `questionId '${questionId}' does not match queue item at index ${currentIndex} ('${current.questionId}')`
    )
  }

  if (isCorrect) {
    return { requeue: false, requeueAtIndex: null }
  }

  const gap = minGap + Math.floor(Math.random() * (maxGap - minGap + 1))
  // Insert after the gap relative to current position; clamp to end of queue
  const requeueAtIndex = Math.min(currentIndex + gap, currentQueue.length)

  return { requeue: true, requeueAtIndex }
}

/**
 * Apply a requeue result to produce a new queue (pure helper).
 * Inserts a review copy of the missed question at `requeueAtIndex`.
 *
 * @param currentQueue - Existing queue
 * @param questionId - Question to requeue
 * @param requeueAtIndex - Insertion index from handleAnswer
 * @returns New queue with the review item inserted
 *
 * @example
 * const { requeue, requeueAtIndex } = handleAnswer(...)
 * if (requeue && requeueAtIndex !== null) {
 *   queue = applyRequeue(queue, questionId, requeueAtIndex)
 * }
 */
export function applyRequeue(
  currentQueue: QueueItem[],
  questionId: string,
  requeueAtIndex: number
): QueueItem[] {
  if (!Array.isArray(currentQueue)) {
    throw new RepetitiveLearningError('currentQueue must be an array')
  }
  if (typeof questionId !== 'string' || questionId.length === 0) {
    throw new RepetitiveLearningError('questionId must be a non-empty string')
  }
  if (
    !Number.isInteger(requeueAtIndex) ||
    requeueAtIndex < 0 ||
    requeueAtIndex > currentQueue.length
  ) {
    throw new RepetitiveLearningError(
      `requeueAtIndex ${requeueAtIndex} is out of bounds`
    )
  }

  const next = [...currentQueue]
  next.splice(requeueAtIndex, 0, { questionId, isReview: true })
  return next
}

/**
 * Calculate the next review timestamp for spaced repetition.
 *
 * Rules:
 * - wrong → tomorrow (+1 day)
 * - learning (level 1 / 1 consecutive) → +1 day
 * - familiar (level 2 / 2 consecutive) → +3 days
 * - mastered (level 3 / 3+ consecutive) → +7 days
 *
 * @param params.masteryLevel - Current mastery (0–3)
 * @param params.wasCorrect - Whether the latest attempt was correct
 * @param params.consecutiveCorrect - Consecutive correct count AFTER this attempt
 * @returns Date for next_review_at
 * @throws {RepetitiveLearningError} on invalid params
 *
 * @example
 * calculateNextReview({ masteryLevel: 3, wasCorrect: true, consecutiveCorrect: 3 })
 * // → Date ~7 days from now
 */
export function calculateNextReview(params: {
  masteryLevel: MasteryLevel
  wasCorrect: boolean
  consecutiveCorrect: number
}): Date {
  const { masteryLevel, wasCorrect, consecutiveCorrect } = params

  if (![0, 1, 2, 3].includes(masteryLevel)) {
    throw new RepetitiveLearningError('masteryLevel must be 0 | 1 | 2 | 3')
  }
  if (typeof wasCorrect !== 'boolean') {
    throw new RepetitiveLearningError('wasCorrect must be a boolean')
  }
  if (
    !Number.isInteger(consecutiveCorrect) ||
    consecutiveCorrect < 0
  ) {
    throw new RepetitiveLearningError(
      'consecutiveCorrect must be a non-negative integer'
    )
  }

  const now = new Date()
  let days = 1

  if (!wasCorrect) {
    days = 1
  } else if (masteryLevel === 3 || consecutiveCorrect >= 3) {
    days = 7
  } else if (masteryLevel === 2 || consecutiveCorrect >= 2) {
    days = 3
  } else {
    days = 1
  }

  const next = new Date(now.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

/**
 * Determine the next mastery level after an attempt.
 *
 * Uses `consecutiveCorrect` from BEFORE this attempt (matches DB trigger semantics):
 * - wrong → level 1 (learning)
 * - correct and previous consecutive ≥ 2 → level 3 (mastered; now 3 in a row)
 * - correct otherwise → level 2 (familiar)
 *
 * @param params.currentLevel - Level before this attempt
 * @param params.wasCorrect - Whether this attempt was correct
 * @param params.consecutiveCorrect - Consecutive correct count BEFORE this attempt
 * @returns Updated MasteryLevel
 * @throws {RepetitiveLearningError} on invalid params
 *
 * @example
 * updateMasteryLevel({ currentLevel: 2, wasCorrect: true, consecutiveCorrect: 2 })
 * // → 3 (mastered)
 *
 * updateMasteryLevel({ currentLevel: 2, wasCorrect: false, consecutiveCorrect: 2 })
 * // → 1 (back to learning)
 */
export function updateMasteryLevel(params: {
  currentLevel: MasteryLevel
  wasCorrect: boolean
  consecutiveCorrect: number
}): MasteryLevel {
  const { currentLevel, wasCorrect, consecutiveCorrect } = params

  if (![0, 1, 2, 3].includes(currentLevel)) {
    throw new RepetitiveLearningError('currentLevel must be 0 | 1 | 2 | 3')
  }
  if (typeof wasCorrect !== 'boolean') {
    throw new RepetitiveLearningError('wasCorrect must be a boolean')
  }
  if (
    !Number.isInteger(consecutiveCorrect) ||
    consecutiveCorrect < 0
  ) {
    throw new RepetitiveLearningError(
      'consecutiveCorrect must be a non-negative integer'
    )
  }

  if (!wasCorrect) {
    return 1
  }

  // After this correct answer, streak becomes consecutiveCorrect + 1
  if (consecutiveCorrect >= 2) {
    return 3
  }

  return 2
}
