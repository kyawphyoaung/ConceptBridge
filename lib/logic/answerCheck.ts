/**
 * Answer comparison with normalization and spelling suggestions (Section 7.2).
 * Pure TypeScript — no React, no Supabase, no I/O.
 *
 * @example
 * checkAnswer({
 *   userAnswer: '  general  post office. ',
 *   correctAnswer: 'General Post Office',
 * })
 * // → { isCorrect: true, notes: ['Whitespace normalized', 'Case ignored', ...] }
 */

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Thrown when answer-check inputs are invalid.
 */
export class AnswerCheckError extends Error {
  readonly name = 'AnswerCheckError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SpellingSuggestion = {
  wrongWord: string
  suggestedWord: string
  distance: number
}

export type AnswerCheckResult = {
  isCorrect: boolean
  normalizedUser: string
  normalizedCorrect: string
  spellingSuggestion?: SpellingSuggestion | null
  notes?: string[]
}

export type AnswerCheckOptions = {
  /** Compare with case sensitivity. Default: false */
  caseSensitive?: boolean
  /** Strip punctuation before comparing. Default: true */
  ignorePunctuation?: boolean
  /** Run Levenshtein spelling suggestion on mismatch. Default: true */
  allowSpellingSuggestion?: boolean
  /** Max edit distance for a spelling suggestion. Default: 2 */
  maxSpellingDistance?: number
}

type NormalizeOptions = {
  ignorePunctuation?: boolean
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Normalize text for comparison: trim, collapse whitespace,
 * optionally strip punctuation.
 *
 * @param text - Raw user or correct answer
 * @param options.ignorePunctuation - Remove punctuation chars (default true)
 * @returns Normalized string
 * @throws {AnswerCheckError} if text is not a string
 *
 * @example
 * normalizeText('  Hello,   world! ') // → 'Hello world'
 */
export function normalizeText(
  text: string,
  options: NormalizeOptions = {}
): string {
  if (typeof text !== 'string') {
    throw new AnswerCheckError('Text must be a string')
  }

  const ignorePunctuation = options.ignorePunctuation ?? true
  let result = text.trim().replace(/\s+/g, ' ')

  if (ignorePunctuation) {
    // Remove punctuation but keep letters, numbers, spaces, and Myanmar chars
    result = result
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return result
}

/**
 * Compute the Levenshtein edit distance between two strings.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Minimum number of single-character edits
 * @throws {AnswerCheckError} if either argument is not a string
 *
 * @example
 * levenshteinDistance('beautifull', 'beautiful') // → 1
 */
export function levenshteinDistance(a: string, b: string): number {
  if (typeof a !== 'string' || typeof b !== 'string') {
    throw new AnswerCheckError('Both arguments to levenshteinDistance must be strings')
  }

  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Ensure a is the shorter string for memory
  let s = a
  let t = b
  if (s.length > t.length) {
    s = b
    t = a
  }

  const sLen = s.length
  const tLen = t.length
  let prev = new Array<number>(sLen + 1)
  let curr = new Array<number>(sLen + 1)

  for (let i = 0; i <= sLen; i += 1) {
    prev[i] = i
  }

  for (let j = 1; j <= tLen; j += 1) {
    curr[0] = j
    for (let i = 1; i <= sLen; i += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      curr[i] = Math.min(
        prev[i] + 1, // deletion
        curr[i - 1] + 1, // insertion
        prev[i - 1] + cost // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }

  return prev[sLen]
}

/**
 * Find a single-word spelling suggestion by comparing aligned words
 * with Levenshtein distance ≤ maxDistance.
 *
 * @param userText - Normalized user answer
 * @param correctText - Normalized correct answer
 * @param maxDistance - Maximum edit distance (inclusive)
 * @returns Suggestion object or null if none found
 *
 * @example
 * findSpellingSuggestion('beautifull rainbow', 'beautiful rainbow', 2)
 * // → { wrongWord: 'beautifull', suggestedWord: 'beautiful', distance: 1 }
 */
export function findSpellingSuggestion(
  userText: string,
  correctText: string,
  maxDistance: number
): SpellingSuggestion | null {
  if (typeof userText !== 'string' || typeof correctText !== 'string') {
    throw new AnswerCheckError('Both texts must be strings')
  }
  if (!Number.isFinite(maxDistance) || maxDistance < 0) {
    throw new AnswerCheckError('maxDistance must be a non-negative number')
  }

  const userWords = userText.split(' ').filter((w) => w.length > 0)
  const correctWords = correctText.split(' ').filter((w) => w.length > 0)

  if (userWords.length === 0 || correctWords.length === 0) {
    return null
  }

  // Prefer same-index comparison when lengths match; otherwise scan all pairs
  const pairCount = Math.min(userWords.length, correctWords.length)
  let best: SpellingSuggestion | null = null

  for (let i = 0; i < pairCount; i += 1) {
    const wrong = userWords[i]
    const suggested = correctWords[i]
    if (wrong === suggested) continue

    const distance = levenshteinDistance(wrong.toLowerCase(), suggested.toLowerCase())
    if (distance > 0 && distance <= maxDistance) {
      if (best === null || distance < best.distance) {
        best = { wrongWord: wrong, suggestedWord: suggested, distance }
      }
    }
  }

  // If lengths differ, also check unmatched user words against all correct words
  if (best === null && userWords.length !== correctWords.length) {
    for (const wrong of userWords) {
      for (const suggested of correctWords) {
        if (wrong.toLowerCase() === suggested.toLowerCase()) continue
        const distance = levenshteinDistance(
          wrong.toLowerCase(),
          suggested.toLowerCase()
        )
        if (distance > 0 && distance <= maxDistance) {
          if (best === null || distance < best.distance) {
            best = { wrongWord: wrong, suggestedWord: suggested, distance }
          }
        }
      }
    }
  }

  return best
}

/**
 * Compare a user answer against the correct answer (and optional alternatives).
 * Applies whitespace / case / punctuation normalization and optional
 * spelling suggestions on mismatch.
 *
 * @param params.userAnswer - What the user typed
 * @param params.correctAnswer - Canonical correct answer
 * @param params.acceptableAnswers - Extra accepted variants
 * @param params.options - Comparison options
 * @returns Detailed AnswerCheckResult
 * @throws {AnswerCheckError} on invalid input types
 *
 * @example
 * checkAnswer({
 *   userAnswer: 'general post office',
 *   correctAnswer: 'General Post Office',
 * })
 * // → { isCorrect: true, ... }
 *
 * @example
 * checkAnswer({
 *   userAnswer: 'General Post',
 *   correctAnswer: 'General Post Office',
 * })
 * // → { isCorrect: false, notes: ['Answer appears incomplete — missing words'] }
 */
export function checkAnswer(params: {
  userAnswer: string
  correctAnswer: string
  acceptableAnswers?: string[]
  options?: AnswerCheckOptions
}): AnswerCheckResult {
  const { userAnswer, correctAnswer, acceptableAnswers, options } = params

  if (typeof userAnswer !== 'string') {
    throw new AnswerCheckError('userAnswer must be a string')
  }
  if (typeof correctAnswer !== 'string') {
    throw new AnswerCheckError('correctAnswer must be a string')
  }
  if (
    acceptableAnswers !== undefined &&
    (!Array.isArray(acceptableAnswers) ||
      !acceptableAnswers.every((a) => typeof a === 'string'))
  ) {
    throw new AnswerCheckError('acceptableAnswers must be an array of strings')
  }

  const caseSensitive = options?.caseSensitive ?? false
  const ignorePunctuation = options?.ignorePunctuation ?? true
  const allowSpellingSuggestion = options?.allowSpellingSuggestion ?? true
  const maxSpellingDistance = options?.maxSpellingDistance ?? 2

  const notes: string[] = []
  const normOpts: NormalizeOptions = { ignorePunctuation }

  const rawUser = userAnswer
  const rawCorrect = correctAnswer

  // Track what normalizations applied
  if (rawUser.trim() !== rawUser || /\s{2,}/.test(rawUser)) {
    notes.push('Whitespace normalized')
  }
  if (!caseSensitive && rawUser !== rawUser.toLowerCase()) {
    notes.push('Case ignored')
  }
  if (
    ignorePunctuation &&
    /[^\p{L}\p{N}\s]/u.test(rawUser.trim())
  ) {
    notes.push('Punctuation ignored')
  }

  let normalizedUser = normalizeText(userAnswer, normOpts)
  let normalizedCorrect = normalizeText(correctAnswer, normOpts)

  if (!caseSensitive) {
    normalizedUser = normalizedUser.toLowerCase()
    normalizedCorrect = normalizedCorrect.toLowerCase()
  }

  const candidates = [normalizedCorrect]
  if (acceptableAnswers) {
    for (const alt of acceptableAnswers) {
      let n = normalizeText(alt, normOpts)
      if (!caseSensitive) n = n.toLowerCase()
      candidates.push(n)
    }
  }

  // Empty user answer
  if (normalizedUser.length === 0) {
    return {
      isCorrect: false,
      normalizedUser,
      normalizedCorrect,
      spellingSuggestion: null,
      notes: [...notes, 'Empty answer'],
    }
  }

  const isCorrect = candidates.includes(normalizedUser)

  if (isCorrect) {
    return {
      isCorrect: true,
      normalizedUser,
      normalizedCorrect,
      spellingSuggestion: null,
      notes: notes.length > 0 ? notes : undefined,
    }
  }

  // Partial / missing words note
  const userWords = normalizedUser.split(' ').filter((w) => w.length > 0)
  const correctWords = normalizedCorrect.split(' ').filter((w) => w.length > 0)
  if (
    userWords.length < correctWords.length &&
    userWords.every((w, i) => w === correctWords[i])
  ) {
    notes.push('Answer appears incomplete — missing words')
  } else if (
    userWords.length > correctWords.length &&
    correctWords.every((w, i) => w === userWords[i])
  ) {
    notes.push('Answer has extra words')
  }

  let spellingSuggestion: SpellingSuggestion | null = null
  if (allowSpellingSuggestion) {
    spellingSuggestion = findSpellingSuggestion(
      normalizedUser,
      normalizedCorrect,
      maxSpellingDistance
    )
    if (spellingSuggestion) {
      notes.push(
        `Possible spelling error: '${spellingSuggestion.wrongWord}' → '${spellingSuggestion.suggestedWord}'`
      )
    }
  }

  return {
    isCorrect: false,
    normalizedUser,
    normalizedCorrect,
    spellingSuggestion,
    notes: notes.length > 0 ? notes : undefined,
  }
}
