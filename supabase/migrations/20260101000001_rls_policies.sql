-- =============================================================================
-- Migration: 20260101000001_rls_policies.sql
-- Purpose: Enable RLS on every table and create all policies from Section 4.
-- Depends on: is_admin() from 20260101000000_initial_schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on all tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_thresholds ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- profiles
-- SELECT own | SELECT all (admin) | UPDATE own (restricted) | UPDATE all (admin)
-- INSERT: only via trigger (handle_new_user) — no INSERT policy for clients
-- =============================================================================

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Users cannot change role, total_score, or is_active on their own row
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND total_score = (SELECT p.total_score FROM public.profiles p WHERE p.id = auth.uid())
    AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- =============================================================================
-- Content tables (public read, admin write)
-- subjects, topics, questions, grammar_patterns, essays, essay_lines,
-- essay_terms, rank_thresholds
-- =============================================================================

-- ---------- subjects ----------
DROP POLICY IF EXISTS "subjects_select_public" ON public.subjects;
CREATE POLICY "subjects_select_public"
  ON public.subjects FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "subjects_insert_admin" ON public.subjects;
CREATE POLICY "subjects_insert_admin"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "subjects_update_admin" ON public.subjects;
CREATE POLICY "subjects_update_admin"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "subjects_delete_admin" ON public.subjects;
CREATE POLICY "subjects_delete_admin"
  ON public.subjects FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- topics ----------
DROP POLICY IF EXISTS "topics_select_public" ON public.topics;
CREATE POLICY "topics_select_public"
  ON public.topics FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "topics_insert_admin" ON public.topics;
CREATE POLICY "topics_insert_admin"
  ON public.topics FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "topics_update_admin" ON public.topics;
CREATE POLICY "topics_update_admin"
  ON public.topics FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "topics_delete_admin" ON public.topics;
CREATE POLICY "topics_delete_admin"
  ON public.topics FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- questions ----------
DROP POLICY IF EXISTS "questions_select_public" ON public.questions;
CREATE POLICY "questions_select_public"
  ON public.questions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "questions_insert_admin" ON public.questions;
CREATE POLICY "questions_insert_admin"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "questions_update_admin" ON public.questions;
CREATE POLICY "questions_update_admin"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "questions_delete_admin" ON public.questions;
CREATE POLICY "questions_delete_admin"
  ON public.questions FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- grammar_patterns ----------
DROP POLICY IF EXISTS "grammar_patterns_select_public" ON public.grammar_patterns;
CREATE POLICY "grammar_patterns_select_public"
  ON public.grammar_patterns FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "grammar_patterns_insert_admin" ON public.grammar_patterns;
CREATE POLICY "grammar_patterns_insert_admin"
  ON public.grammar_patterns FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "grammar_patterns_update_admin" ON public.grammar_patterns;
CREATE POLICY "grammar_patterns_update_admin"
  ON public.grammar_patterns FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "grammar_patterns_delete_admin" ON public.grammar_patterns;
CREATE POLICY "grammar_patterns_delete_admin"
  ON public.grammar_patterns FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- essays ----------
DROP POLICY IF EXISTS "essays_select_public" ON public.essays;
CREATE POLICY "essays_select_public"
  ON public.essays FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "essays_insert_admin" ON public.essays;
CREATE POLICY "essays_insert_admin"
  ON public.essays FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "essays_update_admin" ON public.essays;
CREATE POLICY "essays_update_admin"
  ON public.essays FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "essays_delete_admin" ON public.essays;
CREATE POLICY "essays_delete_admin"
  ON public.essays FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- essay_lines ----------
DROP POLICY IF EXISTS "essay_lines_select_public" ON public.essay_lines;
CREATE POLICY "essay_lines_select_public"
  ON public.essay_lines FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "essay_lines_insert_admin" ON public.essay_lines;
CREATE POLICY "essay_lines_insert_admin"
  ON public.essay_lines FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "essay_lines_update_admin" ON public.essay_lines;
CREATE POLICY "essay_lines_update_admin"
  ON public.essay_lines FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "essay_lines_delete_admin" ON public.essay_lines;
CREATE POLICY "essay_lines_delete_admin"
  ON public.essay_lines FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- essay_terms ----------
DROP POLICY IF EXISTS "essay_terms_select_public" ON public.essay_terms;
CREATE POLICY "essay_terms_select_public"
  ON public.essay_terms FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "essay_terms_insert_admin" ON public.essay_terms;
CREATE POLICY "essay_terms_insert_admin"
  ON public.essay_terms FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "essay_terms_update_admin" ON public.essay_terms;
CREATE POLICY "essay_terms_update_admin"
  ON public.essay_terms FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "essay_terms_delete_admin" ON public.essay_terms;
CREATE POLICY "essay_terms_delete_admin"
  ON public.essay_terms FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- rank_thresholds ----------
DROP POLICY IF EXISTS "rank_thresholds_select_public" ON public.rank_thresholds;
CREATE POLICY "rank_thresholds_select_public"
  ON public.rank_thresholds FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "rank_thresholds_insert_admin" ON public.rank_thresholds;
CREATE POLICY "rank_thresholds_insert_admin"
  ON public.rank_thresholds FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "rank_thresholds_update_admin" ON public.rank_thresholds;
CREATE POLICY "rank_thresholds_update_admin"
  ON public.rank_thresholds FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "rank_thresholds_delete_admin" ON public.rank_thresholds;
CREATE POLICY "rank_thresholds_delete_admin"
  ON public.rank_thresholds FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================================================
-- User-owned tables: quiz_attempts, user_progress, sessions
-- SELECT own | SELECT all (admin) | INSERT own | UPDATE own | DELETE admin
-- =============================================================================

-- ---------- quiz_attempts ----------
DROP POLICY IF EXISTS "quiz_attempts_select_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_select_admin" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_select_admin"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_update_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_update_own"
  ON public.quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_delete_admin" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_delete_admin"
  ON public.quiz_attempts FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- user_progress ----------
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
CREATE POLICY "user_progress_select_own"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_select_admin" ON public.user_progress;
CREATE POLICY "user_progress_select_admin"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
CREATE POLICY "user_progress_insert_own"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
CREATE POLICY "user_progress_update_own"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_delete_admin" ON public.user_progress;
CREATE POLICY "user_progress_delete_admin"
  ON public.user_progress FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------- sessions ----------
DROP POLICY IF EXISTS "sessions_select_own" ON public.sessions;
CREATE POLICY "sessions_select_own"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_select_admin" ON public.sessions;
CREATE POLICY "sessions_select_admin"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "sessions_insert_own" ON public.sessions;
CREATE POLICY "sessions_insert_own"
  ON public.sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_update_own" ON public.sessions;
CREATE POLICY "sessions_update_own"
  ON public.sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_delete_admin" ON public.sessions;
CREATE POLICY "sessions_delete_admin"
  ON public.sessions FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
