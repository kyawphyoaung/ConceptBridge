-- =============================================================================
-- Migration: 20260101000002_triggers.sql
-- Purpose: Create triggers from Section 5:
--   5.1 handle_new_user()     — auth.users insert → create profile
--   5.2 handle_quiz_attempt() — quiz_attempts insert → progress + score
--   5.3 update_rank()         — profiles.total_score change → update rank
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5.1 On auth.users insert → create profile
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, is_guest)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'is_guest')::boolean, false)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5.2 On quiz_attempts insert → update user_progress + profile score/streak
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_quiz_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points int;
BEGIN
  -- Determine points based on question_type
  SELECT CASE q.question_type
    WHEN 'essay-question' THEN 15
    WHEN 'mcq' THEN 1
    WHEN 'sentence-transform' THEN 1
    WHEN 'simile-fill' THEN 1
    WHEN 'idiom-transform' THEN 1
    WHEN 'flashcard' THEN 1
    WHEN 'truth-table' THEN 2
    WHEN 'quantification' THEN 2
    ELSE 1
  END INTO points
  FROM public.questions q
  WHERE q.id = NEW.question_id;

  -- Upsert user_progress
  INSERT INTO public.user_progress (
    user_id,
    question_id,
    times_attempted,
    times_correct,
    consecutive_correct,
    last_attempted_at,
    is_in_mistake_bank
  )
  VALUES (
    NEW.user_id,
    NEW.question_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    now(),
    NOT NEW.is_correct
  )
  ON CONFLICT (user_id, question_id) DO UPDATE
  SET
    times_attempted = user_progress.times_attempted + 1,
    times_correct = user_progress.times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    consecutive_correct = CASE
      WHEN NEW.is_correct THEN user_progress.consecutive_correct + 1
      ELSE 0
    END,
    last_attempted_at = now(),
    is_in_mistake_bank = CASE
      WHEN NEW.is_correct AND user_progress.consecutive_correct >= 2 THEN false
      ELSE user_progress.is_in_mistake_bank
    END,
    mastery_level = CASE
      WHEN NEW.is_correct AND user_progress.consecutive_correct >= 2 THEN 3
      WHEN NEW.is_correct THEN 2
      ELSE 1
    END;

  -- Add score if correct (guest exclusion enforced at app level)
  IF NEW.is_correct THEN
    UPDATE public.profiles
    SET
      total_score = total_score + COALESCE(points, 1),
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      updated_at = now()
    WHERE id = NEW.user_id;
  ELSE
    UPDATE public.profiles
    SET
      current_streak = 0,
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_quiz_attempt_created ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_created
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_quiz_attempt();

-- -----------------------------------------------------------------------------
-- 5.3 Update rank before total_score changes on profiles
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_rank()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.rank := CASE
    WHEN NEW.total_score >= 1000 THEN 'Diamond'
    WHEN NEW.total_score >= 600 THEN 'Platinum'
    WHEN NEW.total_score >= 300 THEN 'Gold'
    WHEN NEW.total_score >= 100 THEN 'Silver'
    ELSE 'Bronze'
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_score_change ON public.profiles;
CREATE TRIGGER on_profile_score_change
  BEFORE UPDATE OF total_score ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rank();
