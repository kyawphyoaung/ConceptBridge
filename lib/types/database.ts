/**
 * ConceptBridge database TypeScript types.
 * Field names use snake_case to match Supabase/PostgreSQL columns (Section 3).
 *
 * @example
 * import type { Profile, Question, QuestionData } from '@/lib/types/database'
 */

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

/** User role stored in profiles.role */
export type Role = 'user' | 'admin'

/**
 * Question type stored in questions.question_type.
 * See Section 3.4.1 for question_data shapes.
 */
export type QuestionType =
  | 'flashcard'
  | 'sentence-transform'
  | 'mcq'
  | 'simile-fill'
  | 'idiom-transform'
  | 'truth-table'
  | 'quantification'
  | 'essay-question'

/**
 * Topic type stored in topics.topic_type.
 * Matches the SQL CHECK constraint.
 */
export type TopicType =
  | 'flashcard'
  | 'sentence-transform'
  | 'mcq'
  | 'essay'
  | 'truth-table'
  | 'quantification'
  | 'drag-drop'

/** Topic practice mode (Philo papers / logic). Null for English topics. */
export type TopicMode = 'mcq' | 'qa' | 'logic-truth-table' | 'logic-quantification'

/** Session mode stored in sessions.session_mode */
export type SessionMode = 'practice' | 'review-mistakes' | 'exam' | 'guest'

/**
 * Mastery level for user_progress.mastery_level.
 * 0 = unseen, 1 = learning, 2 = familiar, 3 = mastered
 */
export type MasteryLevel = 0 | 1 | 2 | 3

/** Rank name derived from total_score thresholds */
export type RankName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

/** Grammar pattern category */
export type GrammarCategory =
  | 'modal'
  | 'tense'
  | 'causative'
  | 'wish'
  | 'third-person'
  | 'interrogative'
  | 'deduction'

/** Truth-table classification (Section 7.4.1) */
export type TruthClassification = 'tautology' | 'contradiction' | 'contingency'

// ---------------------------------------------------------------------------
// question_data JSONB shapes (Section 3.4.1)
// ---------------------------------------------------------------------------

/** Flashcard (Abbreviations) */
export type FlashcardData = {
  term: string
  definition: string
  category: string
}

/** Sentence transform (Grammar rewriting) */
export type SentenceTransformData = {
  original: string
  answer: string
  transformation_hint: string
  grammar_tags: string[]
}

/** Multiple choice (Philo MCQ, Theory MCQ) */
export type MCQData = {
  options: string[]
  correct_index: number
  passage_id: string | null
}

/** Simile fill-in-the-blank */
export type SimileFillData = {
  sentence: string
  answer: string
  hint_context: string
  acceptable_answers: string[]
}

/** Idiom transform (sentence) + optional word-level fields for MCQ */
export type IdiomTransformData = {
  original: string
  answer: string
  idiom: string
  original_word?: string
  idiom_word?: string
}

/** Propositional logic truth table */
export type TruthTableData = {
  expression: string
  variables: string[]
  correct_truth_values: string[]
  classification: TruthClassification
  explanation: string
}

/** Quantificational logic drag-and-drop */
export type QuantificationData = {
  premises: string[]
  available_components: string[]
  correct_answer: string
  rule_applied: string
}

/** Essay-linked question (Philo) */
export type EssayQuestionData = {
  paper_code: string
  essay_id: string
}

/** Discriminated union of all question_data shapes */
export type QuestionData =
  | FlashcardData
  | SentenceTransformData
  | MCQData
  | SimileFillData
  | IdiomTransformData
  | TruthTableData
  | QuantificationData
  | EssayQuestionData

/** Grammar pattern example entry in examples JSONB */
export type GrammarExample = {
  from: string
  to: string
  note: string
}

// ---------------------------------------------------------------------------
// Table row types (Section 3.1–3.12)
// ---------------------------------------------------------------------------

/** 3.1 profiles — extends auth.users */
export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  role: Role
  is_guest: boolean
  is_active: boolean
  total_score: number
  current_streak: number
  longest_streak: number
  rank: RankName | string
  theme_preference: string
  dark_mode: boolean
  created_at: string
  updated_at: string
  last_active_at: string
}

/** 3.2 subjects */
export type Subject = {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
}

/** 3.3 topics */
export type Topic = {
  id: string
  subject_id: string
  slug: string
  name: string
  description: string | null
  topic_type: TopicType
  display_order: number
  is_active: boolean
  group_slug?: string | null
  group_name?: string | null
  group_subtitle?: string | null
  group_order?: number | null
  mode?: TopicMode | null
}

/** 3.4 questions */
export type Question = {
  id: string
  topic_id: string
  question_type: QuestionType
  prompt: string
  correct_answer: string | null
  explanation: string | null
  grammar_pattern_id: string | null
  difficulty: number
  question_data: QuestionData
  display_order: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

/** 3.5 grammar_patterns */
export type GrammarPattern = {
  id: string
  slug: string
  name: string
  category: GrammarCategory
  trigger_words: string[]
  target_auxiliary: string | null
  transformation_rules: Record<string, unknown>
  explanation_mm: string | null
  explanation_en: string | null
  examples: GrammarExample[]
}

/** 3.6 essays */
export type Essay = {
  id: string
  subject_id: string
  paper_code: string | null
  title: string
  /** Exam question text shown above the answer body */
  question: string | null
  content_en: string | null
  content_mm: string | null
  display_order: number
  is_active: boolean
}

/** Seed shape for Philo Questions & Answers essays */
export type PhiloQASeed = {
  topic_slug: string
  paper_code: string
  title: string
  question: string
  content_en: string | null
  content_mm: string | null
  lines: Array<{ line_en: string; line_mm: string }>
  terms: Array<{
    term: string
    definition_en: string
    definition_mm: string
  }>
}

/** 3.7 essay_lines */
export type EssayLine = {
  id: string
  essay_id: string
  line_number: number
  line_en: string
  line_mm: string | null
  created_at: string
}

/** 3.8 essay_terms */
export type EssayTerm = {
  id: string
  essay_id: string
  term: string
  definition_mm: string | null
  definition_en: string | null
  occurrence_line: number | null
}

/** 3.9 quiz_attempts */
export type QuizAttempt = {
  id: string
  user_id: string
  question_id: string
  topic_id: string
  session_id: string | null
  user_answer: string | null
  is_correct: boolean
  time_taken_seconds: number | null
  attempt_number: number
  created_at: string
}

/** 3.10 user_progress */
export type UserProgress = {
  id: string
  user_id: string
  question_id: string
  times_attempted: number
  times_correct: number
  consecutive_correct: number
  last_attempted_at: string | null
  next_review_at: string | null
  mastery_level: MasteryLevel
  is_in_mistake_bank: boolean
}

/** 3.11 sessions */
export type Session = {
  id: string
  user_id: string | null
  subject_id: string
  topic_id: string | null
  session_mode: SessionMode
  questions_planned: number
  questions_completed: number
  correct_count: number
  score_earned: number
  started_at: string
  completed_at: string | null
}

/** 3.12 rank_thresholds */
export type RankThreshold = {
  id: string
  rank_name: RankName | string
  min_score: number
  display_order: number
  color: string
  icon: string | null
}

// ---------------------------------------------------------------------------
// Insert / Update helpers (optional fields omitted for inserts)
// ---------------------------------------------------------------------------

export type ProfileInsert = Omit<
  Profile,
  | 'role'
  | 'is_guest'
  | 'is_active'
  | 'total_score'
  | 'current_streak'
  | 'longest_streak'
  | 'rank'
  | 'theme_preference'
  | 'dark_mode'
  | 'created_at'
  | 'updated_at'
  | 'last_active_at'
> &
  Partial<
    Pick<
      Profile,
      | 'role'
      | 'is_guest'
      | 'is_active'
      | 'total_score'
      | 'current_streak'
      | 'longest_streak'
      | 'rank'
      | 'theme_preference'
      | 'dark_mode'
    >
  >

export type ProfileUpdate = Partial<
  Omit<Profile, 'id' | 'created_at'>
>

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/**
 * Type guard: narrow unknown to FlashcardData.
 */
export function isFlashcardData(data: unknown): data is FlashcardData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.term === 'string' &&
    typeof d.definition === 'string' &&
    typeof d.category === 'string'
  )
}

/**
 * Type guard: narrow unknown to MCQData.
 */
export function isMCQData(data: unknown): data is MCQData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.options) &&
    d.options.every((o) => typeof o === 'string') &&
    typeof d.correct_index === 'number' &&
    (d.passage_id === null || typeof d.passage_id === 'string')
  )
}

/**
 * Type guard: narrow unknown to TruthTableData.
 */
export function isTruthTableData(data: unknown): data is TruthTableData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.expression === 'string' &&
    Array.isArray(d.variables) &&
    Array.isArray(d.correct_truth_values) &&
    (d.classification === 'tautology' ||
      d.classification === 'contradiction' ||
      d.classification === 'contingency')
  )
}

/**
 * Type guard: narrow unknown to QuantificationData.
 */
export function isQuantificationData(data: unknown): data is QuantificationData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.premises) &&
    Array.isArray(d.available_components) &&
    typeof d.correct_answer === 'string' &&
    typeof d.rule_applied === 'string'
  )
}

/**
 * Type guard: narrow unknown to SimileFillData.
 */
export function isSimileFillData(data: unknown): data is SimileFillData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.sentence === 'string' &&
    typeof d.answer === 'string' &&
    typeof d.hint_context === 'string' &&
    Array.isArray(d.acceptable_answers)
  )
}

/**
 * Type guard: narrow unknown to SentenceTransformData.
 */
export function isSentenceTransformData(
  data: unknown
): data is SentenceTransformData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.original === 'string' &&
    typeof d.answer === 'string' &&
    typeof d.transformation_hint === 'string' &&
    Array.isArray(d.grammar_tags)
  )
}

/**
 * Type guard: narrow unknown to IdiomTransformData.
 */
export function isIdiomTransformData(data: unknown): data is IdiomTransformData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.original === 'string' &&
    typeof d.answer === 'string' &&
    typeof d.idiom === 'string'
  )
}

/**
 * Type guard: narrow unknown to EssayQuestionData.
 */
export function isEssayQuestionData(data: unknown): data is EssayQuestionData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return typeof d.paper_code === 'string' && typeof d.essay_id === 'string'
}
