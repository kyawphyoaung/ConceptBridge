-- =============================================================================
-- Migration: 20260101000000_initial_schema.sql
-- Purpose: Create all ConceptBridge tables (Section 3.1–3.12) plus indexes
--          and the is_admin() helper (Section 4).
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 3.1 profiles — extends auth.users; auto-created via trigger on signup
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_guest boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  total_score integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  rank text NOT NULL DEFAULT 'Bronze',
  theme_preference text NOT NULL DEFAULT 'default',
  dark_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_total_score ON public.profiles(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- -----------------------------------------------------------------------------
-- 3.2 subjects — top-level categories (English, Philo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_subjects_slug ON public.subjects(slug);
CREATE INDEX IF NOT EXISTS idx_subjects_display_order ON public.subjects(display_order);

-- -----------------------------------------------------------------------------
-- 3.3 topics — subcategories under a subject
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  topic_type text NOT NULL CHECK (
    topic_type IN (
      'flashcard',
      'sentence-transform',
      'mcq',
      'essay',
      'truth-table',
      'quantification',
      'drag-drop'
    )
  ),
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (subject_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_topic_type ON public.topics(topic_type);
CREATE INDEX IF NOT EXISTS idx_topics_display_order ON public.topics(display_order);

-- -----------------------------------------------------------------------------
-- 3.5 grammar_patterns — created before questions (FK dependency)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grammar_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'modal',
      'tense',
      'causative',
      'wish',
      'third-person',
      'interrogative',
      'deduction'
    )
  ),
  trigger_words text[] NOT NULL DEFAULT '{}',
  target_auxiliary text,
  transformation_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  explanation_mm text,
  explanation_en text,
  examples jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_grammar_patterns_slug ON public.grammar_patterns(slug);
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_category ON public.grammar_patterns(category);

-- -----------------------------------------------------------------------------
-- 3.4 questions — universal question table with JSONB type-specific data
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question_type text NOT NULL,
  prompt text NOT NULL,
  correct_answer text,
  explanation text,
  grammar_pattern_id uuid REFERENCES public.grammar_patterns(id) ON DELETE SET NULL,
  difficulty integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  question_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_grammar_pattern_id ON public.questions(grammar_pattern_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_display_order ON public.questions(display_order);

-- -----------------------------------------------------------------------------
-- 3.6 essays — essay content (English + Philo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  paper_code text,
  title text NOT NULL,
  content_en text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_essays_subject_id ON public.essays(subject_id);
CREATE INDEX IF NOT EXISTS idx_essays_paper_code ON public.essays(paper_code);
CREATE INDEX IF NOT EXISTS idx_essays_display_order ON public.essays(display_order);
CREATE INDEX IF NOT EXISTS idx_essays_is_active ON public.essays(is_active);

-- -----------------------------------------------------------------------------
-- 3.7 essay_lines — line-by-line EN + MM translation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.essay_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL REFERENCES public.essays(id) ON DELETE CASCADE,
  line_number integer NOT NULL,
  line_en text NOT NULL,
  line_mm text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (essay_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_essay_lines_essay_id ON public.essay_lines(essay_id);

-- -----------------------------------------------------------------------------
-- 3.8 essay_terms — difficult vocabulary in essays
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.essay_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL REFERENCES public.essays(id) ON DELETE CASCADE,
  term text NOT NULL,
  definition_mm text,
  definition_en text,
  occurrence_line integer
);

CREATE INDEX IF NOT EXISTS idx_essay_terms_essay_id ON public.essay_terms(essay_id);

-- -----------------------------------------------------------------------------
-- 3.9 quiz_attempts — every answer a user gives
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  session_id uuid,
  user_answer text,
  is_correct boolean NOT NULL,
  time_taken_seconds integer,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question_id ON public.quiz_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic_id ON public.quiz_attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_id ON public.quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_question ON public.quiz_attempts(user_id, question_id);

-- -----------------------------------------------------------------------------
-- 3.10 user_progress — per-question progress for repetitive learning
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  times_attempted integer NOT NULL DEFAULT 0,
  times_correct integer NOT NULL DEFAULT 0,
  consecutive_correct integer NOT NULL DEFAULT 0,
  last_attempted_at timestamptz,
  next_review_at timestamptz,
  mastery_level integer NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 3),
  is_in_mistake_bank boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_question_id ON public.user_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_mistake_bank ON public.user_progress(user_id, is_in_mistake_bank)
  WHERE is_in_mistake_bank = true;
CREATE INDEX IF NOT EXISTS idx_user_progress_next_review ON public.user_progress(next_review_at)
  WHERE next_review_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_progress_mastery ON public.user_progress(user_id, mastery_level);

-- -----------------------------------------------------------------------------
-- 3.11 sessions — quiz session metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  session_mode text NOT NULL CHECK (
    session_mode IN ('practice', 'review-mistakes', 'exam', 'guest')
  ),
  questions_planned integer NOT NULL DEFAULT 10,
  questions_completed integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  score_earned integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject_id ON public.sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_topic_id ON public.sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_session_mode ON public.sessions(session_mode);

-- Add FK from quiz_attempts.session_id → sessions (deferred until sessions exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quiz_attempts_session_id_fkey'
  ) THEN
    ALTER TABLE public.quiz_attempts
      ADD CONSTRAINT quiz_attempts_session_id_fkey
      FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3.12 rank_thresholds — configurable rank cutoffs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rank_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_name text NOT NULL UNIQUE,
  min_score integer NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  color text NOT NULL,
  icon text
);

CREATE INDEX IF NOT EXISTS idx_rank_thresholds_min_score ON public.rank_thresholds(min_score);
CREATE INDEX IF NOT EXISTS idx_rank_thresholds_display_order ON public.rank_thresholds(display_order);

-- -----------------------------------------------------------------------------
-- Section 4 helper: is_admin(uid) — used by RLS policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin(uuid) IS
  'Returns true if the given user id has role = admin in profiles.';
