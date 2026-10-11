-- =============================================================================
-- Migration: 20260101000007_allow_mark_guest.sql
-- Purpose:
--   1) Allow non-admins to set is_guest = true (guest onboarding).
--   2) Let SECURITY DEFINER score triggers bypass privilege locks via
--      session setting `app.bypass_profile_guards`.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow trusted SECURITY DEFINER triggers (e.g. handle_quiz_attempt)
  IF current_setting('app.bypass_profile_guards', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
    NEW.total_score := OLD.total_score;
    NEW.is_active := OLD.is_active;
    -- Allow promoting self to guest (false → true) for anonymous onboarding.
    IF NOT (OLD.is_guest = false AND NEW.is_guest = true) THEN
      NEW.is_guest := OLD.is_guest;
    END IF;
    NEW.current_streak := OLD.current_streak;
    NEW.longest_streak := OLD.longest_streak;
    NEW.rank := OLD.rank;
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure quiz-attempt scoring can update score/streak/rank columns
CREATE OR REPLACE FUNCTION public.handle_quiz_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points int;
BEGIN
  -- Bypass privilege lock for this transaction-local update
  PERFORM set_config('app.bypass_profile_guards', 'on', true);

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
